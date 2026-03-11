import { API_BASE_URL } from '../auth/authApi';
import { CatalogCategory, CatalogProduct, CatalogProductDetail, CatalogProductPage } from './types';

type CategoryResponse = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number | null;
  productCount: number | null;
};

type ProductSummaryResponse = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  brand: string | null;
  imageUrl: string | null;
  b2cPrice: number;
  b2bPrice: number;
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
  stockQuantity: number | null;
  rating: number | null;
  reviewCount: number | null;
};

type ProductDetailResponse = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  brand: string | null;
  b2cPrice: number;
  b2bPrice: number;
  minB2BQuantity: number | null;
  inStock: boolean;
  stockQuantity: number | null;
  rating: number | null;
  reviewCount: number | null;
  featured: boolean;
  isNew: boolean;
  images: string[];
  specifications: Array<{ label: string; value: string }>;
};

type ProductPageResponse = {
  items: ProductSummaryResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
};

function stockLabel(inStock: boolean, stockQuantity: number | null) {
  if (!inStock || (stockQuantity ?? 0) <= 0) {
    return 'Out of Stock';
  }

  if ((stockQuantity ?? 0) <= 10) {
    return 'Low Stock';
  }

  return 'In Stock';
}

function parseUnit(specifications: Array<{ label: string; value: string }>) {
  const unitSpec = specifications.find((spec) => /pack size|weight per case/i.test(spec.label));
  if (!unitSpec) {
    return undefined;
  }

  if (/dozen|pieces|loaves/i.test(unitSpec.value)) {
    return 'pack';
  }

  if (/lbs|gallon|1l|bottles|pack/i.test(unitSpec.value)) {
    return 'case';
  }

  return undefined;
}

function normalizeImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return `${API_BASE_URL}/${imageUrl}`;
}

function mapCategory(category: CategoryResponse): CatalogCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    image: normalizeImageUrl(category.imageUrl),
    productCount: category.productCount ?? 0,
  };
}

function mapProductSummary(product: ProductSummaryResponse): CatalogProduct {
  return {
    id: product.id,
    name: product.name,
    image: normalizeImageUrl(product.imageUrl),
    price: Number(product.b2bPrice ?? product.b2cPrice ?? 0),
    moq: 1,
    stock: stockLabel(product.inStock, product.stockQuantity),
    rating: Number(product.rating ?? 0),
    reviews: product.reviewCount ?? 0,
    featured: product.featured,
    isNew: product.isNew,
    shortDescription: product.shortDescription ?? '',
    brand: product.brand ?? '',
  };
}

function mapProductDetail(product: ProductDetailResponse): CatalogProductDetail {
  return {
    id: product.id,
    name: product.name,
    image: normalizeImageUrl(product.images[0]),
    images: (product.images ?? []).map(normalizeImageUrl).filter(Boolean),
    price: Number(product.b2bPrice ?? product.b2cPrice ?? 0),
    unit: parseUnit(product.specifications),
    moq: product.minB2BQuantity ?? 1,
    stock: stockLabel(product.inStock, product.stockQuantity),
    rating: Number(product.rating ?? 0),
    reviews: product.reviewCount ?? 0,
    featured: product.featured,
    isNew: product.isNew,
    shortDescription: product.shortDescription ?? '',
    brand: product.brand ?? '',
    description: product.description,
    specifications: product.specifications ?? [],
  };
}

async function request<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Catalog request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

function buildProductsPageQuery({
  categoryId,
  page = 0,
  size = 20,
  search,
}: {
  categoryId?: string;
  page?: number;
  size?: number;
  search?: string;
}) {
  const params = new URLSearchParams();

  if (categoryId) {
    params.set('categoryId', categoryId);
  }

  if (search?.trim()) {
    params.set('q', search.trim());
  }

  params.set('page', String(page));
  params.set('size', String(size));

  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function fetchCatalogCategories() {
  const payload = await request<CategoryResponse[]>('/api/v1/categories');
  return payload.map(mapCategory);
}

export async function fetchCatalogProducts(categoryId?: string) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  const payload = await request<ProductSummaryResponse[]>(`/api/v1/products${query}`);
  return payload.map(mapProductSummary);
}

export async function fetchCatalogProductPage(options?: {
  categoryId?: string;
  page?: number;
  size?: number;
  search?: string;
}) {
  const payload = await request<ProductPageResponse>(
    `/api/v1/products/paged${buildProductsPageQuery(options ?? {})}`,
  );

  return {
    items: payload.items.map(mapProductSummary),
    page: payload.page,
    size: payload.size,
    totalItems: payload.totalItems,
    totalPages: payload.totalPages,
    hasNext: payload.hasNext,
  } satisfies CatalogProductPage;
}

export async function fetchCatalogProductDetail(productId: string) {
  const payload = await request<ProductDetailResponse>(`/api/v1/products/${productId}`);
  return mapProductDetail(payload);
}
