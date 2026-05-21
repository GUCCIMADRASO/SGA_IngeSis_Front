import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = authService.getToken();

  // No enviar token en las rutas públicas de autenticación y registro
  const isAuthRoute = req.url.includes('/api/auth/login') || (req.url.includes('/api/usuarios') && req.method === 'POST');

  if (token && !isAuthRoute) {
    let clonedReq;
    if (req.method === 'GET') {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        setParams: {
          _t: new Date().getTime().toString()
        }
      });
    } else {
      clonedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next(clonedReq).pipe(
      catchError(error => {
        // Token expirado o inválido, cierra sesión y redirige
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  // Si no hay token o es ruta pública, deja pasar
  return next(req);
};
