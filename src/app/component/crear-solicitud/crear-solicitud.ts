import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SolicitudesService } from '../../servicios/solicitudes.service';
import { CrearSolicitudRequest, TipoDeSolicitud, TipoDeDocumento } from '../../modelos/solicitudes';

@Component({
  selector: 'app-crear-solicitud',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './crear-solicitud.html',
  styleUrl: './crear-solicitud.css',
})
export class CrearSolicitud {
  private solicitudesService = inject(SolicitudesService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  result = signal('');
  isLoading = signal(false);

  tiposSolicitud: TipoDeSolicitud[] = [
    'REGISTRAR_ASIGNATURA',
    'HOMOLOGACION',
    'CANCELACION_ASIGNATURA',
    'SOLICITUD_CUPO',
    'CONSULTA_ACADEMICA',
  ];

  tiposDocumento: TipoDeDocumento[] = [
    'CEDULA',
    'TARJETA_DE_IDENTIDAD',
    'PASAPORTE',
    'TARJETA_EXTRANJERIA',
  ];

  solicitudForm = this.fb.group({
    tipo: ['', Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    tipoDocumentoSolicitante: ['', Validators.required],
    documentoSolicitante: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.solicitudForm.invalid) return;

    const solicitud = this.solicitudForm.value as CrearSolicitudRequest;
    this.isLoading.set(true);

    this.solicitudesService
      .crear(solicitud)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.result.set(`¡Éxito! Solicitud creada con código: ${response.codigo}`);
          this.solicitudForm.reset();
          this.isLoading.set(false);
        },
        error: (err) => {
          this.result.set('Error al crear la solicitud. Verifica los datos.');
          console.error(err);
          this.isLoading.set(false);
        },
      });
  }
}
