import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from './auth.service';

export const adminAuthGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.ensureAuthenticated().pipe(
    map((isAllowed) =>
      isAllowed
        ? true
        : router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url }
          })
    )
  );
};
