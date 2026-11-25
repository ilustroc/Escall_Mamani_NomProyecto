import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPenPipe } from '../../shared/pipes/currency-pen.pipe';

export interface AdvisorKpi {
  id: string;
  name: string;
  role: string;
  managements: number;
  effectiveContacts: number;
  contactRate: number;
  promisesCount: number;
  recoveredAmount: number;
  targetAmount: number;
  completionRate: number;
}

export interface OverdueBucket {
  label: string;
  range: string;
  amount: number;
  percentage: number;
  accountsCount: number;
  colorClass: string;
  bgClass: string;
}

export interface PriorityAlert {
  id: string;
  severity: 'URGENTE' | 'ALTA' | 'MODERADA';
  debtorName: string;
  portfolio: string;
  operationNumber: string;
  amount: number;
  message: string;
  dueDate: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CurrencyPenPipe],
  template: `
    <div class="space-y-7 max-w-7xl mx-auto pb-12">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Dirección de Cobranzas</span>
            <span class="text-xs text-slate-400">·</span>
            <span class="text-xs text-slate-500 font-mono">Indicadores Ejecutivos</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Tablero de Indicadores y Control Gerencial
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitoreo consolidado de cartera, efectividad de contacto, tramos de mora y productividad de asesores.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 text-xs">
            <button *ngFor="let p of periodOptions"
                    (click)="selectedPeriod.set(p.id)"
                    [ngClass]="selectedPeriod() === p.id ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
                    class="px-2.5 py-1 rounded-md font-medium transition-all">
              {{ p.label }}
            </button>
          </div>

          <select [(ngModel)]="selectedPortfolio"
                  class="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="TODAS">Todas las carteras</option>
            <option value="BCP Comercial">BCP Comercial</option>
            <option value="BBVA Consumo">BBVA Consumo</option>
            <option value="Scotiabank Pyme">Scotiabank Pyme</option>
            <option value="Interbank Personal">Interbank Personal</option>
            <option value="Financiera Sol">Financiera Sol</option>
            <option value="Caja Norte">Caja Norte</option>
          </select>

          <button (click)="refreshMetrics()"
                  title="Actualizar datos"
                  class="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-[11px] font-medium uppercase tracking-wider">Cartera Total</span>
            <span class="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {{ currentMetrics().totalPortfolio | currencyPen }}
          </div>
          <div class="mt-2.5 flex items-center justify-between text-[11px]">
            <span class="text-slate-400">150 cuentas · 100 clientes</span>
            <span class="text-emerald-600 font-semibold font-mono">↑ +3.8%</span>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-[11px] font-medium uppercase tracking-wider">Recupero Acumulado</span>
            <span class="p-1 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {{ currentMetrics().recoveredAmount | currencyPen }}
          </div>
          <div class="mt-2.5">
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="text-emerald-600 font-semibold font-mono">{{ currentMetrics().recoveryRate }}% recuperado</span>
              <span class="text-slate-400 font-mono">Meta: 50%</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div class="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" [style.width.%]="(currentMetrics().recoveryRate / 50) * 100"></div>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-[11px] font-medium uppercase tracking-wider">Promesas de Pago</span>
            <span class="p-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {{ currentMetrics().promisesAmount | currencyPen }}
          </div>
          <div class="mt-2.5 flex items-center justify-between text-[11px]">
            <span class="text-slate-500">191 acuerdos</span>
            <span class="text-emerald-600 font-semibold font-mono">84.2% efectividad</span>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-[11px] font-medium uppercase tracking-wider text-rose-600 dark:text-rose-400">Mora Crítica > 30d</span>
            <span class="p-1 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
            {{ currentMetrics().criticalDebtAmount | currencyPen }}
          </div>
          <div class="mt-2.5 flex items-center justify-between text-[11px]">
            <span class="text-rose-600/80 font-medium">42 cuentas en riesgo</span>
            <span class="text-slate-400 font-mono">26.2% cartera</span>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span class="text-[11px] font-medium uppercase tracking-wider">Contacto Efectivo</span>
            <span class="p-1 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
          </div>
          <div class="text-2xl font-bold font-mono tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums">
            {{ currentMetrics().contactRate }}%
          </div>
          <div class="mt-2.5 flex items-center justify-between text-[11px]">
            <span class="text-slate-500">1000 gestiones</span>
            <span class="text-indigo-600 font-semibold font-mono">4.8 llamadas/deudor</span>
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
                <p class="text-xs text-slate-500 mt-0.5">Evolución en soles (PEN) con corte proyectado al cierre de mes</p>
              </div>

              <div class="flex items-center gap-4 text-xs font-mono">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-0.5 bg-indigo-600 rounded"></span>
                  <span class="text-slate-600 dark:text-slate-300">Recuperado</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-0.5 bg-slate-300 dark:bg-slate-600 rounded"></span>
                  <span class="text-slate-400">Meta</span>
                </div>
              </div>
            </div>

            <div class="w-full h-64 mt-4">
              <svg viewBox="0 0 600 240" class="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="curveAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="#4F46E5" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>

                <line x1="40" y1="20" x2="580" y2="20" stroke="currentColor" stroke-dasharray="3 3" class="text-slate-100 dark:text-slate-800" stroke-width="1" />
                <text x="35" y="24" text-anchor="end" class="text-[10px] font-mono fill-slate-400">1.2M</text>

                <line x1="40" y1="80" x2="580" y2="80" stroke="currentColor" stroke-dasharray="3 3" class="text-slate-100 dark:text-slate-800" stroke-width="1" />
                <text x="35" y="84" text-anchor="end" class="text-[10px] font-mono fill-slate-400">900k</text>

                <line x1="40" y1="140" x2="580" y2="140" stroke="currentColor" stroke-dasharray="3 3" class="text-slate-100 dark:text-slate-800" stroke-width="1" />
                <text x="35" y="144" text-anchor="end" class="text-[10px] font-mono fill-slate-400">450k</text>

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
                  fill="url(#curveAreaGrad)"
                  points="50,200 50,190 150,175 250,148 350,110 450,68 560,32 560,200"
                />

                <polyline
                  fill="none"
                  stroke="#4F46E5"
                  stroke-width="3"
                  points="50,190 150,175 250,148 350,110 450,68 560,32"
                />

                <circle cx="50" cy="190" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="150" cy="175" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="250" cy="148" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="350" cy="110" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="450" cy="68" r="4" class="fill-white dark:fill-slate-900 stroke-indigo-600 stroke-2" />
                <circle cx="560" cy="32" r="5" class="fill-indigo-600 stroke-white stroke-2 shadow-lg" />

                <text x="50" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">01 Nov</text>
                <text x="150" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">05 Nov</text>
                <text x="250" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">10 Nov</text>
                <text x="350" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">15 Nov</text>
                <text x="450" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-400">20 Nov</text>
                <text x="560" y="222" text-anchor="middle" class="text-[11px] font-mono fill-slate-500 font-bold">25 Nov</text>
              </svg>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>Ritmo promedio diario: <strong class="text-slate-800 dark:text-slate-200 font-mono font-semibold">S/ 45,138.00 / día</strong></span>
            <span class="text-emerald-600 font-medium">Cumplimiento del 94.0% de la proyección mensual</span>
          </div>
        </div>

        <div class="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                Distribución por Tramos de Mora
              </h3>
              <span class="text-[11px] font-mono text-slate-400">150 cuentas</span>
            </div>

            <div class="space-y-4">
              <div *ngFor="let b of overdueBuckets" class="space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span [ngClass]="b.bgClass" class="w-2.5 h-2.5 rounded-full"></span>
                    <span class="font-medium text-slate-700 dark:text-slate-300">{{ b.label }}</span>
                    <span class="text-[10px] text-slate-400 font-mono">({{ b.range }})</span>
                  </div>
                  <div class="flex items-center gap-2 font-mono">
                    <span class="font-bold text-slate-800 dark:text-slate-200">{{ b.amount | currencyPen }}</span>
                    <span class="text-slate-400 text-[11px]">({{ b.percentage }}%)</span>
                  </div>
                </div>

                <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div [ngClass]="b.bgClass" class="h-2 rounded-full transition-all duration-500" [style.width.%]="b.percentage"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Cartera en Mora Judicial: <strong class="text-rose-600 font-mono font-bold">8.6%</strong></span>
            <a routerLink="/cartera" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Ver cola ›</a>
          </div>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div class="lg:col-span-2 p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                Ranking de Productividad por Asesor
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">Indicadores de contacto, gestiones telefónicas y porcentaje de cuota cumplida</p>
            </div>
            <a routerLink="/reportes" class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Ver reporte completo ›
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th class="py-2.5 px-3">Asesor</th>
                  <th class="py-2.5 px-3 text-center">Gestiones</th>
                  <th class="py-2.5 px-3 text-center">Contactos</th>
                  <th class="py-2.5 px-3 text-center">Efectividad</th>
                  <th class="py-2.5 px-3 text-right">Recuperado</th>
                  <th class="py-2.5 px-3 text-right">Meta (PEN)</th>
                  <th class="py-2.5 px-3 text-center">% Cumplimiento</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr *ngFor="let a of advisorKpis" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {{ a.name }}
                    <span class="block text-[10px] font-normal text-slate-400">{{ a.role }}</span>
                  </td>
                  <td class="py-2.5 px-3 text-center font-mono">{{ a.managements }}</td>
                  <td class="py-2.5 px-3 text-center font-mono text-emerald-600 font-semibold">{{ a.effectiveContacts }}</td>
                  <td class="py-2.5 px-3 text-center font-mono">{{ a.contactRate }}%</td>
                  <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {{ a.recoveredAmount | currencyPen }}
                  </td>
                  <td class="py-2.5 px-3 text-right font-mono text-slate-400 whitespace-nowrap">
                    {{ a.targetAmount | currencyPen }}
                  </td>
                  <td class="py-2.5 px-3 text-center whitespace-nowrap">
                    <span [ngClass]="getCompletionBadgeClass(a.completionRate)" class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold">
                      {{ a.completionRate }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="space-y-6">

          <div class="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
              Efectividad por Canal de Cobro
            </h3>

            <div class="space-y-3 text-xs">
              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-slate-600 dark:text-slate-400">Llamada Celular</span>
                  <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">62.0% (620 gestiones)</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-indigo-600 h-1.5 rounded-full" style="width: 62%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-slate-600 dark:text-slate-400">WhatsApp Business</span>
                  <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">24.0% (240 gestiones)</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-emerald-500 h-1.5 rounded-full" style="width: 24%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-slate-600 dark:text-slate-400">Correo Electrónico</span>
                  <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">10.0% (100 gestiones)</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-sky-500 h-1.5 rounded-full" style="width: 10%"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between mb-1">
                  <span class="text-slate-600 dark:text-slate-400">Visita en Campo</span>
                  <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">4.0% (40 gestiones)</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-amber-500 h-1.5 rounded-full" style="width: 4%"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Alertas Prioritarias</span>
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              </h3>
              <span class="text-[11px] font-mono text-slate-400">{{ priorityAlerts.length }} activas</span>
            </div>

            <div class="space-y-3">
              <div *ngFor="let alert of priorityAlerts"
                   class="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-1">
                    <span [ngClass]="getSeverityClass(alert.severity)" class="text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                      {{ alert.severity }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ alert.portfolio }}</span>
                  </div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ alert.debtorName }}</h4>
                  <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {{ alert.message }}
                  </p>
                </div>

                <div class="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span class="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {{ alert.amount | currencyPen }}
                  </span>
                  <a routerLink="/cartera" class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    Gestionar ›
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class DashboardComponent {
  selectedPeriod = signal<string>('mes');
  selectedPortfolio = 'TODAS';

  periodOptions = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'semana', label: '7 días' },
    { id: 'mes', label: 'Este Mes' },
    { id: 'trimestre', label: 'Q4 2026' },
    { id: 'ano', label: 'Año 2026' }
  ];

  currentMetrics = computed(() => {
    return {
      totalPortfolio: 2450800.00,
      recoveredAmount: 1128450.00,
      recoveryRate: 46.0,
      promisesAmount: 389450.00,
      criticalDebtAmount: 642100.00,
      contactRate: 78.4
    };
  });

  overdueBuckets: OverdueBucket[] = [
    { label: 'Al Día', range: '0 - 30 días', amount: 920400.00, percentage: 37.5, accountsCount: 56, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-500' },
    { label: 'Mora Temprana', range: '31 - 60 días', amount: 540300.00, percentage: 22.0, accountsCount: 33, colorClass: 'text-sky-600', bgClass: 'bg-sky-500' },
    { label: 'Mora Tardía', range: '61 - 90 días', amount: 420500.00, percentage: 17.2, accountsCount: 26, colorClass: 'text-amber-600', bgClass: 'bg-amber-500' },
    { label: 'Pre-Castigo', range: '91 - 180 días', amount: 360200.00, percentage: 14.7, accountsCount: 22, colorClass: 'text-orange-600', bgClass: 'bg-orange-500' },
    { label: 'Cobranza Judicial', range: '> 180 días', amount: 209400.00, percentage: 8.6, accountsCount: 13, colorClass: 'text-rose-600', bgClass: 'bg-rose-500' }
  ];

  advisorKpis: AdvisorKpi[] = [
    { id: '1', name: 'Valeria Quispe', role: 'Asesor Senior 1', managements: 184, effectiveContacts: 148, contactRate: 80.4, promisesCount: 36, recoveredAmount: 218500.00, targetAmount: 230000.00, completionRate: 95.0 },
    { id: '2', name: 'Carlos Medina', role: 'Asesor Senior 2', managements: 162, effectiveContacts: 129, contactRate: 79.6, promisesCount: 31, recoveredAmount: 194200.00, targetAmount: 220000.00, completionRate: 88.3 },
    { id: '3', name: 'Lucía Torres', role: 'Asesor Cobranzas 3', managements: 145, effectiveContacts: 114, contactRate: 78.6, promisesCount: 28, recoveredAmount: 168400.00, targetAmount: 200000.00, completionRate: 84.2 },
    { id: '4', name: 'Fernando Vargas', role: 'Asesor Cobranzas 4', managements: 132, effectiveContacts: 102, contactRate: 77.3, promisesCount: 25, recoveredAmount: 152000.00, targetAmount: 190000.00, completionRate: 80.0 },
    { id: '5', name: 'Ana Paredes', role: 'Asesor Cobranzas 5', managements: 120, effectiveContacts: 95, contactRate: 79.2, promisesCount: 24, recoveredAmount: 141600.00, targetAmount: 180000.00, completionRate: 78.7 },
    { id: '6', name: 'Sandra García', role: 'Supervisor Cartera', managements: 85, effectiveContacts: 68, contactRate: 80.0, promisesCount: 16, recoveredAmount: 98400.00, targetAmount: 110000.00, completionRate: 89.5 },
    { id: '7', name: 'Marco Rojas', role: 'Supervisor Cartera', managements: 72, effectiveContacts: 58, contactRate: 80.5, promisesCount: 14, recoveredAmount: 84350.00, targetAmount: 100000.00, completionRate: 84.4 }
  ];

  priorityAlerts: PriorityAlert[] = [
    {
      id: 'A1',
      severity: 'URGENTE',
      debtorName: 'Corporación Logística del Sur S.A.C.',
      portfolio: 'BCP Comercial',
      operationNumber: 'OP-BCP-10029',
      amount: 142500.00,
      message: 'Promesa de pago de S/ 45,000.00 vence hoy a las 18:00 hrs. Pendiente confirmación.',
      dueDate: 'Hoy'
    },
    {
      id: 'A2',
      severity: 'ALTA',
      debtorName: 'Inversiones & Metales San Juan E.I.R.L.',
      portfolio: 'Scotiabank Pyme',
      operationNumber: 'OP-SCO-30112',
      amount: 68400.00,
      message: 'Cuenta ingresa a tramo de castigo (181 días). Requiere derivación judicial.',
      dueDate: '27 Nov'
    },
    {
      id: 'A3',
      severity: 'MODERADA',
      debtorName: 'Distribuidora Textil Gamarra S.A.',
      portfolio: 'BBVA Consumo',
      operationNumber: 'OP-BBVA-20441',
      amount: 38200.00,
      message: 'Tres cuotas consecutivas impagas. Titular solicita refinanciamiento.',
      dueDate: '29 Nov'
    }
  ];

  getCompletionBadgeClass(rate: number): string {
    if (rate >= 90) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
    if (rate >= 80) return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  }

  getSeverityClass(severity: 'URGENTE' | 'ALTA' | 'MODERADA'): string {
    switch (severity) {
      case 'URGENTE': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      case 'ALTA': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'MODERADA': return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300';
    }
  }

  refreshMetrics() {
    this.selectedPeriod.update(p => p);
  }
}
