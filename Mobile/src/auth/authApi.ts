import { Platform } from 'react-native';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  customerType: 'B2B' | 'B2C';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  roles: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
};

export type RegisterPayload = {
  contactName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  businessName: string;
};

const DEFAULT_API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');

async function parseApiError(response: Response) {
  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    try {
      payload = await response.text();
    } catch {
      payload = null;
    }
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload?.message) {
    return payload.message;
  }

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    return String(payload.errors[0]);
  }

  if (payload?.errors && typeof payload.errors === 'object') {
    const firstError = Object.values(payload.errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return String(firstError[0]);
    }
    if (typeof firstError === 'string') {
      return firstError;
    }
  }

  return `Request failed with status ${response.status}`;
}

async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export function loginRequest(email: string, password: string) {
  return request<AuthSession>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function registerRequest(payload: RegisterPayload) {
  return request<AuthSession>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: payload.contactName,
      email: payload.email,
      password: payload.password,
      confirmPassword: payload.confirmPassword,
      customerType: 'B2B',
      phone: payload.phone || undefined,
      companyName: payload.businessName || undefined,
    }),
  });
}

export function refreshTokenRequest(refreshToken: string) {
  return request<AuthSession>('/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function meRequest(accessToken: string) {
  return request<AuthUser>('/api/v1/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function logoutRequest(accessToken: string, refreshToken: string) {
  return request<void>('/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
}
