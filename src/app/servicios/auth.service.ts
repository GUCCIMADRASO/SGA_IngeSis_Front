import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, TokenResponse } from '../modelos/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/auth/login';

  // Signal de autenticación reactivo
  isAuthenticated = signal(!!localStorage.getItem('auth_token'));

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.url, credentials).pipe(
      tap((response) => {
        if (response && response.token) {
          localStorage.setItem('auth_token', response.token);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  // Utilidad para saber si el usuario está logueado
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // Utilidad para cerrar sesión
  logout(): void {
    localStorage.removeItem('auth_token');
    this.isAuthenticated.set(false);
  }

  // Extrae y limpia los roles desde el payload JWT
  getRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = atob(payloadBase64);
      const payload = JSON.parse(payloadDecoded);
      const rolesStr = payload.roles || '';
      return rolesStr.split(' ').map((r: string) => r.replace('ROLE_', ''));
    } catch (e) {
      console.error('Error parsing token roles:', e);
      return [];
    }
  }

  // Obtiene el token de localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
