import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class PublicApiService {
  private readonly http = inject(HttpClient);

  getGreeting(): Observable<string> {
    return this.http.get(`${API_URL}/publico/saludo`, { responseType: 'text' });
  }

  // Backward-compatibility alias
  obtenerSaludo(): Observable<string> {
    return this.getGreeting();
  }
}
