import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    return true;
  }
  
  // Si no hay token, redirigir al login
  router.navigate(['/login']);
  return false;
};
