import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard:CanActivateFn=(route,state)=>{
  const a=inject(AuthService),r=inject(Router);
  if(!a.vigente()){a.limpiar();return r.createUrlTree(['/login'],{queryParams:{volver:state.url}});}
  const roles=route.data['roles'] as string[]|undefined;
  return !roles || roles.includes(a.sesion()!.usuario.rol) ? true : r.createUrlTree(['/clientes']);
};
