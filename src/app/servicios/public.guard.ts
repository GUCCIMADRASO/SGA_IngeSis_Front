import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Protege rutas públicas (como login y registro).
 * Si el usuario ya está autenticado, redirige al Dashboard (/inicio).
 * Si no está autenticado, permite el acceso.
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated()
    ? router.createUrlTree(['/inicio'])
    : true;
};
