import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api/api.config';
import { ApiStockAdjustmentRequest, ApiStockMovement } from './admin-inventory-api.models';

@Injectable({ providedIn: 'root' })
export class AdminInventoryApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/admin/inventory`;

  allMovements(): Observable<ApiStockMovement[]> {
    return this.http.get<ApiStockMovement[]>(`${this.baseUrl}/movements`);
  }

  adjustStock(payload: ApiStockAdjustmentRequest): Observable<ApiStockMovement> {
    return this.http.post<ApiStockMovement>(`${this.baseUrl}/adjust`, payload);
  }
}
