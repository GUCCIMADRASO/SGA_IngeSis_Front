import { Routes } from '@angular/router';
import { Inicio } from './component/inicio/inicio';
import { Registro } from './component/registro/registro';
import { Login } from './component/login/login';
import { Navbar } from './component/navbar/navbar';
import { Perfil } from './component/perfil/perfil';
import { Solicitudes } from './component/solicitudes/solicitudes';
import { CrearSolicitud } from './component/crear-solicitud/crear-solicitud';
import { DetalleSolicitud } from './component/detalle-solicitud/detalle-solicitud';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'registro', component: Registro },
  { path: 'login', component: Login },
  { path: '**', pathMatch: 'full', redirectTo: '/' },
];
