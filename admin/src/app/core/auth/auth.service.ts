import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import {
  AuthResponse,
  AuthSession,
  AuthenticatedUser,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest
} from './auth.models';

const SESSION_STORAGE_KEY = 'tiza_admin_auth_session';
const ADMIN_ROLES = new Set(['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_SUPER_ADMIN']);

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly authBaseUrl = `${API_BASE_URL}/auth`;
  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(this.readStoredSession());

  private refreshRequest$: Observable<string> | null = null;

  readonly session$ = this.sessionSubject.asObservable();
  readonly user$ = this.session$.pipe(map((session) => session?.user ?? null));

  get session(): AuthSession | null {
    return this.sessionSubject.value;
  }

  get currentUser(): AuthenticatedUser | null {
    return this.session?.user ?? null;
  }

  get accessToken(): string | null {
    return this.session?.accessToken ?? null;
  }

  get refreshToken(): string | null {
    return this.session?.refreshToken ?? null;
  }

  hasValidAccessToken(): boolean {
    const session = this.session;
    return !!session && !this.isExpired(session);
  }

  hasAdminAccess(): boolean {
    return this.hasRequiredRole(this.currentUser?.roles ?? []);
  }

  ensureAuthenticated(): Observable<boolean> {
    const session = this.session;
    if (!session) {
      return of(false);
    }

    if (!this.isExpired(session)) {
      return of(this.hasRequiredRole(session.user.roles));
    }

    if (!session.refreshToken) {
      this.clearSession();
      return of(false);
    }

    return this.refreshAccessToken().pipe(
      map(() => this.hasAdminAccess()),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthenticatedUser> {
    return this.http.post<AuthResponse>(`${this.authBaseUrl}/login`, credentials).pipe(
      tap((response) => this.storeSession(response)),
      map((response) => response.user)
    );
  }

  refreshAccessToken(): Observable<string> {
    const refreshToken = this.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (!this.refreshRequest$) {
      const payload: RefreshTokenRequest = { refreshToken };
      this.refreshRequest$ = this.http.post<AuthResponse>(`${this.authBaseUrl}/refresh`, payload).pipe(
        tap((response) => this.storeSession(response)),
        map((response) => response.accessToken),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
        shareReplay(1)
      );
    }

    return this.refreshRequest$;
  }

  me(): Observable<AuthenticatedUser> {
    return this.http.get<AuthenticatedUser>(`${this.authBaseUrl}/me`).pipe(
      tap((user) => {
        const session = this.session;
        if (!session) {
          return;
        }

        const nextSession: AuthSession = { ...session, user };
        this.sessionSubject.next(nextSession);
        this.writeStoredSession(nextSession);
      })
    );
  }

  logout(revokeOnServer = true): Observable<void> {
    const refreshToken = this.refreshToken;
    if (!revokeOnServer || !refreshToken) {
      this.clearSession();
      return of(void 0);
    }

    const payload: LogoutRequest = { refreshToken };
    return this.http.post<void>(`${this.authBaseUrl}/logout`, payload).pipe(
      catchError(() => of(void 0)),
      tap(() => this.clearSession())
    );
  }

  logoutAndRedirect(returnUrl = '/login'): void {
    this.clearSession();
    void this.router.navigateByUrl(returnUrl);
  }

  clearSession(): void {
    this.sessionSubject.next(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  private storeSession(response: AuthResponse): void {
    const nextSession: AuthSession = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      tokenType: response.tokenType,
      expiresAt: Date.now() + response.expiresInSeconds * 1000,
      user: response.user
    };

    this.sessionSubject.next(nextSession);
    this.writeStoredSession(nextSession);
  }

  private hasRequiredRole(roles: string[]): boolean {
    return roles.some((role) => ADMIN_ROLES.has(role));
  }

  private isExpired(session: AuthSession): boolean {
    return Date.now() >= session.expiresAt;
  }

  private readStoredSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthSession;
      if (!parsed.accessToken || !parsed.refreshToken || !parsed.user) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      return parsed;
    } catch {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  }

  private writeStoredSession(session: AuthSession): void {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }
}
