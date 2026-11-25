import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClientesService } from '../../core/clientes.service';
import { AuthService } from '../../core/auth.service';
import { ClienteResumen } from '../../core/models';
import { getErrorMessage } from '../../core/api-error';

@Component({
  selector: 'app-clientes',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './clientes.html'
})
export class ClientesPage {
  private readonly fb = inject(FormBuilder);
  private readonly clientesService = inject(ClientesService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly clients = signal<ClienteResumen[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly hasSearched = signal(false);
  readonly isCreateModalOpen = signal(false);
  readonly isSaving = signal(false);
  readonly createErrorMessage = signal('');

  readonly searchForm = this.fb.nonNullable.group({
    q: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
  });

  readonly createForm = this.fb.nonNullable.group({
    tipoDocumento: ['DNI', [Validators.required, Validators.maxLength(10)]],
    documento: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/\S/)]],
    nombres: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    direccion: ['', Validators.maxLength(300)]
  });

  get auth() { return this.authService; }
  get filas() { return this.clients; }
  get cargando() { return this.isLoading; }
  get error() { return this.errorMessage; }
  get buscado() { return this.hasSearched; }
  get nuevo() { return this.isCreateModalOpen; }
  get guardando() { return this.isSaving; }
  get errorAlta() { return this.createErrorMessage; }
  get busqueda() { return this.searchForm; }
  get alta() { return this.createForm; }

  search(): void {
    if (this.searchForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.clients.set([]);

    const query = this.searchForm.getRawValue().q.trim();
    this.clientesService
      .searchClients(query)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.clients.set(data);
          this.hasSearched.set(true);
        },
        error: (err) => this.errorMessage.set(getErrorMessage(err))
      });
  }

  openCreateModal(): void {
    this.createForm.reset({ tipoDocumento: 'DNI' });
    this.createErrorMessage.set('');
    this.isCreateModalOpen.set(true);
  }

  createClient(): void {
    if (this.createForm.invalid || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.createErrorMessage.set('');
    const raw = this.createForm.getRawValue();

    this.clientesService
      .createClient({
        ...raw,
        documento: raw.documento.trim(),
        nombres: raw.nombres.trim()
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (client) => {
          void this.router.navigate(['/clientes', client.id]);
        },
        error: (err) => this.createErrorMessage.set(getErrorMessage(err))
      });
  }

  buscar(): void { this.search(); }
  abrirAlta(): void { this.openCreateModal(); }
  crear(): void { this.createClient(); }
}
