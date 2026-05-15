import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../servicios/usuarios.service';
import { RegistrarUsuarioRequest } from '../../modelos/usuarios';

// ✨ IMPORTS DE PRIMENG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    // PrimeNG Modules
    CardModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    SelectModule,
    PasswordModule,
    DividerModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private usuariosService = inject(UsuariosService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  // Opciones para Tipo de Documento
  tiposDocumento = [
    { label: 'Tarjeta de Identidad', value: 'TARJETA_DE_IDENTIDAD' },
    { label: 'Cédula de Ciudadanía', value: 'CEDULA' },
    { label: 'Pasaporte', value: 'PASAPORTE' },
    { label: 'Tarjeta de Extranjería', value: 'TARJETA_EXTRANJERIA' },
  ];

  // Opciones para Rol con descripciones
  roles = [
    {
      label: 'Estudiante',
      value: 'ESTUDIANTE',
      icon: 'pi pi-user',
      description: 'Crear y hacer seguimiento a solicitudes académicas',
    },
    {
      label: 'Docente',
      value: 'DOCENTE',
      icon: 'pi pi-book',
      description: 'Revisar y gestionar solicitudes de estudiantes',
    },
    {
      label: 'Administrativo',
      value: 'ADMINISTRATIVO',
      icon: 'pi pi-briefcase',
      description: 'Administrar y procesar solicitudes académicas',
    },
    {
      label: 'Directivo',
      value: 'DIRECTIVO',
      icon: 'pi pi-star',
      description: 'Supervisión y aprobación de solicitudes críticas',
    },
  ];

  registroForm = this.fb.group(
    {
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      nombre: ['', Validators.required],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@(uniquindio\.edu\.co|uqvirtual\.edu\.co)$/i)
      ]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', Validators.required],
      rol: ['', Validators.required],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  // Validador personalizado para comparar contraseñas
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmarPassword = control.get('confirmarPassword');

    if (!password || !confirmarPassword) {
      return null;
    }

    if (password.value !== confirmarPassword.value) {
      confirmarPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Limpiar el error si las contraseñas coinciden
      const errors = confirmarPassword.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        confirmarPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
      return null;
    }
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.registroForm.controls).forEach((key) => {
        this.registroForm.get(key)?.markAsTouched();
      });
      return;
    }

    const usuario: RegistrarUsuarioRequest = {
      tipoDocumento: this.registroForm.value.tipoDocumento!,
      numeroDocumento: this.registroForm.value.numeroDocumento!,
      nombre: this.registroForm.value.nombre!,
      email: this.registroForm.value.email!,
      password: this.registroForm.value.password!,
      rol: this.registroForm.value.rol!,
    };

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.usuariosService
      .registrarUsuario(usuario)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('¡Registro exitoso! Redirigiendo al login...');

          // Resetear formulario
          this.registroForm.reset();

          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading.set(false);

          // Manejar errores específicos del backend
          if (err.status === 400) {
            let msg = err.error?.mensaje || 'Los datos ingresados no son válidos.';
            // Si hay errores de validación de campos (@Valid), concatenar el primero
            if (err.error?.errores) {
              const primerError = Object.values(err.error.errores)[0];
              if (primerError) msg += ': ' + primerError;
            }
            this.errorMessage.set(msg);
          } else if (err.status === 409) {
            this.errorMessage.set('El correo electrónico o documento ya están registrados.');
          } else {
            this.errorMessage.set('Error al crear la cuenta. Intenta nuevamente.');
          }

          console.error('Error en registro:', err);
        },
      });
  }
}
