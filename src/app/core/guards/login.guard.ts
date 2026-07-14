import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of, take } from 'rxjs';

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated in memory, redirect to dashboard
  if (authService.isAuthenticated()) {
    void router.navigate(['/dashboard']);
    return false;
  }

  // Check with server if session is valid
  return authService.checkSession().pipe(
    take(1),
    map(user => {
      if (user) {
        void router.navigate(['/dashboard']);
        return false;
      }
      return true;
    }),
    catchError(() => of(true)) // If session check fails, allow access to login
  );
};
