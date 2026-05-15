import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { LoginRequest } from '../../modelos/auth';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
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
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const credentials = this.loginForm.value as LoginRequest;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .login(credentials)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          // 1. Guardamos el token en el navegador
          localStorage.setItem('auth_token', response.token);

          // 2. Apagamos la carga
          this.isLoading.set(false);

          this.router.navigate(['/inicio']);
        },
        error: (err) => {
          // Si el backend responde 401 Credenciales Inválidas
          this.errorMessage.set('Correo o contraseña incorrectos.');
          this.isLoading.set(false);
          console.error(err);
        },
      });
  }
}
