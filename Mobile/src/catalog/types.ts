export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
};

export type CatalogProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  unit?: string;
  moq: number;
  stock: string;
  rating: number;
  reviews: number;
  featured: boolean;
  isNew: boolean;
  shortDescription?: string;
  brand?: string;
};

export type CatalogProductDetail = CatalogProduct & {
  description: string;
  specifications: Array<{ label: string; value: string }>;
  images: string[];
};

export type CatalogProductPage = {
  items: CatalogProduct[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
};
