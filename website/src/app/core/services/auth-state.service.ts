import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { AuthResponse, AuthUser } from '../models/auth.model';
import {
  AuthApiService,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest
} from './auth-api.service';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly router = inject(Router);

  readonly user = signal<AuthUser | null>(null);
  readonly loading = signal(false);
  readonly initialized = signal(false);

  readonly isAuthenticated = computed(() => Boolean(this.tokenStorage.accessToken && this.user()));
  readonly customerType = computed(() => this.user()?.customerType ?? 'B2C');
  readonly isB2B = computed(() => this.customerType() === 'B2B');

  initialize(): void {
    if (this.initialized()) {
      return;
    }

    const token = this.tokenStorage.accessToken;
    if (!token) {
      this.initialized.set(true);
      return;
    }

    this.loading.set(true);
    this.authApi
      .me()
      .pipe(
        tap((me) => {
          this.user.set(me);
          this.initialized.set(true);
          this.loading.set(false);
        }),
        catchError(() => {
          this.clearSession(false);
          this.initialized.set(true);
          this.loading.set(false);
          return of(null);
        })
      )
      .subscribe();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.authApi.login(request).pipe(
      tap((response) => {
        this.applyAuthResponse(response);
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.authApi.register(request).pipe(
      tap((response) => {
        this.applyAuthResponse(response);
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.authApi.forgotPassword(request);
  }

  logout(redirectToLogin = true): void {
    const refreshToken = this.tokenStorage.refreshToken;
    if (refreshToken) {
      this.authApi
        .logout({ refreshToken })
        .pipe(catchError(() => of(void 0)))
        .subscribe();
    }

    this.clearSession(redirectToLogin);
  }

  clearSession(redirectToLogin = false): void {
    this.tokenStorage.clear();
    this.user.set(null);
    this.initialized.set(true);

    if (redirectToLogin) {
      this.router.navigate(['/login']);
    }
  }

  hasAccessToken(): boolean {
    return Boolean(this.tokenStorage.accessToken);
  }

  refreshProfile(): void {
    if (!this.tokenStorage.accessToken) {
      this.user.set(null);
      return;
    }

    this.authApi
      .me()
      .pipe(
        tap((me) => this.user.set(me)),
        catchError(() => {
          this.clearSession(false);
          return of(null);
        })
      )
      .subscribe();
  }

  accountBaseRoute(): string {
    return '/profile';
  }

  accountRoute(section?: 'orders' | 'company' | 'invoices'): string {
    const baseRoute = this.accountBaseRoute();
    return section ? `${baseRoute}/${section}` : baseRoute;
  }

  private applyAuthResponse(response: AuthResponse): void {
    this.tokenStorage.saveTokens(response.accessToken, response.refreshToken);
    this.user.set(response.user);
    this.initialized.set(true);
  }
}
