import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';

import { API_BASE_URL } from '../api/api.config';
import { AuthService } from './auth.service';

const AUTH_ENDPOINTS = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password']);

function isAuthEndpoint(url: string): boolean {
  if (!url.includes(API_BASE_URL)) {
    return false;
  }

  for (const endpoint of AUTH_ENDPOINTS) {
    if (url.includes(endpoint)) {
      return true;
    }
  }

  return false;
}

function withBearer(request: Parameters<HttpInterceptorFn>[0], token: string) {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const authEndpoint = isAuthEndpoint(request.url);
  const accessToken = auth.accessToken;

  const initialRequest = accessToken && !authEndpoint ? withBearer(request, accessToken) : request;

  return next(initialRequest).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || authEndpoint) {
        return throwError(() => error);
      }

      return auth.refreshAccessToken().pipe(
        switchMap((newToken) => next(withBearer(request, newToken))),
        catchError((refreshError) => {
          auth.clearSession();
          void router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
          return throwError(() => refreshError);
        })
      );
    })
  );
};
