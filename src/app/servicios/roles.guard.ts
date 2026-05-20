import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Protege rutas que requieren roles específicos.
 * 1. Si el usuario no está autenticado, redirige a /login.
 * 2. Si está autenticado pero no tiene los roles esperados, redirige a /unauthorized.
 * 3. Si tiene el rol esperado, permite el acceso.
 */
export const rolesGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const expectedRoles: string[] = route.data?.['expectedRoles'] || [];
  if (expectedRoles.length === 0) {
    return true;
  }

  const userRoles = authService.getRoles();
  const hasRole = expectedRoles.some((role) => userRoles.includes(role));

  return hasRole ? true : router.createUrlTree(['/unauthorized']);
};
