import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notification = inject(NotificationService);
  
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthCheck = req.url.includes('/usuarios/me');
      const isLogin = req.url.includes('/usuarios/login');
      
      if (error.status === 401 && !isAuthCheck && !isLogin) {
        router.navigate(['/login']);
      } else if (error.status === 500) {
        notification.error('Erro interno do servidor. Por favor, tente novamente mais tarde.');
      } else if (error.status !== 401) {
        const message = error.error?.message || error.message || 'Ocorreu um erro inesperado';
        notification.error(`Sistema: ${message}`);
      }
      
      return throwError(() => error);
    })
  );
};
