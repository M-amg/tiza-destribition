export type ApiProductStatus = 'ACTIVE' | 'DISABLED';
export type ApiDiscountType = 'NONE' | 'PERCENTAGE' | 'FIXED';
export type ApiDiscountAppliesTo = 'B2C' | 'B2B' | 'BOTH';
export type ApiCategoryStatus = 'ACTIVE' | 'INACTIVE';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder?: number | null;
  status?: ApiCategoryStatus;
  parentId?: string | null;
  productCount?: number;
}

export interface ApiProductSummary {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  brand: string;
  sku: string;
  imageUrl: string | null;
  categoryId: string;
  categoryName: string;
  costPrice: number;
  b2cPrice: number;
  b2bPrice: number;
  stockQuantity: number;
  minimumStockLevel: number;
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
  status: ApiProductStatus;
  updatedAt: string;
}

export interface ApiProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  brand: string;
  sku: string;
  barcode: string | null;
  costPrice: number;
  b2cPrice: number;
  b2bPrice: number;
  originalPrice: number | null;
  discountValue: number | null;
  discountType: ApiDiscountType;
  discountAppliesTo: ApiDiscountAppliesTo;
  minB2BQuantity: number | null;
  stockQuantity: number;
  minimumStockLevel: number;
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  status: ApiProductStatus;
  category: ApiCategory;
  images: string[];
}

export interface ApiProductUpsertRequest {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  brand: string;
  sku: string;
  barcode: string | null;
  costPrice: number;
  b2cPrice: number;
  b2bPrice: number;
  originalPrice: number | null;
  discountType: ApiDiscountType;
  discountValue: number | null;
  discountAppliesTo: ApiDiscountAppliesTo;
  minB2BQuantity: number;
  stockQuantity: number;
  minimumStockLevel: number;
  featured: boolean;
  isNew: boolean;
  status: ApiProductStatus;
  images: string[];
}

export interface ApiUploadedImage {
  url: string;
  fileName: string;
  size: number;
  contentType: string;
}

export interface ApiCategoryUpsertRequest {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  status: ApiCategoryStatus;
  parentId: string | null;
}
