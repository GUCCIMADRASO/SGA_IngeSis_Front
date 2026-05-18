import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { 
  CrearSolicitudRequest, SolicitudResumenResponse, SolicitudDetalleResponse, 
  Page, ClasificarSolicitudRequest, AsignarResponsableRequest, 
  AtenderSolicitudRequest, CerrarSolicitudRequest, RegistroHistorialResponse 
} from '../modelos/solicitudes';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SolicitudesService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/solicitudes';

  crear(solicitud: CrearSolicitudRequest): Observable<SolicitudDetalleResponse> {
    return this.http.post<SolicitudDetalleResponse>(this.url, solicitud);
  }

  listarSolicitudesPaginadas(
    page: number = 0, size: number = 10,
    estado?: string, tipo?: string, prioridad?: string, documentoResponsable?: string
  ): Observable<Page<SolicitudResumenResponse>> {
    
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
      
    if (estado) params = params.set('estado', estado);
    if (tipo) params = params.set('tipo', tipo);
    if (prioridad) params = params.set('prioridad', prioridad);
    if (documentoResponsable) params = params.set('documentoResponsable', documentoResponsable);

    return this.http.get<Page<SolicitudResumenResponse>>(this.url, { params });
  }

  obtenerSolicitud(codigo: string): Observable<SolicitudDetalleResponse> {
    return this.http.get<SolicitudDetalleResponse>(`${this.url}/${codigo}`);
  }

  clasificarSolicitud(codigo: string, req: ClasificarSolicitudRequest): Observable<SolicitudDetalleResponse> {
    return this.http.put<SolicitudDetalleResponse>(`${this.url}/${codigo}/clasificar`, req);
  }

  asignarResponsable(codigo: string, req: AsignarResponsableRequest): Observable<SolicitudDetalleResponse> {
    return this.http.put<SolicitudDetalleResponse>(`${this.url}/${codigo}/asignar`, req);
  }

  atenderSolicitud(codigo: string, req: AtenderSolicitudRequest): Observable<SolicitudDetalleResponse> {
    return this.http.patch<SolicitudDetalleResponse>(`${this.url}/${codigo}/atender`, req);
  }

  cerrarSolicitud(codigo: string, req: CerrarSolicitudRequest): Observable<SolicitudDetalleResponse> {
    return this.http.put<SolicitudDetalleResponse>(`${this.url}/${codigo}/cerrar`, req);
  }

  rechazarSolicitud(codigo: string, req: { justificacion: string }): Observable<SolicitudDetalleResponse> {
    return this.http.put<SolicitudDetalleResponse>(`${this.url}/${codigo}/rechazar`, req);
  }

  obtenerHistorial(codigo: string): Observable<RegistroHistorialResponse[]> {
    return this.http.get<RegistroHistorialResponse[]>(`${this.url}/${codigo}/historial`);
  }
}
