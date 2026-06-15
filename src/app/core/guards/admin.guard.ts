import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o usuário possui a role de ADMIN
  // A authority no backend é 'ROLE_ADMIN' ou 'ROLE_GESTOR'
  if (authService.hasRole('ADMIN') || authService.hasRole('GESTOR')) {
    return true;
  }

  // Se não for admin, redireciona para o dashboard
  router.navigate(['/dashboard']);
  return false;
};
