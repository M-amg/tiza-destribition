import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);

  trackOrder(orderNumber: string): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/orders/track/${encodeURIComponent(orderNumber)}`);
  }

  listMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE_URL}/orders`);
  }

  getMyOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/orders/${id}`);
  }
}
