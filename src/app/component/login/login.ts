import { Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { LoginRequest } from '../../modelos/auth';

// PrimeNG v21 Standalone Components
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { Card } from 'primeng/card';
import { IftaLabel } from 'primeng/iftalabel';
import { Fluid } from 'primeng/fluid';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    InputText,
    Password,
    Button,
    Message,
    Card,
    IftaLabel,
    Fluid,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  errorMessage = signal('');
  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  // convertimos el form status a signal
  private formStatus = toSignal(this.loginForm.statusChanges, { initialValue: 'INVALID' as const });

  //computed signal para saber si podemos enviar el formulario
  canSubmit = computed(() => this.formStatus() === 'VALID' && !this.isLoading());

  onSubmit(): void {
    if (!this.canSubmit()) return;

    const credentials = this.loginForm.value as LoginRequest;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          // Guardamos el token en el navegador
          localStorage.setItem('auth_token', response.token);

          // Apagamos la carga
          this.isLoading.set(false);

          this.router.navigate(['/inicio']);
        },
        error: (err) => {
          // Si el backend responde con error de autenticación
          this.errorMessage.set('Correo o contraseña incorrectos.');
          this.isLoading.set(false);
          console.error(err);
        },
      });
  }
}
