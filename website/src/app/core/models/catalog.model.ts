export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder?: number | null;
  productCount?: number | null;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  brand: string;
  imageUrl: string | null;
  b2cPrice: number;
  b2bPrice: number;
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  brand: string;
  sku: string;
  barcode: string | null;
  b2cPrice: number;
  b2bPrice: number;
  originalPrice: number | null;
  discountValue: number | null;
  discountType: string;
  discountAppliesTo: string;
  minB2BQuantity: number | null;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  isNew: boolean;
  status: string;
  category: Category;
  images: string[];
  specifications: ProductSpecification[];
}

export interface ProductPage {
  items: ProductSummary[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
}
