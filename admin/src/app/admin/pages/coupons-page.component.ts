import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Copy, Edit, Eye, LucideAngularModule, Plus, Search, Trash2 } from 'lucide-angular/src/icons';

import {
  CouponSegmentView,
  CouponStatusView,
  CouponView,
  mapApiCouponToView
} from '../admin-coupons-api.models';
import { AdminCouponsApiService } from '../admin-coupons-api.service';

@Component({
  selector: 'app-coupons-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './coupons-page.component.html',
  styleUrl: './coupons-page.component.scss'
})
export class CouponsPageComponent implements OnInit {
  readonly iconSearch = Search;
  readonly iconPlus = Plus;
  readonly iconEdit = Edit;
  readonly iconDelete = Trash2;
  readonly iconCopy = Copy;
  readonly iconEye = Eye;

  private readonly couponsApi = inject(AdminCouponsApiService);

  searchTerm = '';
  statusFilter: 'all' | CouponStatusView = 'all';
  segmentFilter: 'all' | Exclude<CouponSegmentView, 'all'> = 'all';

  coupons: CouponView[] = [];
  loading = true;
  deletingId: string | null = null;
  errorMessage = '';

  readonly statusChipClass: Record<CouponStatusView, string> = {
    active: 'status-badge status-active',
    inactive: 'status-badge status-inactive',
    expired: 'status-badge status-expired'
  };

  ngOnInit(): void {
    this.loadCoupons();
  }

  get filteredCoupons(): CouponView[] {
    return this.coupons.filter((coupon) => {
      const query = this.searchTerm.toLowerCase();
      const matchesSearch =
        !query ||
        coupon.code.toLowerCase().includes(query) ||
        coupon.name.toLowerCase().includes(query);

      const matchesStatus = this.statusFilter === 'all' || coupon.status === this.statusFilter;
      const matchesSegment = this.segmentFilter === 'all' || coupon.segment === this.segmentFilter;

      return matchesSearch && matchesStatus && matchesSegment;
    });
  }

  get totalCoupons(): number {
    return this.coupons.length;
  }

  get activeCoupons(): number {
    return this.coupons.filter((coupon) => coupon.status === 'active').length;
  }

  get totalUsage(): number {
    return this.coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);
  }

  get activeB2BCoupons(): number {
    return this.coupons.filter((coupon) => coupon.segment === 'B2B' && coupon.status === 'active').length;
  }

  couponValueLabel(coupon: CouponView): string {
    return coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} DH`;
  }

  copyCode(code: string): void {
    void navigator.clipboard?.writeText(code);
  }

  deleteCoupon(coupon: CouponView): void {
    if (this.deletingId || !window.confirm(`Delete coupon "${coupon.code}"?`)) {
      return;
    }

    this.deletingId = coupon.id;
    this.errorMessage = '';

    this.couponsApi.deleteCoupon(coupon.id).subscribe({
      next: () => {
        this.coupons = this.coupons.filter((item) => item.id !== coupon.id);
        this.deletingId = null;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to delete coupon.';
        this.deletingId = null;
      }
    });
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private loadCoupons(): void {
    this.loading = true;
    this.errorMessage = '';

    this.couponsApi.allCoupons().subscribe({
      next: (coupons) => {
        this.coupons = coupons.map(mapApiCouponToView);
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load coupons.';
        this.loading = false;
      }
    });
  }
}
