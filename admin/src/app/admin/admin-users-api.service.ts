import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api/api.config';
import {
  ApiAdminRole,
  ApiAdminUser,
  ApiAdminUserUpsertRequest,
  ApiUpdateAdminUserStatusRequest,
  ApiUserStatusUpdate
} from './admin-users-api.models';

@Injectable({ providedIn: 'root' })
export class AdminUsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/admin`;

  allUsers(): Observable<ApiAdminUser[]> {
    return this.http.get<ApiAdminUser[]>(`${this.baseUrl}/users`);
  }

  userById(userId: string): Observable<ApiAdminUser> {
    return this.http.get<ApiAdminUser>(`${this.baseUrl}/users/${userId}`);
  }

  allRoles(): Observable<ApiAdminRole[]> {
    return this.http.get<ApiAdminRole[]>(`${this.baseUrl}/roles`);
  }

  createUser(payload: ApiAdminUserUpsertRequest): Observable<ApiAdminUser> {
    return this.http.post<ApiAdminUser>(`${this.baseUrl}/users`, payload);
  }

  updateUser(userId: string, payload: ApiAdminUserUpsertRequest): Observable<ApiAdminUser> {
    return this.http.put<ApiAdminUser>(`${this.baseUrl}/users/${userId}`, payload);
  }

  updateStatus(userId: string, status: ApiUserStatusUpdate): Observable<ApiAdminUser> {
    const payload: ApiUpdateAdminUserStatusRequest = { status };
    return this.http.patch<ApiAdminUser>(`${this.baseUrl}/users/${userId}/status`, payload);
  }
}
