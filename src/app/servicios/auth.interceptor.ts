import { HttpInterceptorFn } from '@angular/common/http';

import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  // No enviar token en las rutas públicas de autenticación y registro
  const isAuthRoute = req.url.includes('/api/auth/login') || (req.url.includes('/api/usuarios') && req.method === 'POST');

  if (token && !isAuthRoute) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedReq).pipe(
      catchError(error => {
        // Token expirado o inválido -> cerrar sesión y redirigir
        if (error.status === 401) {
          localStorage.removeItem('auth_token');
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  // Si no hay token o es ruta pública, la dejamos pasar normal
  return next(req);
};
