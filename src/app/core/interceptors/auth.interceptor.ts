import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { ProblemDetail } from '../models/problem-detail.model';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notification = inject(NotificationService);
  const authService = inject(AuthService);
  
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado.';
      let problemDetail: ProblemDetail | null = null;

      if (error.error && typeof error.error === 'object' && 'title' in error.error && 'status' in error.error) {
        problemDetail = error.error as ProblemDetail;
        errorMessage = problemDetail.detail || problemDetail.title || errorMessage;
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      if (error.status === 0) {
        notification.error('Sistema indisponível. Verifique sua conexão ou tente novamente mais tarde.');
      } else if (error.status === 401) {
        notification.warn('Sua sessão expirou ou não está autenticado. Por favor, faça login novamente.');
        authService.logout().subscribe({
          complete: () => router.navigate(['/login'])
        });
      } else if (error.status >= 500) {
        // Se o erro for 5xx e não houver um ProblemDetail detalhado, assume-se que o servidor está indisponível
        // ou houve um erro grave que não foi mapeado para um ProblemDetail.
        if (!problemDetail || (problemDetail && problemDetail.detail === 'Ocorreu um erro inesperado.')) {
          notification.error('Sistema indisponível. Por favor, tente novamente mais tarde.');
        } else {
          notification.error(`Erro no Servidor (${error.status}): ${errorMessage}`);
        }
      } else if (error.status >= 400) {
        notification.error(`Erro na Requisição (${error.status}): ${errorMessage}`);
      } else {
        notification.error(`Sistema: ${errorMessage}`);
      }
      
      return throwError(() => error);
    })
  );
};
