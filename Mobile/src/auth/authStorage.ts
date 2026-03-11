import * as SecureStore from 'expo-secure-store';
import { AuthSession } from './authApi';

const AUTH_SESSION_KEY = 'tiza.auth.session';

export async function readStoredSession() {
  const rawValue = await SecureStore.getItemAsync(AUTH_SESSION_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
    return null;
  }
}

export function storeSession(session: AuthSession) {
  return SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  return SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}
