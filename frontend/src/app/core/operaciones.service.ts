import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';
import { Usuario } from './models';
import { Carga, FilaReporte, FiltrosReporte, OpcionesFiltro, TipoCarga, TipoReporte, UsuarioEntrada } from './operaciones.models';

@Injectable({
  providedIn: 'root'
})
export class OperacionesService {
  private http = inject(HttpClient);

  getReport(type: TipoReporte, filters: FiltrosReporte): Observable<FilaReporte[]> {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) params[key] = value;
    }
    return this.http.get<FilaReporte[]>(`${API_URL}/reportes/${type}`, { params });
  }

  getFilterOptions(): Observable<OpcionesFiltro> {
    return this.http.get<OpcionesFiltro>(`${API_URL}/filtros`);
  }

  getUsers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API_URL}/usuarios`);
  }

  getSupervisors(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${API_URL}/usuarios/supervisores`);
  }

  createUser(user: UsuarioEntrada): Observable<Usuario> {
    return this.http.post<Usuario>(`${API_URL}/usuarios`, user);
  }

  updateUser(id: number, user: UsuarioEntrada): Observable<Usuario> {
    return this.http.put<Usuario>(`${API_URL}/usuarios/${id}`, user);
  }

  updateUserStatus(id: number, active: boolean): Observable<Usuario> {
    return this.http.patch<Usuario>(`${API_URL}/usuarios/${id}/estado`, { activo: active });
  }

  updateUserPassword(id: number, password: string): Observable<void> {
    return this.http.patch<void>(`${API_URL}/usuarios/${id}/password`, { password });
  }

  importData(type: TipoCarga, file: File): Observable<Carga> {
    const formData = new FormData();
    formData.append('archivo', file);
    return this.http.post<Carga>(`${API_URL}/admin/integracion/${type}`, formData);
  }

  getBatchLoads(): Observable<Carga[]> {
    return this.http.get<Carga[]>(`${API_URL}/admin/integracion/cargas`);
  }

  reporte(tipo: TipoReporte, filtros: FiltrosReporte) { return this.getReport(tipo, filtros); }
  filtros() { return this.getFilterOptions(); }
  usuarios() { return this.getUsers(); }
  supervisores() { return this.getSupervisors(); }
  crearUsuario(u: UsuarioEntrada) { return this.createUser(u); }
  editarUsuario(id: number, u: UsuarioEntrada) { return this.updateUser(id, u); }
  estadoUsuario(id: number, activo: boolean) { return this.updateUserStatus(id, activo); }
  passwordUsuario(id: number, password: string) { return this.updateUserPassword(id, password); }
  importar(tipo: TipoCarga, archivo: File) { return this.importData(tipo, archivo); }
  cargas() { return this.getBatchLoads(); }
}
