import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SolicitudesService } from '../../servicios/solicitudes.service';
import { SolicitudResumenResponse } from '../../modelos/solicitudes';
import { Navbar } from '../navbar/navbar';

// IMPORTS DE PRIMENG
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { SharedModule } from 'primeng/api';

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    Navbar,
    // PrimeNG Components
    Card,
    Button,
    TableModule,
    Tag,
    InputText,
    Select,
    Tooltip,
    SharedModule,
  ],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class Solicitudes implements OnInit {
  private solicitudesService = inject(SolicitudesService);
  private router = inject(Router);

  // Signals
  solicitudes = signal<SolicitudResumenResponse[]>([]);
  loading = signal(false);
  totalRecords = signal(0);
  rows = signal(10);
  page = signal(0);

  // Filtros
  busqueda = '';
  filtroEstado: string | null = null;
  filtroTipo: string | null = null;
  filtroPrioridad: string | null = null;

  private busquedaTimeout: any;
  private initialLazyLoadBypassed = false;

  // Opciones de filtros
  estadosOptions: SelectOption[] = [
    { label: 'Registrada', value: 'REGISTRADA' },
    { label: 'Clasificada', value: 'CLASIFICADA' },
    { label: 'En Atención', value: 'EN_ATENCION' },
    { label: 'Atendida', value: 'ATENDIDA' },
    { label: 'Cerrada', value: 'CERRADA' },
  ];

  tiposOptions: SelectOption[] = [
    { label: 'Registrar Asignatura', value: 'REGISTRAR_ASIGNATURA' },
    { label: 'Homologación', value: 'HOMOLOGACION' },
    { label: 'Cancelación de Asignatura', value: 'CANCELACION_ASIGNATURA' },
    { label: 'Solicitud de Cupo', value: 'SOLICITUD_CUPO' },
    { label: 'Consulta Académica', value: 'CONSULTA_ACADEMICA' },
  ];

  prioridadesOptions: SelectOption[] = [
    { label: 'Alta', value: 'ALTO' },
    { label: 'Media', value: 'MEDIO' },
    { label: 'Baja', value: 'BAJO' },
  ];

  ngOnInit(): void {
    // Carga inicial para asegurar que funcione con navegación de historial 
    this.cargarSolicitudes();
    this.initialLazyLoadBypassed = true;
  }

  cargarSolicitudes(): void {
    this.loading.set(true);

    this.solicitudesService
      .listarSolicitudesPaginadas(
        this.page(),
        this.rows(),
        this.filtroEstado || undefined,
        this.filtroTipo || undefined,
        this.filtroPrioridad || undefined,
      )
      .subscribe({
        next: (pageResponse) => {
          // Si hay búsqueda, filtrar localmente por código
          let solicitudesFiltradas = pageResponse.content;

          if (this.busqueda.trim()) {
            solicitudesFiltradas = solicitudesFiltradas.filter((s) =>
              s.codigo.toLowerCase().includes(this.busqueda.toLowerCase()),
            );
          }

          this.solicitudes.set(solicitudesFiltradas);
          this.totalRecords.set(pageResponse.totalElements);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar solicitudes:', err);
          this.solicitudes.set([]);
          this.loading.set(false);
        },
      });
  }

  onBusquedaChange(): void {
    // Debounce para la búsqueda
    clearTimeout(this.busquedaTimeout);
    this.busquedaTimeout = setTimeout(() => {
      this.page.set(0); // Resetear a la primera página
      this.cargarSolicitudes();
    }, 500);
  }

  aplicarFiltros(): void {
    this.page.set(0); // Resetear a la primera página
    this.cargarSolicitudes();
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = null;
    this.filtroTipo = null;
    this.filtroPrioridad = null;
    this.page.set(0);
    this.cargarSolicitudes();
  }

  onPageChange(event: TableLazyLoadEvent): void {
    const newPage = event.first! / event.rows!;
    const newRows = event.rows!;

    // Si coincide con la carga inicial ya realizada por ngOnInit, evitamos la petición duplicada
    if (newPage === this.page() && newRows === this.rows() && this.initialLazyLoadBypassed) {
      return;
    }

    this.page.set(newPage);
    this.rows.set(newRows);
    this.initialLazyLoadBypassed = true;
    this.cargarSolicitudes();
  }

  recargarSolicitudes(): void {
    this.cargarSolicitudes();
  }

  hayFiltrosActivos(): boolean {
    return !!(this.busqueda || this.filtroEstado || this.filtroTipo || this.filtroPrioridad);
  }

  verDetalle(codigo: string): void {
    this.router.navigate(['/detalle-solicitud', codigo]);
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

  formatEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      REGISTRADA: 'Registrada',
      CLASIFICADA: 'Clasificada',
      EN_ATENCION: 'En Atención',
      ATENDIDA: 'Atendida',
      CERRADA: 'Cerrada',
    };
    return estados[estado] || estado;
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
