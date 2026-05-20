import { Routes } from '@angular/router';
import { Inicio } from './component/inicio/inicio';
import { Registro } from './component/registro/registro';
import { Login } from './component/login/login';
import { Perfil } from './component/perfil/perfil';
import { Solicitudes } from './component/solicitudes/solicitudes';
import { CrearSolicitud } from './component/crear-solicitud/crear-solicitud';
import { DetalleSolicitud } from './component/detalle-solicitud/detalle-solicitud';
import { Unauthorized } from './component/unauthorized/unauthorized';
import { authGuard } from './servicios/auth.guard';
import { publicGuard } from './servicios/public.guard';
import { rolesGuard } from './servicios/roles.guard';

export const routes: Routes = [
  // Ruta por defecto y dashboard protegidas por autenticación
  { path: '', component: Inicio, canActivate: [authGuard] },
  { path: 'inicio', component: Inicio, canActivate: [authGuard] },
  
  // Rutas públicas de autenticación y registro (usuarios autenticados no pueden volver aquí)
  { path: 'registro', component: Registro, canActivate: [publicGuard] },
  { path: 'login', component: Login, canActivate: [publicGuard] },
  
  // Rutas privadas protegidas por autenticación
  { path: 'perfil', component: Perfil, canActivate: [authGuard] },
  { path: 'solicitudes', component: Solicitudes, canActivate: [authGuard] },
  
  // Ruta de creación restringida únicamente al rol ESTUDIANTE
  { 
    path: 'crear-solicitud', 
    component: CrearSolicitud, 
    canActivate: [authGuard, rolesGuard],
    data: { expectedRoles: ['ESTUDIANTE'] }
  },
  
  { path: 'detalle-solicitud/:id', component: DetalleSolicitud, canActivate: [authGuard] },
  
  // Ruta para acceso no autorizado y redirecciones
  { path: 'unauthorized', component: Unauthorized },
  { path: '**', pathMatch: 'full', redirectTo: '/' },
];
