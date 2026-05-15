import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../servicios/usuarios.service';
import { SolicitudesService } from '../../servicios/solicitudes.service';
import { UsuarioDetalleResponse } from '../../modelos/usuarios';
import { SolicitudResumenResponse } from '../../modelos/solicitudes';
import { Navbar } from '../navbar/navbar';

// ✨ IMPORTS DE PRIMENG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

interface Estadisticas {
  total: number;
  registradas: number;
  clasificadas: number;
  enAtencion: number;
  atendidas: number;
  cerradas: number;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Navbar,
    // PrimeNG Modules
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  private usuariosService = inject(UsuariosService);
  private solicitudesService = inject(SolicitudesService);
  private router = inject(Router);

  usuario = signal<UsuarioDetalleResponse | null>(null);
  solicitudesRecientes = signal<SolicitudResumenResponse[]>([]);
  estadisticas = signal<Estadisticas>({
    total: 0,
    registradas: 0,
    clasificadas: 0,
    enAtencion: 0,
    atendidas: 0,
    cerradas: 0,
  });

  loadingStats = signal(true);
  loadingSolicitudes = signal(true);
  fechaActual = '';

  ngOnInit(): void {
    this.setFechaActual();
    this.cargarUsuario();
    this.cargarSolicitudesRecientes();
    this.cargarEstadisticas();
  }

  setFechaActual(): void {
    const fecha = new Date();
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    this.fechaActual = fecha.toLocaleDateString('es-ES', opciones);
  }

  cargarUsuario(): void {
    this.usuariosService.obtenerPerfil().subscribe({
      next: (data) => {
        this.usuario.set(data);
      },
      error: (err) => {
        console.error('Error al cargar usuario:', err);
      },
    });
  }

  cargarSolicitudesRecientes(): void {
    this.loadingSolicitudes.set(true);

    // Obtener las últimas 5 solicitudes (página 0, tamaño 5)
    this.solicitudesService.listarSolicitudesPaginadas(0, 5).subscribe({
      next: (page) => {
        this.solicitudesRecientes.set(page.content);
        this.loadingSolicitudes.set(false);
      },
      error: (err) => {
        console.error('Error al cargar solicitudes recientes:', err);
        this.solicitudesRecientes.set([]);
        this.loadingSolicitudes.set(false);
      },
    });
  }

  cargarEstadisticas(): void {
    this.loadingStats.set(true);

    // Cargar todas las solicitudes para calcular estadísticas
    // En un caso real, el backend debería proveer un endpoint de estadísticas
    this.solicitudesService.listarSolicitudesPaginadas(0, 1000).subscribe({
      next: (page) => {
        const solicitudes = page.content;

        const stats: Estadisticas = {
          total: page.totalElements,
          registradas: solicitudes.filter((s) => s.estado === 'REGISTRADA').length,
          clasificadas: solicitudes.filter((s) => s.estado === 'CLASIFICADA').length,
          enAtencion: solicitudes.filter((s) => s.estado === 'EN_ATENCION').length,
          atendidas: solicitudes.filter((s) => s.estado === 'ATENDIDA').length,
          cerradas: solicitudes.filter((s) => s.estado === 'CERRADA').length,
        };

        this.estadisticas.set(stats);
        this.loadingStats.set(false);
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.loadingStats.set(false);
      },
    });
  }

  verDetalle(codigo: string): void {
    this.router.navigate(['/detalle-solicitud', codigo]);
  }

  irACrearSolicitud(): void {
    this.router.navigate(['/crear-solicitud']);
  }

  irASolicitudes(): void {
    this.router.navigate(['/solicitudes']);
  }

  irAPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  formatTipo(tipo: string): string {
    const tiposMap: { [key: string]: string } = {
      REGISTRAR_ASIGNATURA: 'Registrar Asignatura',
      HOMOLOGACION: 'Homologación',
      CANCELACION_ASIGNATURA: 'Cancelación de Asignatura',
      SOLICITUD_CUPO: 'Solicitud de Cupo',
      CONSULTA_ACADEMICA: 'Consulta Académica',
    };
    return tiposMap[tipo] || tipo;
  }

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severityMap: { [key: string]: 'success' | 'info' | 'warn' | 'danger' | 'secondary' } = {
      REGISTRADA: 'info',
      CLASIFICADA: 'warn',
      EN_ATENCION: 'warn',
      ATENDIDA: 'success',
      CERRADA: 'secondary',
    };
    return severityMap[estado] || 'info';
  }

  getEstadoIcon(estado: string): string {
    const iconMap: { [key: string]: string } = {
      REGISTRADA: 'pi pi-inbox',
      CLASIFICADA: 'pi pi-tag',
      EN_ATENCION: 'pi pi-clock',
      ATENDIDA: 'pi pi-check',
      CERRADA: 'pi pi-lock',
    };
    return iconMap[estado] || 'pi pi-circle';
  }
}
