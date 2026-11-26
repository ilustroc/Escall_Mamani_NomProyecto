import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarteraService } from '../../features/cartera/services/cartera.service';
import { ThemeService } from '../../core/services/theme.service';
import { MOCK_DEBTORS } from '../../mocks/deudores.mock';
import { Debtor } from '../../core/models/debtor.types';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 transition-colors">

      <div class="flex items-center gap-3 w-80 sm:w-[420px] relative">
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <input
            type="text"
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchChange($event)"
            (keyup.enter)="onSearchEnter()"
            (focus)="onFocus()"
            (blur)="onBlur()"
            placeholder="Buscar por DNI, RUC, cliente u operación..."
            class="w-full pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all font-sans"
          />
          <div *ngIf="searchTerm()" (click)="clearSearch()" class="absolute inset-y-0 right-0 pr-2.5 flex items-center cursor-pointer text-slate-400 hover:text-slate-600">
            <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <div *ngIf="isDropdownVisible() && matchingDebtors().length > 0"
             class="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <div class="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-800/70 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-800">
            <span>Resultados de búsqueda</span>
            <span class="text-[10px] text-slate-400">Presiona Enter para ir a la ficha</span>
          </div>

          <div *ngFor="let debtor of matchingDebtors()"
               (mousedown)="openClientSheet(debtor)"
               class="px-3.5 py-2.5 hover:bg-indigo-50/60 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                {{ debtor.name.charAt(0) }}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {{ debtor.name }}
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono">
                  <span class="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">{{ debtor.documentType }} {{ debtor.documentNumber }}</span>
                  <span>·</span>
                  <span class="truncate">{{ debtor.portfolio }}</span>
                </div>
              </div>
            </div>

            <div class="text-right shrink-0 pl-3">
              <div class="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                {{ debtor.totalDebt | currency:'PEN':'S/ ' }}
              </div>
              <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline inline-flex items-center gap-0.5">
                Ver Ficha →
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div class="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium whitespace-nowrap shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Sistema en línea
        </div>

        <div class="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        <span class="font-mono text-[11px] hidden md:inline-block text-slate-500 whitespace-nowrap">
          Lima, PE · 25 Nov 2026
        </span>

        <button (click)="theme.toggleTheme()" class="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shrink-0">
          <svg *ngIf="!theme.isDark()" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          <svg *ngIf="theme.isDark()" class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
        </button>
      </div>
    </header>
  `
})
export class TopbarComponent {
  cartera = inject(CarteraService);
  theme = inject(ThemeService);
  private router = inject(Router);

  readonly searchTerm = signal('');
  readonly isDropdownVisible = signal(false);

  readonly matchingDebtors = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (term.length < 2) return [];
    return MOCK_DEBTORS.filter(d =>
      d.documentNumber.toLowerCase().includes(term) ||
      d.id.toLowerCase().includes(term) ||
      d.name.toLowerCase().includes(term) ||
      (d.invoices && d.invoices.some(inv => inv.documentNumber.toLowerCase().includes(term)))
    ).slice(0, 5);
  });

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.cartera.setSearch(value);
    this.isDropdownVisible.set(value.trim().length >= 2);
  }

  onFocus(): void {
    if (this.searchTerm().trim().length >= 2) {
      this.isDropdownVisible.set(true);
    }
  }

  onBlur(): void {
    setTimeout(() => {
      this.isDropdownVisible.set(false);
    }, 200);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.cartera.setSearch('');
    this.isDropdownVisible.set(false);
  }

  openClientSheet(debtor: Debtor): void {
    this.isDropdownVisible.set(false);
    void this.router.navigate(['/clientes', debtor.documentNumber]);
  }

  onSearchEnter(): void {
    const raw = this.searchTerm().trim();
    if (!raw) return;

    this.isDropdownVisible.set(false);
    const rawLower = raw.toLowerCase();

    const match = MOCK_DEBTORS.find(d =>
      d.documentNumber === raw ||
      d.id.toLowerCase() === rawLower ||
      d.name.toLowerCase().includes(rawLower) ||
      (d.invoices && d.invoices.some(inv => inv.documentNumber.toLowerCase().includes(rawLower)))
    );

    const target = match ? match.documentNumber : raw;
    void this.router.navigate(['/clientes', target]);
  }
}
