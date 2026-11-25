import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateChildFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.clearSession();
    return router.createUrlTree(['/login'], { queryParams: { volver: state.url } });
  }

  const allowedRoles = route.data['roles'] as string[] | undefined;
  const currentRole = authService.sesion()?.usuario.rol;

  if (!allowedRoles || (currentRole && allowedRoles.includes(currentRole))) {
    return true;
  }

  return router.createUrlTree([homePathForRole(currentRole)]);
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.clearSession();
    return true;
  }

  return router.createUrlTree([homePathForRole(authService.sesion()?.usuario.rol)]);
};

function homePathForRole(role?: string): string {
  return role === 'ADMIN' || role === 'SUPERVISOR' ? '/dashboard' : '/clientes';
}
