export interface RegistrarUsuarioRequest {
  numeroDocumento: string;
  tipoDocumento: string;
  nombre: string;
  email: string;
  password?: string;
  rol: string;
}

export interface UsuarioDetalleResponse {
  numeroDocumento: string;
  tipoDocumento: string;
  nombre: string;
  email: string;
  rol: string;
}
