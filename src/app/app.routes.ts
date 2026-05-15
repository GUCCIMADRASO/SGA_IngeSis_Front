import { Routes } from '@angular/router';
import { Inicio } from './component/inicio/inicio';
import { Registro } from './component/registro/registro';
import { Login } from './component/login/login';
import { Perfil } from './component/perfil/perfil';
import { Solicitudes } from './component/solicitudes/solicitudes';
import { CrearSolicitud } from './component/crear-solicitud/crear-solicitud';
import { DetalleSolicitud } from './component/detalle-solicitud/detalle-solicitud';
import { authGuard } from './servicios/auth.guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'inicio', component: Inicio },
  { path: 'registro', component: Registro },
  { path: 'login', component: Login },
  { path: 'perfil', component: Perfil, canActivate: [authGuard] },
  { path: 'solicitudes', component: Solicitudes, canActivate: [authGuard] },
  { path: 'crear-solicitud', component: CrearSolicitud, canActivate: [authGuard] },
  { path: 'detalle-solicitud/:id', component: DetalleSolicitud, canActivate: [authGuard] },
  { path: '**', pathMatch: 'full', redirectTo: '/' },
];
