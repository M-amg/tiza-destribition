import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import {
  AuthSession,
  AuthUser,
  loginRequest,
  logoutRequest,
  meRequest,
  refreshTokenRequest,
  registerRequest,
  RegisterPayload,
} from './authApi';
import { clearStoredSession, readStoredSession, storeSession } from './authStorage';

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  authorizedRequest: <T>(operation: (accessToken: string) => Promise<T>) => Promise<T>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);
  const sessionRef = useRef<AuthSession | null>(null);
  const refreshPromiseRef = useRef<Promise<AuthSession> | null>(null);

  const isAuthFailure = (error: unknown) => {
    if (!(error instanceof Error)) {
      return false;
    }

    return /status 401|status 403|unauthorized|forbidden/i.test(error.message);
  };

  const refreshSession = async (refreshToken: string) => {
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = (async () => {
        try {
          const refreshedSession = await refreshTokenRequest(refreshToken);
          sessionRef.current = refreshedSession;
          setSession(refreshedSession);
          await storeSession(refreshedSession);
          return refreshedSession;
        } finally {
          refreshPromiseRef.current = null;
        }
      })();
    }

    return refreshPromiseRef.current;
  };

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const storedSession = await readStoredSession();

        if (!storedSession) {
          if (!cancelled) {
            setIsReady(true);
          }
          return;
        }

        try {
          const user = await meRequest(storedSession.accessToken);
          const hydratedSession = { ...storedSession, user };

          if (!cancelled) {
            sessionRef.current = hydratedSession;
            setSession(hydratedSession);
          }

          await storeSession(hydratedSession);
        } catch {
          const refreshedSession = await refreshSession(storedSession.refreshToken);

          if (!cancelled) {
            sessionRef.current = refreshedSession;
            setSession(refreshedSession);
          }
        }
      } catch {
        await clearStoredSession();
        if (!cancelled) {
          sessionRef.current = null;
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const nextSession = await loginRequest(email, password);
    sessionRef.current = nextSession;
    setSession(nextSession);
    await storeSession(nextSession);
  };

  const signUp = async (payload: RegisterPayload) => {
    const nextSession = await registerRequest(payload);
    sessionRef.current = nextSession;
    setSession(nextSession);
    await storeSession(nextSession);
  };

  const authorizedRequest = async <T,>(operation: (accessToken: string) => Promise<T>) => {
    const currentSession = sessionRef.current;

    if (!currentSession?.accessToken) {
      throw new Error('You must be signed in to continue.');
    }

    try {
      return await operation(currentSession.accessToken);
    } catch (error) {
      if (!currentSession.refreshToken || !isAuthFailure(error)) {
        throw error;
      }

      try {
        const refreshedSession = await refreshSession(currentSession.refreshToken);
        return await operation(refreshedSession.accessToken);
      } catch (refreshError) {
        throw refreshError instanceof Error ? refreshError : error;
      }
    }
  };

  const signOut = async () => {
    const currentSession = sessionRef.current;

    try {
      if (currentSession) {
        await logoutRequest(currentSession.accessToken, currentSession.refreshToken);
      }
    } catch {
      // Clear local credentials even if the remote logout request fails.
    } finally {
      sessionRef.current = null;
      setSession(null);
      await clearStoredSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isReady,
        isAuthenticated: Boolean(session?.accessToken),
        session,
        user: session?.user ?? null,
        authorizedRequest,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
