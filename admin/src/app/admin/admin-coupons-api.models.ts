export type ApiCouponDiscountType = 'NONE' | 'PERCENTAGE' | 'FIXED';
export type ApiCouponSegment = 'ALL' | 'B2B' | 'B2C';
export type ApiCouponApplicability = 'ENTIRE_STORE' | 'CATEGORIES' | 'PRODUCTS';
export type ApiCouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface ApiCoupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: ApiCouponDiscountType;
  discountValue: number;
  maxDiscountCap: number | null;
  segment: ApiCouponSegment;
  applicability: ApiCouponApplicability;
  minOrderAmount: number;
  usageLimitTotal: number | null;
  usageLimitPerCustomer: number;
  usedCount: number;
  startAt: string;
  endAt: string | null;
  status: ApiCouponStatus;
  categoryIds: string[];
  productIds: string[];
}

export interface ApiCouponUpsertRequest {
  code: string;
  name: string;
  description: string | null;
  discountType: ApiCouponDiscountType;
  discountValue: number;
  maxDiscountCap: number | null;
  segment: ApiCouponSegment;
  applicability: ApiCouponApplicability;
  minOrderAmount: number;
  usageLimitTotal: number | null;
  usageLimitPerCustomer: number;
  startAt: string;
  endAt: string | null;
  status: ApiCouponStatus;
  categoryIds: string[];
  productIds: string[];
}

export type CouponDiscountTypeView = 'percentage' | 'fixed';
export type CouponSegmentView = 'all' | 'B2B' | 'B2C';
export type CouponApplicabilityView = 'entire' | 'categories' | 'products';
export type CouponStatusView = 'active' | 'inactive' | 'expired';

export interface CouponView {
  id: string;
  code: string;
  name: string;
  description: string;
  type: CouponDiscountTypeView;
  value: number;
  maxDiscountCap?: number;
  segment: CouponSegmentView;
  applicability: CouponApplicabilityView;
  selectedCategories: string[];
  selectedProducts: string[];
  minOrderAmount: number;
  usageLimitTotal?: number;
  usageLimitPerCustomer?: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: CouponStatusView;
  startAt: string;
  endAt: string | null;
}

export function mapApiCouponToView(coupon: ApiCoupon): CouponView {
  return {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description ?? '',
    type: toCouponTypeView(coupon.discountType),
    value: Number(coupon.discountValue ?? 0),
    maxDiscountCap: coupon.maxDiscountCap == null ? undefined : Number(coupon.maxDiscountCap),
    segment: toCouponSegmentView(coupon.segment),
    applicability: toCouponApplicabilityView(coupon.applicability),
    selectedCategories: coupon.categoryIds ?? [],
    selectedProducts: coupon.productIds ?? [],
    minOrderAmount: Number(coupon.minOrderAmount ?? 0),
    usageLimitTotal: coupon.usageLimitTotal == null ? undefined : Number(coupon.usageLimitTotal),
    usageLimitPerCustomer:
      coupon.usageLimitPerCustomer == null ? undefined : Number(coupon.usageLimitPerCustomer),
    usedCount: Number(coupon.usedCount ?? 0),
    startDate: toDateInput(coupon.startAt),
    endDate: toDateInput(coupon.endAt),
    status: toCouponStatusView(coupon.status),
    startAt: coupon.startAt,
    endAt: coupon.endAt
  };
}

export function toApiCouponUpsertRequest(input: {
  code: string;
  name: string;
  description: string;
  discountType: CouponDiscountTypeView;
  discountValue: number;
  maxDiscountCap: number;
  segment: CouponSegmentView;
  applicability: CouponApplicabilityView;
  selectedCategories: string[];
  selectedProducts: string[];
  minimumOrderAmount: number;
  usageLimitTotal: number;
  usageLimitPerCustomer: number;
  startDate: string;
  endDate: string;
  statusActive: boolean;
}): ApiCouponUpsertRequest {
  return {
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    description: input.description.trim() || null,
    discountType: toApiCouponDiscountType(input.discountType),
    discountValue: Number(input.discountValue || 0),
    maxDiscountCap: input.maxDiscountCap > 0 ? Number(input.maxDiscountCap) : null,
    segment: toApiCouponSegment(input.segment),
    applicability: toApiCouponApplicability(input.applicability),
    minOrderAmount: Number(input.minimumOrderAmount || 0),
    usageLimitTotal: input.usageLimitTotal > 0 ? Number(input.usageLimitTotal) : null,
    usageLimitPerCustomer: Number(input.usageLimitPerCustomer || 1),
    startAt: toApiInstant(input.startDate),
    endAt: input.endDate ? toApiInstant(input.endDate) : null,
    status: input.statusActive ? 'ACTIVE' : 'INACTIVE',
    categoryIds: input.applicability === 'categories' ? input.selectedCategories : [],
    productIds: input.applicability === 'products' ? input.selectedProducts : []
  };
}

function toCouponTypeView(type: ApiCouponDiscountType): CouponDiscountTypeView {
  switch (type) {
    case 'FIXED':
      return 'fixed';
    case 'PERCENTAGE':
    case 'NONE':
      return 'percentage';
  }
}

function toCouponSegmentView(segment: ApiCouponSegment): CouponSegmentView {
  switch (segment) {
    case 'B2B':
      return 'B2B';
    case 'B2C':
      return 'B2C';
    case 'ALL':
      return 'all';
  }
}

function toCouponApplicabilityView(applicability: ApiCouponApplicability): CouponApplicabilityView {
  switch (applicability) {
    case 'CATEGORIES':
      return 'categories';
    case 'PRODUCTS':
      return 'products';
    case 'ENTIRE_STORE':
      return 'entire';
  }
}

function toCouponStatusView(status: ApiCouponStatus): CouponStatusView {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'INACTIVE':
      return 'inactive';
    case 'EXPIRED':
      return 'expired';
  }
}

function toApiCouponDiscountType(type: CouponDiscountTypeView): ApiCouponDiscountType {
  switch (type) {
    case 'fixed':
      return 'FIXED';
    case 'percentage':
      return 'PERCENTAGE';
  }
}

function toApiCouponSegment(segment: CouponSegmentView): ApiCouponSegment {
  switch (segment) {
    case 'B2B':
      return 'B2B';
    case 'B2C':
      return 'B2C';
    case 'all':
      return 'ALL';
  }
}

function toApiCouponApplicability(applicability: CouponApplicabilityView): ApiCouponApplicability {
  switch (applicability) {
    case 'categories':
      return 'CATEGORIES';
    case 'products':
      return 'PRODUCTS';
    case 'entire':
      return 'ENTIRE_STORE';
  }
}

function toDateInput(value: string | null): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().slice(0, 10);
}

function toApiInstant(dateInput: string): string {
  return `${dateInput}T00:00:00Z`;
}
