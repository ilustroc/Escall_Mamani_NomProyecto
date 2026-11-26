import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isApiRequest = req.url.startsWith(`${API_URL}/`);
  const isPublicRequest =
    req.url === `${API_URL}/auth/login` || req.url.startsWith(`${API_URL}/publico/`);
  const currentSession = authService.sesion();

  if (isApiRequest && !isPublicRequest && currentSession && authService.isAuthenticated()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${currentSession.token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: unknown) => {
      if (isApiRequest && !isPublicRequest && error instanceof HttpErrorResponse && error.status === 401 && currentSession) {
        authService.clearSession();
        void router.navigate(['/login'], { queryParams: { sesion: 'vencida' } });
      }
      return throwError(() => error);
    })
  );
};
