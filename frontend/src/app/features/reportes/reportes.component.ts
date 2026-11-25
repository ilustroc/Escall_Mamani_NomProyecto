import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarteraService } from '../cartera/services/cartera.service';
import { CurrencyPenPipe } from '../../shared/pipes/currency-pen.pipe';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, CurrencyPenPipe],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Analítica de Gestión</span>
          <span class="text-xs text-slate-400">·</span>
          <span class="text-xs text-slate-500 font-mono">KPIs de Asesores</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
          Reportes y Metas de Cobranza
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Efectividad de contacto, cumplimiento de promesas y recupero por cartera y gestor.
        </p>
      </div>

      <!-- Métricas del Equipo -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Promesas Acordadas en Mes</p>
          <p class="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">S/ 389,450.00</p>
          <p class="text-xs text-emerald-600 mt-2 font-medium">↑ 84.2% efectividad de cumplimiento</p>
        </div>

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Contactabilidad Efectiva</p>
          <p class="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-2">72.6%</p>
          <p class="text-xs text-indigo-600 mt-2 font-medium">Promedio 4.2 contactos / deudor</p>
        </div>

        <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle">
          <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">Casos Derivados a Legal</p>
          <p class="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-2">S/ 114,800.00</p>
          <p class="text-xs text-slate-400 mt-2">8 cuentas en demanda ejecutiva</p>
        </div>
      </div>

      <!-- Desempeño por Asesor -->
      <div class="border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-subtle overflow-hidden p-6">
        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
          Ranking de Productividad por Asesor (Noviembre 2026)
        </h3>
        
        <div class="space-y-4">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-800 dark:text-slate-200">Valeria Quispe (Tú)</span>
              <span class="font-mono font-bold text-emerald-600">S/ 482,000 / S/ 500,000 (96.4%)</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-600 h-2 rounded-full" style="width: 96.4%"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-800 dark:text-slate-200">Carlos Medina</span>
              <span class="font-mono font-bold text-indigo-600">S/ 390,500 / S/ 450,000 (86.7%)</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-500 h-2 rounded-full" style="width: 86.7%"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <span class="font-semibold text-slate-800 dark:text-slate-200">Lucía Torres</span>
              <span class="font-mono font-bold text-slate-600 dark:text-slate-300">S/ 278,900 / S/ 380,000 (73.4%)</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div class="bg-indigo-400 h-2 rounded-full" style="width: 73.4%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportesComponent {
  cartera = inject(CarteraService);
}
