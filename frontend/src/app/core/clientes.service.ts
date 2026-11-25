import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';
import { ClienteResumen, ClienteDetalle, ClienteEntrada, Tipificacion, Gestion, Dashboard } from './models';

/**
 * Client and Operational Portfolio HTTP Service.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private http = inject(HttpClient);

  searchClients(query: string): Observable<ClienteResumen[]> {
    return this.http.get<ClienteResumen[]>(`${API_URL}/clientes`, {
      params: { q: query }
    });
  }

  getClientDetails(id: number): Observable<ClienteDetalle> {
    return this.http.get<ClienteDetalle>(`${API_URL}/clientes/${id}`);
  }

  createClient(client: ClienteEntrada): Observable<ClienteDetalle> {
    return this.http.post<ClienteDetalle>(`${API_URL}/clientes`, client);
  }

  updateClient(id: number, client: Pick<ClienteEntrada, 'nombres' | 'email' | 'direccion'>): Observable<ClienteDetalle> {
    return this.http.put<ClienteDetalle>(`${API_URL}/clientes/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/clientes/${id}`);
  }

  getTypifications(): Observable<Tipificacion[]> {
    return this.http.get<Tipificacion[]>(`${API_URL}/tipificaciones`);
  }

  recordManagement(managementData: unknown): Observable<Gestion> {
    return this.http.post<Gestion>(`${API_URL}/gestiones`, managementData);
  }

  getDashboard(period: string): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${API_URL}/dashboard`, {
      params: { periodo: period }
    });
  }

  // Compatibility aliases
  buscar(q: string) { return this.searchClients(q); }
  detalle(id: number) { return this.getClientDetails(id); }
  crear(c: ClienteEntrada) { return this.createClient(c); }
  actualizar(id: number, c: Pick<ClienteEntrada, 'nombres' | 'email' | 'direccion'>) { return this.updateClient(id, c); }
  eliminar(id: number) { return this.deleteClient(id); }
  tipificaciones() { return this.getTypifications(); }
  registrarGestion(c: unknown) { return this.recordManagement(c); }
  dashboard(periodo: string) { return this.getDashboard(periodo); }
}
