import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../core/api/api.config';
import { ApiStoreSetting, ApiStoreSettingUpsertRequest } from './admin-settings-api.models';

@Injectable({ providedIn: 'root' })
export class AdminSettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/admin/settings`;

  allSettings(): Observable<ApiStoreSetting[]> {
    return this.http.get<ApiStoreSetting[]>(this.baseUrl);
  }

  upsertSetting(payload: ApiStoreSettingUpsertRequest): Observable<ApiStoreSetting> {
    return this.http.post<ApiStoreSetting>(this.baseUrl, payload);
  }
}
