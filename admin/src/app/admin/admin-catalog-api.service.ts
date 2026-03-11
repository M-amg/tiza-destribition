import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api/api.config';
import {
  ApiCategory,
  ApiCategoryUpsertRequest,
  ApiProductDetail,
  ApiProductSummary,
  ApiProductUpsertRequest,
  ApiUploadedImage
} from './admin-catalog-api.models';

@Injectable({ providedIn: 'root' })
export class AdminCatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/admin`;

  allCategories(): Observable<ApiCategory[]> {
    return this.http.get<ApiCategory[]>(`${this.baseUrl}/categories`);
  }

  categoryById(id: string): Observable<ApiCategory> {
    return this.http.get<ApiCategory>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(payload: ApiCategoryUpsertRequest): Observable<ApiCategory> {
    return this.http.post<ApiCategory>(`${this.baseUrl}/categories`, payload);
  }

  updateCategory(id: string, payload: ApiCategoryUpsertRequest): Observable<ApiCategory> {
    return this.http.put<ApiCategory>(`${this.baseUrl}/categories/${id}`, payload);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}`);
  }

  allProducts(): Observable<ApiProductSummary[]> {
    return this.http.get<ApiProductSummary[]>(`${this.baseUrl}/products`);
  }

  productById(id: string): Observable<ApiProductDetail> {
    return this.http.get<ApiProductDetail>(`${this.baseUrl}/products/${id}`);
  }

  createProduct(payload: ApiProductUpsertRequest): Observable<ApiProductDetail> {
    return this.http.post<ApiProductDetail>(`${this.baseUrl}/products`, payload);
  }

  uploadProductImages(files: File[]): Observable<ApiUploadedImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<ApiUploadedImage[]>(`${this.baseUrl}/uploads/product-images`, formData);
  }

  uploadCategoryImage(file: File): Observable<ApiUploadedImage> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiUploadedImage>(`${this.baseUrl}/uploads/category-image`, formData);
  }

  updateProduct(id: string, payload: ApiProductUpsertRequest): Observable<ApiProductDetail> {
    return this.http.put<ApiProductDetail>(`${this.baseUrl}/products/${id}`, payload);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }
}
