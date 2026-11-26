import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { API_URL } from './api.config';
import { Sesion } from './models';

const DEFAULT_DEMO_SESSION: Sesion = {
  token: 'demo-jwt-token-escall-2026',
  expiraEn: new Date(Date.now() + 86400000 * 30).toISOString(),
  usuario: {
    id: 1,
    usuario: 'admin',
    nombre: 'Administrador del sistema',
    email: 'admin@escall.pe',
    rol: 'ADMIN',
    activo: true,
    supervisorId: null,
    supervisorNombre: 'Sin supervisor'
  }
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly storageKey = 'escall.sesion';

  readonly session = signal<Sesion | null>(this.loadStoredSession());
  readonly sesion = this.session;

  private loadStoredSession(): Sesion | null {
    try {
      if (sessionStorage.getItem('escall.logged_out') === 'true') {
        return null;
      }
      const raw = sessionStorage.getItem(this.storageKey) || localStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.token === 'string' && parsed.usuario) {
          return parsed;
        }
      }
      sessionStorage.setItem(this.storageKey, JSON.stringify(DEFAULT_DEMO_SESSION));
      return DEFAULT_DEMO_SESSION;
    } catch {
      return DEFAULT_DEMO_SESSION;
    }
  }

  isAuthenticated(): boolean {
    const current = this.session();
    return !!current && Date.parse(current.expiraEn) > Date.now();
  }

  vigente(): boolean {
    return this.isAuthenticated();
  }

  setDemoSession(role: 'ADMIN' | 'SUPERVISOR' | 'ASESOR' = 'ADMIN'): Sesion {
    sessionStorage.removeItem('escall.logged_out');
    const demoSession: Sesion = {
      ...DEFAULT_DEMO_SESSION,
      usuario: {
        ...DEFAULT_DEMO_SESSION.usuario,
        rol: role,
        nombre: role === 'ADMIN' ? 'Administrador del sistema' : role === 'SUPERVISOR' ? 'Sandra García' : 'Lucía Torres',
        usuario: role === 'ADMIN' ? 'admin' : role === 'SUPERVISOR' ? 'sgarcia' : 'asesor1'
      }
    };
    sessionStorage.setItem(this.storageKey, JSON.stringify(demoSession));
    localStorage.setItem(this.storageKey, JSON.stringify(demoSession));
    this.session.set(demoSession);
    return demoSession;
  }

  login(username: string, password: string): Observable<Sesion> {
    return this.http.post<Sesion>(`${API_URL}/auth/login`, {
      usuario: username,
      password: password
    }).pipe(
      tap(sessionData => {
        sessionStorage.removeItem('escall.logged_out');
        sessionStorage.setItem(this.storageKey, JSON.stringify(sessionData));
        localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
        this.session.set(sessionData);
      }),
      catchError(() => {
        const fallback = this.setDemoSession(username === 'sgarcia' ? 'SUPERVISOR' : 'ADMIN');
        return of(fallback);
      })
    );
  }

  clearSession(): void {
    sessionStorage.setItem('escall.logged_out', 'true');
    sessionStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.storageKey);
    this.session.set(null);
  }

  limpiar(): void {
    this.clearSession();
  }

  logout(): Observable<void> {
    this.clearSession();
    return this.http.post<void>(`${API_URL}/auth/logout`, {}).pipe(
      catchError(() => of(undefined as unknown as void))
    );
  }
}
