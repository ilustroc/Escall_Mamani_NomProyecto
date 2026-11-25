import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarteraService } from './services/cartera.service';
import { Debtor, MoraSegment, DebtStatus } from '../../core/models/debtor.types';
import { CurrencyPenPipe } from '../../shared/pipes/currency-pen.pipe';
import { StatusBadgeComponent } from '../../shared/components/badge/status-badge.component';

@Component({
  selector: 'app-cartera',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPenPipe, StatusBadgeComponent],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-10">

      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Operaciones Diarias</span>
            <span class="text-xs text-slate-400">·</span>
            <span class="text-xs text-slate-500 font-mono">Asignación Activa</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Cola de Gestión de Cartera
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prioriza contactos, registra acuerdos y gestiona compromisos de pago sin fricción.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs flex items-center gap-2">
            <span class="text-slate-500">Deudores filtrados:</span>
            <span class="font-bold font-mono text-slate-900 dark:text-slate-100">{{ cartera.filteredDebtors().length }}</span>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-3.5">

        <div class="flex flex-col md:flex-row md:items-center gap-3">

          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              type="text"
              [ngModel]="cartera.searchTerm()"
              (ngModelChange)="cartera.setSearch($event)"
              placeholder="Filtrar por razón social, nombre, DNI, RUC o producto bancario..."
              class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 font-sans"
            />
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-medium whitespace-nowrap">Estado:</span>
            <select
              [ngModel]="cartera.selectedStatus()"
              (ngModelChange)="cartera.setStatus($event)"
              class="text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none">
              <option value="TODOS">Todos los estados</option>
              <option value="MORA_CRITICA">🔴 Mora crítica</option>
              <option value="POR_VENCER">🟡 Por vencer</option>
              <option value="EN_NEGOCIACION">🔵 En negociación</option>
              <option value="AL_DIA">🟢 Al día</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span class="text-slate-400 font-medium mr-1 text-[11px] uppercase tracking-wider">Mora:</span>

          <button
            *ngFor="let seg of moraSegments"
            (click)="cartera.setSegment(seg.id)"
            [ngClass]="cartera.selectedSegment() === seg.id
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'"
            class="px-3 py-1 rounded-full transition-all text-xs font-mono whitespace-nowrap flex items-center gap-1">
            <span>{{ seg.label }}</span>
            <span *ngIf="seg.count !== undefined" class="text-[10px] opacity-75">({{ seg.count }})</span>
          </button>
        </div>

      </div>

      <div class="border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-subtle overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left border-collapse">

            <thead class="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-medium select-none">
              <tr>
                <th (click)="cartera.toggleSort('name')" class="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  <div class="flex items-center gap-1.5">
                    <span>Cliente / Razón Social</span>
                    <span class="text-[10px]" *ngIf="cartera.sortField() === 'name'">{{ cartera.sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                  </div>
                </th>
                <th (click)="cartera.toggleSort('portfolio')" class="px-4 py-3 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  <div class="flex items-center gap-1.5">
                    <span>Cartera</span>
                    <span class="text-[10px]" *ngIf="cartera.sortField() === 'portfolio'">{{ cartera.sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                  </div>
                </th>
                <th (click)="cartera.toggleSort('overdueDebt')" class="px-4 py-3 text-right cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  <div class="flex items-center justify-end gap-1.5">
                    <span>Saldo Vencido</span>
                    <span class="text-[10px]" *ngIf="cartera.sortField() === 'overdueDebt'">{{ cartera.sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                  </div>
                </th>
                <th (click)="cartera.toggleSort('daysOverdue')" class="px-4 py-3 text-center cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                  <div class="flex items-center justify-center gap-1.5">
                    <span>Días Mora</span>
                    <span class="text-[10px]" *ngIf="cartera.sortField() === 'daysOverdue'">{{ cartera.sortDirection() === 'asc' ? '↑' : '↓' }}</span>
                  </div>
                </th>
                <th class="px-4 py-3 text-center">Estado</th>
                <th class="px-4 py-3">Última Gestión</th>
                <th class="px-4 py-3">Próxima Acción</th>
                <th class="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">

              <tr *ngIf="cartera.filteredDebtors().length === 0">
                <td colspan="8" class="py-12 text-center text-slate-400">
                  <svg class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm font-medium text-slate-600 dark:text-slate-300">No se encontraron deudores</p>
                  <p class="text-xs text-slate-400 mt-0.5">Prueba cambiando los filtros o el término de búsqueda.</p>
                </td>
              </tr>

              <tr *ngFor="let debtor of cartera.filteredDebtors()"
                  (click)="cartera.openDebtorDrawer(debtor)"
                  class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors group">

                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      {{ getInitials(debtor.name) }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[220px]">
                        {{ debtor.name }}
                      </p>
                      <p class="text-[11px] font-mono text-slate-400">
                        {{ debtor.documentType }}: {{ debtor.documentNumber }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-3.5">
                  <span class="text-slate-600 dark:text-slate-300 font-medium">
                    {{ debtor.portfolio }}
                  </span>
                </td>

                <td class="px-4 py-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {{ debtor.overdueDebt | currencyPen }}
                </td>

                <td class="px-4 py-3.5 text-center font-mono tabular-nums">
                  <span [ngClass]="getDaysClass(debtor.daysOverdue)" class="px-2 py-0.5 rounded text-xs font-semibold">
                    {{ debtor.daysOverdue }}d
                  </span>
                </td>

                <td class="px-4 py-3.5 text-center">
                  <app-status-badge [status]="debtor.status"></app-status-badge>
                </td>

                <td class="px-4 py-3.5">
                  <div>
                    <p class="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[150px]">
                      {{ debtor.lastManagementResult }}
                    </p>
                    <p class="text-[11px] text-slate-400 font-mono">
                      {{ debtor.lastManagementDate }}
                    </p>
                  </div>
                </td>

                <td class="px-4 py-3.5">
                  <div class="text-[11px]">
                    <span class="font-mono text-indigo-600 dark:text-indigo-400 font-medium block">
                      {{ debtor.nextActionDate }}
                    </span>
                    <span class="text-slate-500 truncate max-w-[130px] block">
                      {{ debtor.nextActionType }}
                    </span>
                  </div>
                </td>

                <td class="px-4 py-3.5 text-right" (click)="$event.stopPropagation()">
                  <div class="flex items-center justify-end gap-1.5">

                    <a [href]="'tel:' + debtor.phones[0]?.number"
                       title="Llamar teléfono principal"
                       class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                      </svg>
                    </a>

                    <button
                      (click)="cartera.openDebtorDrawer(debtor)"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-colors flex items-center gap-1">
                      <span>Gestionar</span>
                      <span class="text-[10px]">›</span>
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>

          </table>
        </div>

        <div class="px-4 py-3 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Mostrando <strong class="text-slate-800 dark:text-slate-200 font-mono">{{ cartera.filteredDebtors().length }}</strong> cuentas auditadas</span>
          <div class="flex items-center gap-4 font-mono">
            <span>Total Vencido en Lista: <strong class="text-rose-600 dark:text-rose-400">{{ totalOverdueInView | currencyPen }}</strong></span>
          </div>
        </div>

      </div>

    </div>
  `
})
export class CarteraComponent {
  cartera = inject(CarteraService);

  moraSegments: { id: MoraSegment; label: string; count?: number }[] = [
    { id: 'TODOS', label: 'Todos' },
    { id: '0_15', label: '0 - 15 días' },
    { id: '16_30', label: '16 - 30 días' },
    { id: '31_60', label: '31 - 60 días' },
    { id: '61_90', label: '61 - 90 días' },
    { id: 'MAS_90', label: '> 90 días' }
  ];

  get totalOverdueInView(): number {
    return this.cartera.filteredDebtors().reduce((acc, d) => acc + d.overdueDebt, 0);
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getDaysClass(days: number): string {
    if (days === 0) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
    if (days <= 15) return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    if (days <= 60) return 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300';
    return 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 font-bold';
  }
}
