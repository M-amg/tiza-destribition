export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscountCap: number | null;
  segment: string;
  applicability: string;
  minOrderAmount: number | null;
  usageLimitTotal: number | null;
  usageLimitPerCustomer: number | null;
  usedCount: number;
  startAt: string;
  endAt: string;
  status: string;
}