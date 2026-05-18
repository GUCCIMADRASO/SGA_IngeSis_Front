import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';

// Components
import { Navbar } from '../navbar/navbar';

// Services y DTOs
import { SolicitudesService } from '../../servicios/solicitudes.service';
import { UsuariosService } from '../../servicios/usuarios.service';
import { SolicitudDetalleResponse } from '../../modelos/solicitudes';
import { UsuarioDetalleResponse } from '../../modelos/usuarios';

@Component({
  selector: 'app-detalle-solicitud',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    MessageModule,
    DialogModule,
    ProgressSpinnerModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    Navbar,
  ],
  templateUrl: './detalle-solicitud.html',
  styleUrl: './detalle-solicitud.css',
})
export class DetalleSolicitud implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private solicitudesService = inject(SolicitudesService);
  private usuariosService = inject(UsuariosService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  solicitud = signal<SolicitudDetalleResponse | null>(null);
  cargando = signal(true);
  rolUsuario = signal<string>('');

  // Modales
  mostrarModalAdmin = signal(false);
  mostrarModalDocente = signal(false);
  mostrarModalEstudiante = signal(false);
  accionActual = signal<'ATENDER' | 'CERRAR' | 'RECHAZAR' | null>(null);
  enviando = signal(false);
  mensajeError = signal('');

  responsablesOptions = signal<{label: string, value: UsuarioDetalleResponse}[]>([]);

  adminForm!: FormGroup;
  docenteForm!: FormGroup;
  estudianteForm!: FormGroup;

  prioridadesOptions = [
    { label: 'Alta', value: 'ALTO' },
    { label: 'Media', value: 'MEDIO' },
    { label: 'Baja', value: 'BAJO' },
  ];

  tiposDocumentoOptions = [
    { label: 'Cédula de Ciudadanía', value: 'CEDULA' },
    { label: 'Tarjeta de Identidad', value: 'TARJETA_DE_IDENTIDAD' },
    { label: 'Cédula de Extranjería', value: 'TARJETA_EXTRANJERIA' },
    { label: 'Pasaporte', value: 'PASAPORTE' },
  ];

  ngOnInit(): void {
    // Inicializar formularios
    this.adminForm = this.fb.group({
      prioridad: ['', Validators.required],
      justificacion: ['', Validators.required],
      responsableSeleccionado: [null, Validators.required],
    });

    this.docenteForm = this.fb.group({
      observacion: ['', Validators.required],
    });

    this.estudianteForm = this.fb.group({
      observacion: ['', Validators.required],
    });

    // Cargar perfil para obtener rol
    this.usuariosService.obtenerPerfil().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (perfil) => {
        this.rolUsuario.set(perfil.rol);
        this.iniciarCargaSolicitud();
      },
      error: () => this.iniciarCargaSolicitud() // Fallback
    });
  }

  iniciarCargaSolicitud(): void {
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
        error: (err: any) => {
          console.error('Error al cargar solicitud:', err);
          this.cargando.set(false);
        },
      });
  }

  // ---- LÓGICA ADMINISTRATIVO ----
  abrirModalAdmin(): void {
    this.mensajeError.set('');
    this.adminForm.reset();
    
    // Cargar responsables
    this.usuariosService.obtenerResponsables().subscribe({
      next: (res) => {
        const opciones = res.map(u => ({
          label: `${u.nombre} - ${u.rol} (${u.numeroDocumento})`,
          value: u
        }));
        this.responsablesOptions.set(opciones);
        this.mostrarModalAdmin.set(true);
      },
      error: () => this.mensajeError.set('Error al cargar la lista de responsables')
    });
  }

  procesarAdministrativo(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.mensajeError.set('');
    const codigo = this.solicitud()!.codigo;
    const { prioridad, justificacion, responsableSeleccionado } = this.adminForm.value;
    const documentoResponsable = responsableSeleccionado.numeroDocumento;
    const tipoDocumentoResponsable = responsableSeleccionado.tipoDocumento;

    // Primero clasificar
    this.solicitudesService.clasificarSolicitud(codigo, { prioridad, justificacion })
      .subscribe({
        next: () => {
          // Si clasifica bien, asignar
          this.solicitudesService.asignarResponsable(codigo, { documentoResponsable, tipoDocumentoResponsable })
            .subscribe({
              next: (sol: SolicitudDetalleResponse) => {
                this.solicitud.set(sol);
                this.enviando.set(false);
                this.mostrarModalAdmin.set(false);
              },
              error: (err: any) => {
                this.enviando.set(false);
                this.mensajeError.set(err.error?.mensaje || 'Error al asignar responsable');
              }
            });
        },
        error: (err: any) => {
          this.enviando.set(false);
          this.mensajeError.set(err.error?.mensaje || 'Error al clasificar solicitud');
        }
      });
  }

  // ---- LÓGICA DOCENTE/DIRECTIVO ----
  abrirModalDocente(): void {
    this.mensajeError.set('');
    this.docenteForm.reset();
    this.accionActual.set('ATENDER');
    this.mostrarModalDocente.set(true);
  }

  procesarDocente(): void {
    if (this.docenteForm.invalid) {
      this.docenteForm.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.mensajeError.set('');
    const codigo = this.solicitud()!.codigo;
    const { observacion } = this.docenteForm.value;

    const accionObs = this.solicitudesService.atenderSolicitud(codigo, { observacion });

    accionObs.subscribe({
      next: (sol: SolicitudDetalleResponse) => {
        this.solicitud.set(sol);
        this.enviando.set(false);
        this.mostrarModalDocente.set(false);
      },
      error: (err: any) => {
        this.enviando.set(false);
        this.mensajeError.set(err.error?.mensaje || 'Error al procesar la solicitud');
      }
    });
  }

  // ---- LÓGICA ESTUDIANTE ----
  abrirModalEstudiante(accion: 'CERRAR' | 'RECHAZAR'): void {
    this.mensajeError.set('');
    this.estudianteForm.reset();
    this.accionActual.set(accion as any);
    this.mostrarModalEstudiante.set(true); 
  }

  procesarEstudiante(): void {
    if (this.estudianteForm.invalid) {
      this.estudianteForm.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.mensajeError.set('');
    const codigo = this.solicitud()!.codigo;
    const { observacion } = this.estudianteForm.value;

    const accionObs = this.accionActual() === 'RECHAZAR' 
      ? this.solicitudesService.rechazarSolicitud(codigo, { justificacion: observacion })
      : this.solicitudesService.cerrarSolicitud(codigo, { observacion });

    accionObs.subscribe({
      next: (sol: SolicitudDetalleResponse) => {
        this.solicitud.set(sol);
        this.enviando.set(false);
        this.mostrarModalEstudiante.set(false);
      },
      error: (err: any) => {
        this.enviando.set(false);
        this.mensajeError.set(err.error?.mensaje || 'Error al procesar la solicitud');
      }
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
