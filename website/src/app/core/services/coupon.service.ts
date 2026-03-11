import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Coupon } from '../models/coupon.model';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly http = inject(HttpClient);

  listActiveCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(`${API_BASE_URL}/coupons/active`);
  }
}