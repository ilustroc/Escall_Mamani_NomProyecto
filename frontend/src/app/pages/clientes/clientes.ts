import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClientesService } from '../../core/clientes.service';
import { AuthService } from '../../core/auth.service';
import { ClienteResumen } from '../../core/models';
import { getErrorMessage } from '../../core/api-error';
import { MOCK_DEBTORS } from '../../mocks/deudores.mock';
import { Debtor } from '../../core/models/debtor.types';

@Component({
  selector: 'app-clientes',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './clientes.html'
})
export class ClientesPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly clientesService = inject(ClientesService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

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

  ngOnInit(): void {
    const queryParam = this.route.snapshot.queryParamMap.get('q');
    if (queryParam && queryParam.trim().length >= 3) {
      this.searchForm.controls.q.setValue(queryParam.trim());
      this.search();
    }
  }

  quickSearch(term: string): void {
    this.searchForm.controls.q.setValue(term);
    this.search();
  }

  search(): void {
    if (this.searchForm.invalid || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.clients.set([]);

    const query = this.searchForm.getRawValue().q.trim();
    const queryLower = query.toLowerCase();

    const localMatches: ClienteResumen[] = MOCK_DEBTORS
      .filter((d: Debtor) =>
        d.documentNumber.includes(query) ||
        d.name.toLowerCase().includes(queryLower) ||
        d.portfolio.toLowerCase().includes(queryLower) ||
        d.invoices.some((i: any) => i.documentNumber.toLowerCase().includes(queryLower))
      )
      .map((d: Debtor) => {
        let numId = 101;
        if (d.id === 'DEB-007' || d.documentNumber === '10482914') {
          numId = 107;
        } else {
          const parsed = parseInt(d.id.replace('DEB-', ''), 10);
          numId = isNaN(parsed) ? 101 : parsed + 100;
        }
        return {
          id: numId,
          tipoDocumento: d.documentType,
          documento: d.documentNumber,
          nombres: d.name,
          cuentas: d.invoices.length || 1,
          deudaTotal: d.totalDebt
        };
      });

    if (!this.authService.isAuthenticated()) {
      this.clients.set(localMatches);
      this.hasSearched.set(true);
      this.isLoading.set(false);
      return;
    }

    this.clientesService
      .searchClients(query)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (backendData) => {
          const seen = new Set<string>();
          const merged: ClienteResumen[] = [];

          for (const item of backendData) {
            seen.add(item.documento);
            merged.push(item);
          }

          for (const item of localMatches) {
            if (!seen.has(item.documento)) {
              seen.add(item.documento);
              merged.push(item);
            }
          }

          this.clients.set(merged);
          this.hasSearched.set(true);
        },
        error: (err) => {
          if (localMatches.length > 0) {
            this.clients.set(localMatches);
            this.hasSearched.set(true);
          } else {
            this.errorMessage.set(getErrorMessage(err));
          }
        }
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
