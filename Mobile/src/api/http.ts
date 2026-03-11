import { API_BASE_URL } from '../auth/authApi';

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

export async function apiRequest<T>(path: string, init?: RequestInit) {
  const { headers: initHeaders, ...restInit } = init ?? {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restInit,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(initHeaders ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function authenticatedRequest<T>(accessToken: string, path: string, init?: RequestInit) {
  return apiRequest<T>(path, {
    ...init,
    headers: {
      ...authHeaders(accessToken),
      ...(init?.headers ?? {}),
    },
  });
}
