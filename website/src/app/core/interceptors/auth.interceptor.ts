import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStateService } from '../services/auth-state.service';
import { TokenStorageService } from '../services/token-storage.service';

const PUBLIC_REQUEST_PATTERNS = [
  '/api/v1/categories',
  '/api/v1/products',
  '/api/v1/products/paged',
  '/api/v1/products/brands',
  '/api/v1/settings/public',
  '/api/v1/coupons/active',
  '/api/v1/contact'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStorage = inject(TokenStorageService);
  const authState = inject(AuthStateService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  const token = tokenStorage.accessToken;
  const shouldAttachToken = Boolean(token) && !isPublicRequest(req.url);
  const authReq = shouldAttachToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
        authState.clearSession(false);
        if (isPlatformBrowser(platformId)) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};

function isPublicRequest(url: string): boolean {
  return PUBLIC_REQUEST_PATTERNS.some((pattern) => url.includes(pattern));
}
