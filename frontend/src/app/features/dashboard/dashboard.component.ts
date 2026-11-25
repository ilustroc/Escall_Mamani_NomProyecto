import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarteraService } from '../cartera/services/cartera.service';
import { CurrencyPenPipe } from '../../shared/pipes/currency-pen.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPenPipe],
  template: `
    <div class="space-y-7 max-w-7xl mx-auto pb-8">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Resumen Gerencial</span>
            <span class="text-xs text-slate-400">·</span>
            <span class="text-xs text-slate-500 font-mono">Corte: Noviembre 2026</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Dashboard Ejecutivo de Cobranzas
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoreo en tiempo real de cartera asignada, compromisos de pago y avance de recupero frente a metas.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <a routerLink="/cartera" class="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold shadow-subtle flex items-center gap-2 transition-all">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Ir a Cola de Gestión</span>
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-xs font-medium uppercase tracking-wider">Cartera Asignada</span>
            <span class="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {{ metrics.totalPortfolio | currencyPen }}
            </span>
          </div>
          <div class="mt-2.5 flex items-center gap-1.5 text-xs">
            <span class="text-emerald-600 dark:text-emerald-400 font-semibold font-mono flex items-center">
              ↑ +{{ metrics.totalPortfolioChange }}%
            </span>
            <span class="text-slate-400">vs. mes anterior</span>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-xs font-medium uppercase tracking-wider">Tasa Recuperación</span>
            <span class="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {{ metrics.recoveryRate }}%
            </span>
            <span class="text-xs text-slate-400 font-mono">Meta: {{ metrics.recoveryTarget }}%</span>
          </div>

          <div class="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" [style.width.%]="(metrics.recoveryRate / metrics.recoveryTarget) * 100"></div>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-xs font-medium uppercase tracking-wider">Promesas Hoy</span>
            <span class="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
              {{ metrics.promisesTodayAmount | currencyPen }}
            </span>
          </div>
          <div class="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>{{ metrics.promisesTodayCount }} compromisos</span>
            <span class="font-mono text-emerald-600 font-semibold">{{ metrics.promisesFulfilledCount }} cumplidos</span>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-white dark:bg-slate-900 shadow-subtle hover:border-rose-300 transition-all">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-xs font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">Mora > 30 Días</span>
            <span class="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
              {{ metrics.criticalDebtAmount | currencyPen }}
            </span>
          </div>
          <div class="mt-2.5 flex items-center gap-1.5 text-xs text-rose-600/80 dark:text-rose-400/80 font-medium">
            <span>{{ metrics.criticalDebtDebtorsCount }} casos en tramo legal</span>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div class="lg:col-span-2 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Curva de Recuperación Acumulada vs. Meta Mensual
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">Proyección de cobro en soles (PEN) al cierre del día 25</p>
              </div>

              <div class="flex items-center gap-4 text-xs font-mono">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-0.5 bg-indigo-600 rounded"></span>
                  <span class="text-slate-600 dark:text-slate-300">Recuperado</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-0.5 bg-slate-300 dark:bg-slate-600 stroke-dasharray rounded"></span>
                  <span class="text-slate-400">Meta</span>
                </div>
              </div>
            </div>

            <div class="w-full h-64 mt-4">
              <svg viewBox="0 0 600 240" class="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#4F46E5" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <line x1="40" y1="20" x2="580" y2="20" stroke="currentColor" stroke-dasharray="3 3" class="text-slate-100 dark:text-slate-800" stroke-width="1" />
                <text x="35" y="24" text-anchor="end" class="text-[10px] font-mono fill-slate-400">1.2M</text>

                <line x1="40" y1="80" x2="580" y2="80" stroke="currentColor" stroke-dasharray="3 3" class="text-slate-100 dark:text-slate-800" stroke-width="1" />
                <text x="35" y="84" text-anchor="end" class="text-[10px] font-mono fill-slate-400">800k</text>

                <line x1="40" y1="140" x2="580" y2="140" stroke="currentColor" stroke-dasharray="3 3" class="text-slate-100 dark:text-slate-800" stroke-width="1" />
                <text x="35" y="144" text-anchor="end" class="text-[10px] font-mono fill-slate-400">400k</text>

                <line x1="40" y1="200" x2="580" y2="200" stroke="currentColor" class="text-slate-200 dark:text-slate-700" stroke-width="1" />
                <text x="35" y="204" text-anchor="end" class="text-[10px] font-mono fill-slate-400">0</text>

                <polyline
                  fill="none"
                  stroke="#94A3B8"
                  stroke-width="2"
                  stroke-dasharray="4 4"
                  points="50,195 150,182 250,158 350,120 450,68 560,25"
                />

                <polygon
                  fill="url(#areaGrad)"
                  points="50,200 50,192 150,180 250,155 350,115 450,72 560,35 560,200"
                />

                <polyline
                  fill="none"
                  stroke="#4F46E5"
                  stroke-width="3"
                  points="50,192 150,180 250,155 350,115 450,72 560,35"
                />

                <circle cx="50" cy="192" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="150" cy="180" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="250" cy="155" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="350" cy="115" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="450" cy="72" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="560" cy="35" r="5" class="fill-indigo-600 stroke-white stroke-2 shadow-lg" />

                <text x="50" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">01 Nov</text>
                <text x="150" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">05 Nov</text>
                <text x="250" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">10 Nov</text>
                <text x="350" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">15 Nov</text>
                <text x="450" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">20 Nov</text>
                <text x="560" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-500 font-bold">25 Nov</text>
              </svg>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Ritmo promedio diario: <strong class="text-slate-800 dark:text-slate-200 font-mono font-semibold">S/ 40,640.00 / día</strong></span>
            <span class="text-emerald-600 font-medium">Cumplimiento del 91.2% de la proyección</span>
          </div>
        </div>

        <div class="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Alertas Prioritarias</span>
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            </h3>
            <span class="text-xs font-mono text-slate-400">3 pendientes</span>
          </div>

          <div class="space-y-3 flex-1 overflow-y-auto">
            <div *ngFor="let alert of alerts"
                 class="p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-2 mb-1.5">
                  <span [ngClass]="getSeverityClass(alert.severity)" class="text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                    {{ alert.severity }}
                  </span>
                  <span class="text-[11px] text-slate-400 font-mono">{{ alert.timeAgo }}</span>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ alert.debtorName }}</h4>
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {{ alert.message }}
                </p>
              </div>

              <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                <span class="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {{ alert.amount | currencyPen }}
                </span>
                <button (click)="openDebtorById(alert.debtorId)" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1">
                  Gestionar ›
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `
})
export class DashboardComponent {
  cartera = inject(CarteraService);

  get metrics() {
    return this.cartera.kpis().metrics;
  }

  get alerts() {
    return this.cartera.kpis().priorityAlerts;
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'URGENTE': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'ALTA': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      default: return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
    }
  }

  openDebtorById(id: string) {
    const debtor = this.cartera.filteredDebtors().find(d => d.id === id);
    if (debtor) {
      this.cartera.openDebtorDrawer(debtor);
    }
  }
}
