import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ArrowLeft,
  DollarSign,
  Edit,
  Eye,
  LucideAngularModule,
  Tag,
  TrendingUp,
  Users
} from 'lucide-angular/src/icons';
import { forkJoin } from 'rxjs';

import {
  CouponStatusView,
  CouponView,
  mapApiCouponToView
} from '../admin-coupons-api.models';
import { AdminCouponsApiService } from '../admin-coupons-api.service';
import { AdminOrderView, UiOrderStatus, mapApiOrderToView } from '../admin-orders-api.models';
import { AdminOrdersApiService } from '../admin-orders-api.service';

@Component({
  selector: 'app-coupon-details-page',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './coupon-details-page.component.html',
  styleUrl: './coupon-details-page.component.scss'
})
export class CouponDetailsPageComponent implements OnInit {
  readonly iconBack = ArrowLeft;
  readonly iconTag = Tag;
  readonly iconTrend = TrendingUp;
  readonly iconUsers = Users;
  readonly iconDollar = DollarSign;
  readonly iconEye = Eye;
  readonly iconEdit = Edit;

  private readonly route = inject(ActivatedRoute);
  private readonly couponsApi = inject(AdminCouponsApiService);
  private readonly ordersApi = inject(AdminOrdersApiService);

  readonly couponId = this.route.snapshot.paramMap.get('id');
  coupon?: CouponView;
  relatedOrders: AdminOrderView[] = [];

  loading = true;
  errorMessage = '';

  readonly orderStatusChipClass: Record<UiOrderStatus, string> = {
    pending: 'status-badge status-pending',
    processing: 'status-badge status-processing',
    shipped: 'status-badge status-shipped',
    delivered: 'status-badge status-delivered',
    cancelled: 'status-badge status-cancelled'
  };

  readonly couponStatusChipClass: Record<CouponStatusView, string> = {
    active: 'status-badge status-active',
    inactive: 'status-badge status-inactive',
    expired: 'status-badge status-expired'
  };

  ngOnInit(): void {
    this.loadDetails();
  }

  get totalRevenue(): number {
    return this.relatedOrders.reduce((sum, order) => sum + order.total, 0);
  }

  get totalDiscount(): number {
    return this.relatedOrders.reduce((sum, order) => sum + (order.couponDiscount ?? 0), 0);
  }

  get uniqueCustomers(): number {
    return new Set(this.relatedOrders.map((order) => order.customerEmail)).size;
  }

  get averageOrderValue(): number {
    return this.relatedOrders.length ? this.totalRevenue / this.relatedOrders.length : 0;
  }

  get conversionRate(): number {
    if (!this.coupon?.usageLimitTotal || this.coupon.usageLimitTotal <= 0) {
      return 0;
    }

    return (this.coupon.usedCount / this.coupon.usageLimitTotal) * 100;
  }

  get remainingUses(): number {
    if (!this.coupon?.usageLimitTotal) {
      return 0;
    }

    return Math.max(this.coupon.usageLimitTotal - this.coupon.usedCount, 0);
  }

  couponValueLabel(): string {
    if (!this.coupon) {
      return '';
    }

    return this.coupon.type === 'percentage' ? `${this.coupon.value}%` : `${this.coupon.value} DH`;
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private loadDetails(): void {
    if (!this.couponId) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      coupon: this.couponsApi.couponById(this.couponId),
      orders: this.ordersApi.allOrders()
    }).subscribe({
      next: ({ coupon, orders }) => {
        this.coupon = mapApiCouponToView(coupon);
        this.relatedOrders = orders
          .map((order) => mapApiOrderToView(order))
          .filter((order) => order.couponCode === this.coupon?.code);
        this.loading = false;
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.errorMessage =
          error.status === 404 ? 'Coupon not found.' : error.error?.message ?? 'Failed to load coupon details.';
        this.loading = false;
      }
    });
  }
}
