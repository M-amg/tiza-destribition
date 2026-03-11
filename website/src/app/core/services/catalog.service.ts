import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, ProductDetail, ProductPage, ProductSummary } from '../models/catalog.model';
import { API_BASE_URL } from './api.config';

export interface ProductPageQuery {
  categoryIds?: string[];
  brands?: string[];
  q?: string;
  stock?: 'all' | 'inStock' | 'outOfStock';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'priceLow' | 'priceHigh' | 'newest' | 'rating' | 'stockHigh' | 'stockLow';
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  listCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories`);
  }

  listProducts(categoryId?: string): Observable<ProductSummary[]> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    return this.http.get<ProductSummary[]>(`${API_BASE_URL}/products`, { params });
  }

  listProductsPage(query: ProductPageQuery): Observable<ProductPage> {
    let params = new HttpParams();

    for (const categoryId of query.categoryIds ?? []) {
      params = params.append('categoryId', categoryId);
    }

    for (const brand of query.brands ?? []) {
      params = params.append('brand', brand);
    }

    if (query.q?.trim()) {
      params = params.set('q', query.q.trim());
    }
    if (query.stock && query.stock !== 'all') {
      params = params.set('stock', query.stock);
    }
    if (query.minPrice != null) {
      params = params.set('minPrice', query.minPrice);
    }
    if (query.maxPrice != null) {
      params = params.set('maxPrice', query.maxPrice);
    }
    if (query.sortBy) {
      params = params.set('sortBy', query.sortBy);
    }
    params = params.set('page', query.page ?? 0);
    params = params.set('size', query.size ?? 12);

    return this.http.get<ProductPage>(`${API_BASE_URL}/products/paged`, { params });
  }

  listBrands(categoryIds?: string[]): Observable<string[]> {
    let params = new HttpParams();
    for (const categoryId of categoryIds ?? []) {
      params = params.append('categoryId', categoryId);
    }
    return this.http.get<string[]>(`${API_BASE_URL}/products/brands`, { params });
  }

  getProductById(id: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${API_BASE_URL}/products/${id}`);
  }

  getProductBySlug(slug: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`${API_BASE_URL}/products/slug/${slug}`);
  }
}
