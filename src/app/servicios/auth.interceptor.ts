import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtenemos el token del localStorage
  const token = localStorage.getItem('auth_token');

  // Si tenemos token, clonamos la petición y le inyectamos la cabecera Authorization
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // Si no hay token, la dejamos pasar normal (por ejemplo, el login)
  return next(req);
};
