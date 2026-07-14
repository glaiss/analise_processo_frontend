import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated in memory, allow
  if (authService.isAuthenticated()) {
    return true;
  }

  // Otherwise check with server
  return authService.checkSession().pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      } else {
        void router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      void router.navigate(['/login']);
      return of(false);
    })
  );
};
