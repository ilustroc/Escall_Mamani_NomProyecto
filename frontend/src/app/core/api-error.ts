import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'No fue posible completar la operación.';
  }
  if (error.status === 0) {
    return 'No hay conexión con el servidor. Comprueba que Spring Boot esté activo y revisa CORS.';
  }
  if (error.status === 401) {
    return 'La sesión no es válida o ha vencido. Inicia sesión nuevamente.';
  }
  if (error.status === 403) {
    return 'Tu perfil no tiene permiso para realizar esta operación.';
  }

  const validationErrors = error.error?.errores;
  if (validationErrors && Object.keys(validationErrors).length > 0) {
    return Object.values(validationErrors).join('. ');
  }

  return error.error?.mensaje || `No se pudo completar la operación (HTTP ${error.status}).`;
}

export const mensajeError = getErrorMessage;
