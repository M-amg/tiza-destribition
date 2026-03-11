import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactMessageRequest, ContactMessageResponse } from '../models/contact.model';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  sendMessage(request: ContactMessageRequest): Observable<ContactMessageResponse> {
    return this.http.post<ContactMessageResponse>(`${API_BASE_URL}/contact`, request);
  }
}