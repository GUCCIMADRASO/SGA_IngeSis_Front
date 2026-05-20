import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Components
import { Navbar } from '../navbar/navbar';

// Services y DTOs
import { UsuariosService } from '../../servicios/usuarios.service';
import { SolicitudesService } from '../../servicios/solicitudes.service';
import { UsuarioResumenResponse } from '../../modelos/solicitudes';

interface Estadisticas {
  total: number;
  registradas: number;
  clasificadas: number;
  enAtencion: number;
  atendidas: number;
  cerradas: number;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TagModule,
    ButtonModule,
    ProgressSpinnerModule,
    Navbar,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private usuariosService = inject(UsuariosService);
  private solicitudesService = inject(SolicitudesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  usuario = signal<UsuarioResumenResponse | null>(null);
  cargando = signal(true);
  estadisticas = signal<Estadisticas>({
    total: 0,
    registradas: 0,
    clasificadas: 0,
    enAtencion: 0,
    atendidas: 0,
    cerradas: 0,
  });

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.cargando.set(true);

    this.usuariosService.obtenerPerfil()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (usuario) => {
          this.usuario.set(usuario);

          // Cargar estadísticas
          this.cargarEstadisticas();
        },
        error: (error) => {
          console.error('Error al cargar perfil:', error);
          this.cargando.set(false);
        },
      });
  }

  cargarEstadisticas(): void {
    // Cargar todas las solicitudes del usuario para calcular estadísticas
    this.solicitudesService.listarSolicitudesPaginadas(0, 1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const solicitudes = response.content;

          const stats: Estadisticas = {
            total: solicitudes.length,
            registradas: solicitudes.filter((s) => s.estado === 'REGISTRADA').length,
            clasificadas: solicitudes.filter((s) => s.estado === 'CLASIFICADA').length,
            enAtencion: solicitudes.filter((s) => s.estado === 'EN_ATENCION').length,
            atendidas: solicitudes.filter((s) => s.estado === 'ATENDIDA').length,
            cerradas: solicitudes.filter((s) => s.estado === 'CERRADA').length,
          };

          this.estadisticas.set(stats);
          this.cargando.set(false);
        },
        error: (error) => {
          console.error('Error al cargar estadísticas:', error);
          this.cargando.set(false);
        },
      });
  }

  getInitials(): string {
    if (!this.usuario()) return '';

    const nombre = this.usuario()!.nombre;
    const palabras = nombre.split(' ');

    if (palabras.length >= 2) {
      return palabras[0][0] + palabras[1][0];
    }

    return palabras[0][0] + (palabras[0][1] || '');
  }

  formatRol(rol: string): string {
    const roles: { [key: string]: string } = {
      ESTUDIANTE: 'Estudiante',
      DOCENTE: 'Docente',
      ADMINISTRATIVO: 'Administrativo',
      DIRECTIVO: 'Directivo',
    };
    return roles[rol] || rol;
  }

  getRolIcon(): string {
    if (!this.usuario()) return 'pi pi-user';

    const iconos: { [key: string]: string } = {
      ESTUDIANTE: 'pi pi-graduation-cap',
      DOCENTE: 'pi pi-book',
      ADMINISTRATIVO: 'pi pi-desktop',
      DIRECTIVO: 'pi pi-star',
    };
    return iconos[this.usuario()!.rol] || 'pi pi-user';
  }

  getRolSeverity(): 'success' | 'info' | 'danger' | 'warn' {
    if (!this.usuario()) return 'info';

    const severities: { [key: string]: 'success' | 'info' | 'danger' | 'warn' } = {
      ESTUDIANTE: 'info',
      DOCENTE: 'success',
      ADMINISTRATIVO: 'warn',
      DIRECTIVO: 'danger',
    };
    return severities[this.usuario()!.rol] || 'info';
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
  }

  cerrarSesion(): void {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
}
