import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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
      const raw = sessionStorage.getItem(this.storageKey) || localStorage.getItem(this.storageKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.token === 'string' && parsed.usuario) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
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
        localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
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
    return this.http.post<void>(`${API_URL}/auth/logout`, {});
  }
}
