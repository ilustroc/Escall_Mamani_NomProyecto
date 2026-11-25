import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';
@Injectable({providedIn:'root'})
export class PublicApiService {
  private http=inject(HttpClient);
  obtenerSaludo(){return this.http.get(`${API_URL}/publico/saludo`,{responseType:'text'});}
}
