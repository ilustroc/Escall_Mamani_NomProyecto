import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { API_URL } from './api.config';
import { Sesion } from './models';

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
      // Las sesiones persistentes de versiones anteriores se descartan. La
      // sesión actual queda limitada a la pestaña que inició sesión.
      localStorage.removeItem(this.storageKey);
      const raw = sessionStorage.getItem(this.storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.token === 'string' &&
          parsed.token.length > 0 &&
          parsed.usuario &&
          typeof parsed.expiraEn === 'string' &&
          !Number.isNaN(Date.parse(parsed.expiraEn)) &&
          Date.parse(parsed.expiraEn) > Date.now()
        ) {
          return parsed;
        }
      }
    } catch {
      // Si el almacenamiento no está disponible, la sesión se conserva solo
      // en memoria después de una autenticación válida.
    }
    return null;
  }

  isAuthenticated(): boolean {
    const current = this.session();
    return !!current && Date.parse(current.expiraEn) > Date.now();
  }

  vigente(): boolean {
    return this.isAuthenticated();
  }

  login(username: string, password: string): Observable<Sesion> {
    return this.http.post<Sesion>(`${API_URL}/auth/login`, {
      usuario: username,
      password: password
    }).pipe(
      tap(sessionData => {
        sessionStorage.setItem(this.storageKey, JSON.stringify(sessionData));
        this.session.set(sessionData);
      })
    );
  }

  clearSession(): void {
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
