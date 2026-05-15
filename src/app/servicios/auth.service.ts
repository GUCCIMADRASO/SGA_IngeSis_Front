import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, TokenResponse } from '../modelos/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/auth/login';

  login(credentials: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(this.url, credentials);
  }

  // Utilidad para saber si el usuario está logueado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Utilidad para cerrar sesión
  logout(): void {
    localStorage.removeItem('auth_token');
  }
}
