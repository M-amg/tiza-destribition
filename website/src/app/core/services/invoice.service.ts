import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { Invoice } from '../models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);

  listMyInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${API_BASE_URL}/invoices`);
  }

  getMyInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${API_BASE_URL}/invoices/${id}`);
  }
}