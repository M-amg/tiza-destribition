import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule, Tag } from 'lucide-angular/src/icons';
import { forkJoin, of } from 'rxjs';

import {
  CouponApplicabilityView,
  CouponDiscountTypeView,
  CouponSegmentView,
  CouponView,
  mapApiCouponToView,
  toApiCouponUpsertRequest
} from '../admin-coupons-api.models';
import { AdminCouponsApiService } from '../admin-coupons-api.service';
import { AdminCatalogApiService } from '../admin-catalog-api.service';
import { ApiCategory, ApiProductSummary } from '../admin-catalog-api.models';

@Component({
  selector: 'app-coupon-form-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './coupon-form-page.component.html',
  styleUrl: './coupon-form-page.component.scss'
})
export class CouponFormPageComponent implements OnInit {
  readonly iconBack = ArrowLeft;
  readonly iconTag = Tag;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly couponsApi = inject(AdminCouponsApiService);
  private readonly catalogApi = inject(AdminCatalogApiService);

  private readonly couponId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = !!this.couponId;
  coupon?: CouponView;

  categories: ApiCategory[] = [];
  products: ApiProductSummary[] = [];

  loadingInitial = true;
  submitting = false;
  couponFound = true;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    discountType: ['percentage' as CouponDiscountTypeView],
    discountValue: [0, [Validators.required, Validators.min(0)]],
    maxDiscountCap: [0, Validators.min(0)],
    segment: ['all' as CouponSegmentView],
    applicability: ['entire' as CouponApplicabilityView],
    selectedCategories: [[] as string[]],
    selectedProducts: [[] as string[]],
    minimumOrderAmount: [0, Validators.min(0)],
    usageLimitTotal: [0, Validators.min(0)],
    usageLimitPerCustomer: [1, [Validators.required, Validators.min(1)]],
    startDate: ['', Validators.required],
    endDate: [''],
    statusActive: [true]
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  get discountType(): CouponDiscountTypeView {
    return this.form.controls.discountType.value;
  }

  get applicability(): CouponApplicabilityView {
    return this.form.controls.applicability.value;
  }

  get selectedCategoriesCount(): number {
    return this.form.controls.selectedCategories.value.length;
  }

  get selectedProductsCount(): number {
    return this.form.controls.selectedProducts.value.length;
  }

  get discountLabel(): string {
    const value = this.form.controls.discountValue.value;
    return this.discountType === 'percentage' ? `${value || 0}%` : `${value || 0} DH`;
  }

  get appliesToLabel(): string {
    if (this.applicability === 'entire') {
      return 'Entire Store';
    }

    if (this.applicability === 'categories') {
      return `${this.selectedCategoriesCount} Categories`;
    }

    return `${this.selectedProductsCount} Products`;
  }

  isCategorySelected(id: string): boolean {
    return this.form.controls.selectedCategories.value.includes(id);
  }

  isProductSelected(id: string): boolean {
    return this.form.controls.selectedProducts.value.includes(id);
  }

  toggleCategory(id: string): void {
    const current = this.form.controls.selectedCategories.value;
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    this.form.controls.selectedCategories.setValue(next);
  }

  toggleProduct(id: string): void {
    const current = this.form.controls.selectedProducts.value;
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    this.form.controls.selectedProducts.setValue(next);
  }

  toggleStatus(checked: boolean): void {
    this.form.controls.statusActive.setValue(checked);
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';

    if (this.form.invalid || this.loadingInitial || this.submitting) {
      return;
    }

    this.submitting = true;
    const payload = toApiCouponUpsertRequest(this.form.getRawValue());

    const request$ =
      this.isEdit && this.couponId
        ? this.couponsApi.updateCoupon(this.couponId, payload)
        : this.couponsApi.createCoupon(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        void this.router.navigateByUrl('/coupons');
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to save coupon.';
        this.submitting = false;
      }
    });
  }

  private loadInitialData(): void {
    this.loadingInitial = true;
    this.errorMessage = '';

    forkJoin({
      categories: this.catalogApi.allCategories(),
      products: this.catalogApi.allProducts(),
      coupon: this.isEdit && this.couponId ? this.couponsApi.couponById(this.couponId) : of(null)
    }).subscribe({
      next: ({ categories, products, coupon }) => {
        this.categories = categories;
        this.products = products;

        if (coupon) {
          this.couponFound = true;
          this.patchForm(mapApiCouponToView(coupon));
        }

        this.loadingInitial = false;
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.loadingInitial = false;
        this.couponFound = !(this.isEdit && error.status === 404);
        this.errorMessage =
          error.status === 404 ? 'Coupon not found.' : error.error?.message ?? 'Failed to load coupon form data.';
      }
    });
  }

  private patchForm(coupon: CouponView): void {
    this.coupon = coupon;
    this.form.patchValue({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description ?? '',
      discountType: coupon.type,
      discountValue: coupon.value,
      maxDiscountCap: coupon.maxDiscountCap ?? 0,
      segment: coupon.segment,
      applicability: coupon.applicability,
      selectedCategories: coupon.selectedCategories ?? [],
      selectedProducts: coupon.selectedProducts ?? [],
      minimumOrderAmount: coupon.minOrderAmount,
      usageLimitTotal: coupon.usageLimitTotal ?? 0,
      usageLimitPerCustomer: Math.max(coupon.usageLimitPerCustomer ?? 1, 1),
      startDate: coupon.startDate,
      endDate: coupon.endDate ?? '',
      statusActive: coupon.status === 'active'
    });
  }
}
