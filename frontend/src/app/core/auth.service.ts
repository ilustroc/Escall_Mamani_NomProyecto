import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_URL } from './api.config';
import { Sesion } from './models';
@Injectable({providedIn:'root'})
export class AuthService {
  private http = inject(HttpClient);
  readonly sesion = signal<Sesion|null>(this.leer());
  private leer():Sesion|null {
    try { const s=JSON.parse(sessionStorage.getItem('escall.sesion')||'null');
      return s && typeof s.token==='string' && s.usuario && Date.parse(s.expiraEn)>Date.now() ? s : null;
    } catch { return null; }
  }
  vigente():boolean { const s=this.sesion(); return !!s && Date.parse(s.expiraEn)>Date.now(); }
  login(usuario:string,password:string) { return this.http.post<Sesion>(`${API_URL}/auth/login`,{usuario,password}).pipe(tap(s=>{sessionStorage.setItem('escall.sesion',JSON.stringify(s));this.sesion.set(s);})); }
  limpiar() { sessionStorage.removeItem('escall.sesion'); this.sesion.set(null); }
  logout() { return this.http.post<void>(`${API_URL}/auth/logout`,{}); }
}
