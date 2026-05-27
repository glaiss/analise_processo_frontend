import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, of, catchError } from 'rxjs';

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated in memory, redirect to dashboard
  if (authService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  // Check with server if session is valid
  return authService.checkSession().pipe(
    take(1),
    map(user => {
      if (user) {
        router.navigate(['/dashboard']);
        return false;
      }
      return true;
    }),
    catchError(() => of(true)) // If session check fails, allow access to login
  );
};
