import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';
import { ClienteResumen,ClienteDetalle,ClienteEntrada,Tipificacion,Gestion,Dashboard } from './models';
@Injectable({providedIn:'root'})
export class ClientesService {
  private http=inject(HttpClient);
  buscar(q:string){return this.http.get<ClienteResumen[]>(`${API_URL}/clientes`,{params:{q}});}
  detalle(id:number){return this.http.get<ClienteDetalle>(`${API_URL}/clientes/${id}`);}
  crear(c:ClienteEntrada){return this.http.post<ClienteDetalle>(`${API_URL}/clientes`,c);}
  actualizar(id:number,c:Pick<ClienteEntrada,'nombres'|'email'|'direccion'>){return this.http.put<ClienteDetalle>(`${API_URL}/clientes/${id}`,c);}
  eliminar(id:number){return this.http.delete<void>(`${API_URL}/clientes/${id}`);}
  tipificaciones(){return this.http.get<Tipificacion[]>(`${API_URL}/tipificaciones`);}
  registrarGestion(c:unknown){return this.http.post<Gestion>(`${API_URL}/gestiones`,c);}
  dashboard(periodo:string){return this.http.get<Dashboard>(`${API_URL}/dashboard`,{params:{periodo}});}
}
