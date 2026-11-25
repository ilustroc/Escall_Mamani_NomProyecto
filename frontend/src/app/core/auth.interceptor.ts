import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { API_URL } from './api.config';
export const authInterceptor:HttpInterceptorFn=(req,next)=>{
  const auth=inject(AuthService), router=inject(Router);
  const propia=req.url.startsWith(API_URL+'/');
  const publica=req.url===`${API_URL}/auth/login` || req.url.startsWith(`${API_URL}/publico/`);
  const s=auth.sesion();
  if(propia && !publica && s && auth.vigente()) req=req.clone({setHeaders:{Authorization:`Bearer ${s.token}`}});
  return next(req).pipe(catchError((e:unknown)=>{
    if(propia && !publica && e instanceof HttpErrorResponse && e.status===401){auth.limpiar(); void router.navigate(['/login'],{queryParams:{sesion:'vencida'}});}
    return throwError(()=>e);
  }));
};
