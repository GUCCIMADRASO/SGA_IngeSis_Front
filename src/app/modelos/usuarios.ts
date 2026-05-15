export interface RegistrarUsuarioRequest {
  numeroDocumento: string;
  tipoDocumento: string;
  nombre: string;
  email: string;
  password?: string;
  rol: string;
}

export interface UsuarioDetalleResponse {
  id: string;
  documento: string;
  tipoDocumento: string;
  nombre: string;
  email: string;
  rol: string;
}
