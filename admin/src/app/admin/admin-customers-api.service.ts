import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api/api.config';
import {
  ApiCustomerDetail,
  ApiCustomerSummary,
  ApiCustomerType,
  ApiUpdateCustomerTypeRequest
} from './admin-customers-api.models';
import { ApiOrder } from './admin-orders-api.models';

@Injectable({ providedIn: 'root' })
export class AdminCustomersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/admin/customers`;

  allCustomers(): Observable<ApiCustomerSummary[]> {
    return this.http.get<ApiCustomerSummary[]>(this.baseUrl);
  }

  customerById(id: string): Observable<ApiCustomerDetail> {
    return this.http.get<ApiCustomerDetail>(`${this.baseUrl}/${id}`);
  }

  ordersByCustomer(id: string): Observable<ApiOrder[]> {
    return this.http.get<ApiOrder[]>(`${this.baseUrl}/${id}/orders`);
  }

  updateCustomerType(id: string, customerType: ApiCustomerType): Observable<ApiCustomerDetail> {
    const payload: ApiUpdateCustomerTypeRequest = { customerType };
    return this.http.patch<ApiCustomerDetail>(`${this.baseUrl}/${id}/customer-type`, payload);
  }
}
