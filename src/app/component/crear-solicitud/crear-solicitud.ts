import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Components & API
import { Card } from 'primeng/card';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { Message } from 'primeng/message';
import { Skeleton } from 'primeng/skeleton';
import { SharedModule, MessageService } from 'primeng/api';

// Components
import { Navbar } from '../navbar/navbar';

// Services y DTOs
import { SolicitudesService } from '../../servicios/solicitudes.service';
import { UsuariosService } from '../../servicios/usuarios.service';
import { CrearSolicitudRequest } from '../../modelos/solicitudes';
import { UsuarioDetalleResponse } from '../../modelos/usuarios';

@Component({
  selector: 'app-crear-solicitud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    Card,
    Textarea,
    Button,
    Select,
    Message,
    Skeleton,
    SharedModule,
    Navbar,
  ],
  templateUrl: './crear-solicitud.html',
  styleUrl: './crear-solicitud.css',
})
export class CrearSolicitud implements OnInit {
  private fb = inject(FormBuilder);
  private solicitudesService = inject(SolicitudesService);
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private messageService = inject(MessageService);

  solicitudForm!: FormGroup;
  isLoading = signal(false);
  cargandoPerfil = signal(true);
  result = signal<string>('');
  usuarioPerfil = signal<UsuarioDetalleResponse | null>(null);

  tiposSolicitudOptions = [
    {
      label: 'Registrar Asignatura',
      value: 'REGISTRAR_ASIGNATURA',
      description: 'Inscripción a una nueva materia',
      icon: 'pi pi-book',
    },
    {
      label: 'Homologación',
      value: 'HOMOLOGACION',
      description: 'Convalidación de asignaturas cursadas',
      icon: 'pi pi-sync',
    },
    {
      label: 'Cancelación de Asignatura',
      value: 'CANCELACION_ASIGNATURA',
      description: 'Retiro de una materia inscrita',
      icon: 'pi pi-times-circle',
    },
    {
      label: 'Solicitud de Cupo',
      value: 'SOLICITUD_CUPO',
      description: 'Petición de espacio en una materia',
      icon: 'pi pi-ticket',
    },
    {
      label: 'Consulta Académica',
      value: 'CONSULTA_ACADEMICA',
      description: 'Dudas sobre historial académico',
      icon: 'pi pi-question-circle',
    },
  ];

  ngOnInit(): void {
    this.solicitudForm = this.fb.group({
      tipo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });

    // Cargar perfil del usuario autenticado
    this.usuariosService.obtenerPerfil()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (perfil) => {
          this.usuarioPerfil.set(perfil);
          this.cargandoPerfil.set(false);
        },
        error: () => {
          this.cargandoPerfil.set(false);
          this.result.set('No se pudo cargar tu información de usuario. Por favor recarga la página.');
        },
      });
  }

  onSubmit(): void {
    if (this.solicitudForm.invalid || !this.usuarioPerfil()) {
      this.solicitudForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.result.set('');

    const perfil = this.usuarioPerfil()!;
    const dto: CrearSolicitudRequest = {
      tipo: this.solicitudForm.value.tipo,
      descripcion: this.solicitudForm.value.descripcion,
      documentoSolicitante: perfil.numeroDocumento,
      tipoDocumentoSolicitante: perfil.tipoDocumento,
    };

    this.solicitudesService.crear(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.result.set('¡Éxito! Solicitud creada exitosamente. Redirigiendo...');
          this.messageService.add({
            severity: 'success',
            summary: 'Solicitud Creada',
            detail: 'Su solicitud académica se ha radicado exitosamente.',
            life: 3000
          });
          setTimeout(() => {
            this.router.navigate(['/inicio']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading.set(false);
          const errorMsg = error.error?.mensaje || 'Error al crear la solicitud. Por favor intenta nuevamente.';
          this.result.set(errorMsg);
          this.messageService.add({
            severity: 'error',
            summary: 'Error al Radicar',
            detail: errorMsg,
            life: 4000
          });
        },
      });
  }

  getTipoIcon(tipo: string): string {
    const tipoEncontrado = this.tiposSolicitudOptions.find((t) => t.value === tipo);
    return tipoEncontrado?.icon || 'pi pi-file';
  }

  getDescripcionLength(): number {
    return this.solicitudForm.get('descripcion')?.value?.length || 0;
  }

  formatTipoDocumento(tipo: string): string {
    const tipos: Record<string, string> = {
      CEDULA: 'Cédula de Ciudadanía',
      TARJETA_DE_IDENTIDAD: 'Tarjeta de Identidad',
      TARJETA_EXTRANJERIA: 'Cédula de Extranjería',
      PASAPORTE: 'Pasaporte',
    };
    return tipos[tipo] || tipo;
  }
}
