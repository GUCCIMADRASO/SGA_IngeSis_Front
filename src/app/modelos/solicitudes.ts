export type TipoDeSolicitud =
  | 'REGISTRAR_ASIGNATURA'
  | 'HOMOLOGACION'
  | 'CANCELACION_ASIGNATURA'
  | 'SOLICITUD_CUPO'
  | 'CONSULTA_ACADEMICA';
export type TipoDeDocumento =
  | 'TARJETA_DE_IDENTIDAD'
  | 'CEDULA'
  | 'PASAPORTE'
  | 'TARJETA_EXTRANJERIA';

export interface CrearSolicitudRequest {
  tipo: TipoDeSolicitud | string;
  descripcion: string;
  documentoSolicitante: string;
  tipoDocumentoSolicitante: TipoDeDocumento | string;
}

export interface SolicitudResumenResponse {
  codigo: string;
  tipo: string;
  descripcionBreve: string;
  estado: string;
}

export type EstadoDeSolicitud = 'REGISTRADA' | 'CLASIFICADA' | 'EN_ATENCION' | 'ATENDIDA' | 'CERRADA';
export type PrioridadDeSolicitud = 'ALTA' | 'MEDIA' | 'BAJA';

export interface UsuarioResumenResponse {
  numeroDocumento: string;
  tipoDocumento: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface SolicitudDetalleResponse {
  codigo: string;
  tipo: TipoDeSolicitud | string;
  descripcion: string;
  estado: EstadoDeSolicitud | string;
  prioridad?: PrioridadDeSolicitud | string;
  solicitante: UsuarioResumenResponse;
  responsable?: UsuarioResumenResponse;
  fechaCreacion: string;
  cantidadCambiosHistorial: number;
}

export interface RegistroHistorialResponse {
  descripcion: string;
  fecha: string;
  estadoAsociado: string;
}

export interface ClasificarSolicitudRequest {
  prioridad: PrioridadDeSolicitud | string;
  justificacion: string;
}

export interface AsignarResponsableRequest {
  documentoResponsable: string;
  tipoDocumentoResponsable: TipoDeDocumento | string;
}

export interface AtenderSolicitudRequest {
  observacion: string;
}

export interface CerrarSolicitudRequest {
  observacion: string;
}

// Representación genérica de la paginación de Spring Data
export interface Page<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

