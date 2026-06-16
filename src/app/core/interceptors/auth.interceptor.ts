import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, tap } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';
import { ProblemDetail } from '../models/problem-detail.model';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notification = inject(NotificationService);
  const authService = inject(AuthService);
  
  // Tenta recuperar o token atualizado mais recentemente
  const xsrfToken = localStorage.getItem('XSRF-TOKEN');

  // Se for uma requisição de logout, prossegue sem a lógica de catchError/tap
  // MAS injeta o token atual se disponível
  let headers = req.headers;
  if (xsrfToken) {
    headers = headers.set('X-XSRF-TOKEN', xsrfToken);
  }

  const authReq = req.clone({
    withCredentials: true,
    headers: headers
  });

  if (req.url.includes('/usuarios/logout')) {
    return next(authReq);
  }

  return next(authReq).pipe(
    tap(event => {
      // Captura o token de resposta (Header ou Cookie) e atualiza o localStorage
      if (event instanceof HttpResponse) {
        let token = event.headers.get('X-XSRF-TOKEN');
        
        // Fallback: se não vier no header, tenta ler do Set-Cookie
        if (!token) {
          const cookieHeader = event.headers.get('Set-Cookie');
          if (cookieHeader && cookieHeader.includes('XSRF-TOKEN=')) {
            const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);
            token = match ? match[1] : null;
          }
        }

        if (token) {
          localStorage.setItem('XSRF-TOKEN', token);
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado.';
      let problemDetail: ProblemDetail | null = null;

      // Extração de detalhes do erro (Problem Detail RFC 7807)
      if (error.error && typeof error.error === 'object' && 'title' in error.error && 'status' in error.error) {
        problemDetail = error.error as ProblemDetail;
        errorMessage = problemDetail.detail || problemDetail.title || errorMessage;
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      if (error.status === 0) {
        notification.error('Sistema indisponível. Verifique sua conexão ou tente novamente mais tarde.');
      } else if (error.status === 401) {
        // Ignora 401 no login e no checkSession (/me) para evitar loops
        if (!req.url.includes('/usuarios/login') && !req.url.includes('/usuarios/me')) {
          notification.warn('Sua sessão expirou. Por favor, faça login novamente.');
          authService.clearLocalSession();
          router.navigate(['/login']);
        }
      } else if (error.status >= 500) {
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
