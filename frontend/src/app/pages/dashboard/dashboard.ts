import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { ClientesService } from '../../core/clientes.service';
import { Dashboard } from '../../core/models';
import { getErrorMessage } from '../../core/api-error';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './dashboard.html'
})
export class DashboardPage {
  private readonly clientesService = inject(ClientesService);

  readonly dashboardData = signal<Dashboard | null>(null);
  readonly selectedPeriod = signal('SEMANA');
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  // Backward compatibility getters
  get datos() { return this.dashboardData; }
  get periodo() { return this.selectedPeriod; }
  get cargando() { return this.isLoading; }
  get error() { return this.errorMessage; }

  constructor() {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.clientesService
      .getDashboard(this.selectedPeriod())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.dashboardData.set(data),
        error: (err) => {
          this.dashboardData.set(null);
          this.errorMessage.set(getErrorMessage(err));
        }
      });
  }

  changePeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.loadData();
  }

  // Backward-compatibility aliases
  cargar(): void { this.loadData(); }
  cambiar(p: string): void { this.changePeriod(p); }
}
