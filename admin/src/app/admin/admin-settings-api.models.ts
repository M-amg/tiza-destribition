export type ApiSettingValueType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';

export interface ApiStoreSetting {
  id: string;
  key: string;
  valueType: ApiSettingValueType;
  value: string;
  description: string | null;
  isPublic: boolean;
  updatedAt: string;
}

export interface ApiStoreSettingUpsertRequest {
  key: string;
  valueType: ApiSettingValueType;
  value: string;
  description: string | null;
  isPublic: boolean;
}
