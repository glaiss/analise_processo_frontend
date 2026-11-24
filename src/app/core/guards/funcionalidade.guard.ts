import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const funcionalidadeGuard = (funcionalidade: string): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const verificar = (): boolean => {
    if (authService.hasRole('ADMIN') || authService.hasRole(funcionalidade)) {
      return true;
    }
    void router.navigate(['/dashboard']);
    return false;
  };

  if (authService.isAuthenticated()) {
    return verificar();
  }

  return authService.checkSession().pipe(
    take(1),
    map(() => verificar()),
    catchError(() => {
      void router.navigate(['/login']);
      return of(false);
    }),
  );
};
