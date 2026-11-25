import { HttpErrorResponse } from '@angular/common/http';
export function mensajeError(e:unknown):string {
  if (!(e instanceof HttpErrorResponse)) return 'No fue posible completar la operación.';
  if (e.status === 0) return 'No hay conexión con el servidor. Comprueba que Spring Boot esté activo y revisa CORS.';
  if (e.status === 401) return 'La sesión no es válida o ha vencido. Inicia sesión nuevamente.';
  if (e.status === 403) return 'Tu perfil no tiene permiso para realizar esta operación.';
  const detalle = e.error?.errores;
  return detalle && Object.keys(detalle).length ? Object.values(detalle).join('. ') : e.error?.mensaje || `No se pudo completar la operación (HTTP ${e.status}).`;
}
