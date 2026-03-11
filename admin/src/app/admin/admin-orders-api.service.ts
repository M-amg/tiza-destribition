import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api/api.config';
import { ApiOrder, ApiUpdateOrderStatusRequest } from './admin-orders-api.models';

@Injectable({ providedIn: 'root' })
export class AdminOrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/admin/orders`;

  allOrders(): Observable<ApiOrder[]> {
    return this.http.get<ApiOrder[]>(this.baseUrl);
  }

  orderById(id: string): Observable<ApiOrder> {
    return this.http.get<ApiOrder>(`${this.baseUrl}/${id}`);
  }

  updateStatus(id: string, payload: ApiUpdateOrderStatusRequest): Observable<ApiOrder> {
    return this.http.patch<ApiOrder>(`${this.baseUrl}/${id}/status`, payload);
  }
}
