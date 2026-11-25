import { Injectable,inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';
import { Usuario } from './models';
import { Carga,FilaReporte,FiltrosReporte,OpcionesFiltro,TipoCarga,TipoReporte,UsuarioEntrada } from './operaciones.models';
@Injectable({providedIn:'root'})
export class OperacionesService {
 private http=inject(HttpClient);
 reporte(tipo:TipoReporte,filtros:FiltrosReporte){const params:Record<string,string>={};for(const [k,v] of Object.entries(filtros))if(v)params[k]=v;return this.http.get<FilaReporte[]>(`${API_URL}/reportes/${tipo}`,{params});}
 filtros(){return this.http.get<OpcionesFiltro>(`${API_URL}/filtros`);}
 usuarios(){return this.http.get<Usuario[]>(`${API_URL}/usuarios`);}
 supervisores(){return this.http.get<Usuario[]>(`${API_URL}/usuarios/supervisores`);}
 crearUsuario(u:UsuarioEntrada){return this.http.post<Usuario>(`${API_URL}/usuarios`,u);}
 editarUsuario(id:number,u:UsuarioEntrada){return this.http.put<Usuario>(`${API_URL}/usuarios/${id}`,u);}
 estadoUsuario(id:number,activo:boolean){return this.http.patch<Usuario>(`${API_URL}/usuarios/${id}/estado`,{activo});}
 passwordUsuario(id:number,password:string){return this.http.patch<void>(`${API_URL}/usuarios/${id}/password`,{password});}
 importar(tipo:TipoCarga,archivo:File){const body=new FormData();body.append('archivo',archivo);return this.http.post<Carga>(`${API_URL}/admin/integracion/${tipo}`,body);}
 cargas(){return this.http.get<Carga[]>(`${API_URL}/admin/integracion/cargas`);}
}
