import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegistrarUsuarioRequest, UsuarioDetalleResponse } from '../modelos/usuarios';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/usuarios';

  registrarUsuario(usuario: RegistrarUsuarioRequest): Observable<void> {
    return this.http.post<void>(this.url, usuario);
  }

  obtenerPerfil(): Observable<UsuarioDetalleResponse> {
    return this.http.get<UsuarioDetalleResponse>(`${this.url}/me`);
  }

  obtenerResponsables(): Observable<UsuarioDetalleResponse[]> {
    return this.http.get<UsuarioDetalleResponse[]>(`${this.url}/responsables`);
  }
}
