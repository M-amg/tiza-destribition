import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Address } from '../models/address.model';
import { API_BASE_URL } from './api.config';

export interface AddressRequest {
  label?: string;
  recipientName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  defaultShipping: boolean;
  defaultBilling: boolean;
}

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly http = inject(HttpClient);
  private readonly addressBase = `${API_BASE_URL}/customer/addresses`;

  listMyAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.addressBase);
  }

  createAddress(request: AddressRequest): Observable<Address> {
    return this.http.post<Address>(this.addressBase, request);
  }

  updateAddress(id: string, request: AddressRequest): Observable<Address> {
    return this.http.put<Address>(`${this.addressBase}/${id}`, request);
  }

  deleteAddress(id: string): Observable<void> {
    return this.http.delete<void>(`${this.addressBase}/${id}`);
  }
}