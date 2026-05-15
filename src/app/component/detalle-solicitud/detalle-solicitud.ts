import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Components
import { Navbar } from '../navbar/navbar';

// Services y DTOs
import { SolicitudesService } from '../../servicios/solicitudes.service';
import { SolicitudDetalleResponse } from '../../modelos/solicitudes';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    MessageModule,
    DialogModule,
    ProgressSpinnerModule,
    Navbar,
  ],
  templateUrl: './detalle-solicitud.html',
  styleUrl: './detalle-solicitud.css',
})
export class DetalleSolicitud implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private solicitudesService = inject(SolicitudesService);
  private destroyRef = inject(DestroyRef);

  solicitud = signal<SolicitudDetalleResponse | null>(null);
  cargando = signal(true);

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.cargarSolicitud(param);
    } else {
      this.cargando.set(false);
    }
  }

  cargarSolicitud(codigo: string): void {
    this.cargando.set(true);
    this.solicitudesService
      .obtenerSolicitud(codigo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (solicitud) => {
          this.solicitud.set(solicitud);
          this.cargando.set(false);
        },
        error: (error) => {
          console.error('Error al cargar solicitud:', error);
          this.cargando.set(false);
        },
      });
  }

  formatTipo(tipo: string): string {
    const tipos: { [key: string]: string } = {
      REGISTRAR_ASIGNATURA: 'Registrar Asignatura',
      HOMOLOGACION: 'Homologación',
      CANCELACION_ASIGNATURA: 'Cancelación de Asignatura',
      SOLICITUD_CUPO: 'Solicitud de Cupo',
      CONSULTA_ACADEMICA: 'Consulta Académica',
    };
    return tipos[tipo] || tipo;
  }

  getTipoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      REGISTRAR_ASIGNATURA: 'pi pi-book',
      HOMOLOGACION: 'pi pi-sync',
      CANCELACION_ASIGNATURA: 'pi pi-times-circle',
      SOLICITUD_CUPO: 'pi pi-ticket',
      CONSULTA_ACADEMICA: 'pi pi-question-circle',
    };
    return iconos[tipo] || 'pi pi-file';
  }

  getEstadoSeverity(estado: string): 'success' | 'warn' | 'info' | 'danger' | 'secondary' {
    const severities: { [key: string]: 'success' | 'warn' | 'info' | 'danger' | 'secondary' } = {
      REGISTRADA: 'info',
      CLASIFICADA: 'warn',
      EN_ATENCION: 'warn',
      ATENDIDA: 'success',
      CERRADA: 'secondary',
    };
    return severities[estado] || 'info';
  }

  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      REGISTRADA: 'pi pi-inbox',
      CLASIFICADA: 'pi pi-tag',
      EN_ATENCION: 'pi pi-clock',
      ATENDIDA: 'pi pi-check',
      CERRADA: 'pi pi-lock',
    };
    return iconos[estado] || 'pi pi-info-circle';
  }

  volver(): void {
    this.router.navigate(['/solicitudes']);
  }
}
