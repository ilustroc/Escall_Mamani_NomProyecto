import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PublicApiService } from '../../core/public-api.service';
import { getErrorMessage } from '../../core/api-error';

@Component({
  selector: 'app-conexion',
  templateUrl: './conexion.html'
})
export class ConexionPage {
  private readonly apiService = inject(PublicApiService);

  readonly statusMessage = signal('');
  readonly errorMessage = signal('');
  readonly isLoading = signal(false);

  // Backward compatibility getters
  get mensaje() {
    return this.statusMessage;
  }
  get error() {
    return this.errorMessage;
  }
  get cargando() {
    return this.isLoading;
  }

  constructor() {
    this.checkConnection();
  }

  checkConnection(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.statusMessage.set('');

    this.apiService
      .getGreeting()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (text) => this.statusMessage.set(text),
        error: (err) => this.errorMessage.set(getErrorMessage(err))
      });
  }

  // Backward-compatibility alias
  comprobar(): void {
    this.checkConnection();
  }
}
