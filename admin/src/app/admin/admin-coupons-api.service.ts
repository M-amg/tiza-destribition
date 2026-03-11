import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api/api.config';
import { ApiCoupon, ApiCouponUpsertRequest } from './admin-coupons-api.models';

@Injectable({ providedIn: 'root' })
export class AdminCouponsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/admin/coupons`;

  allCoupons(): Observable<ApiCoupon[]> {
    return this.http.get<ApiCoupon[]>(this.baseUrl);
  }

  couponById(id: string): Observable<ApiCoupon> {
    return this.http.get<ApiCoupon>(`${this.baseUrl}/${id}`);
  }

  createCoupon(payload: ApiCouponUpsertRequest): Observable<ApiCoupon> {
    return this.http.post<ApiCoupon>(this.baseUrl, payload);
  }

  updateCoupon(id: string, payload: ApiCouponUpsertRequest): Observable<ApiCoupon> {
    return this.http.put<ApiCoupon>(`${this.baseUrl}/${id}`, payload);
  }

  deleteCoupon(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
