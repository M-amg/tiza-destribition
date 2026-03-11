import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

export const guestGuard: CanActivateFn = () => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  authState.initialize();

  if (authState.hasAccessToken()) {
    return router.createUrlTree(['/profile']);
  }

  return true;
};
