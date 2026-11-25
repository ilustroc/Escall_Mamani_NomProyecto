import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyPenPipe } from '../../shared/pipes/currency-pen.pipe';
import {
  ReportesService,
  ReportRecord,
  ReportCategory,
  ReportStatus
} from './services/reportes.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPenPipe],
  template: `
    <div class="space-y-6 max-w-7xl mx-auto pb-12">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Analítica & Operaciones</span>
            <span class="text-xs text-slate-400">·</span>
            <span class="text-xs text-slate-500 font-mono">Auditoría en Línea</span>
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            Gestión y Reportes de Cobranza
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Módulo interactivo con operaciones CRUD, filtrado dinámico multicriterio y exportación de registros de gestión.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button (click)="service.resetFilters()"
                  class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-all">
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Restablecer</span>
          </button>

          <button (click)="service.exportToCsv()"
                  class="px-3.5 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-all">
            <svg class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exportar CSV</span>
          </button>

          <button (click)="service.openCreateModal()"
                  class="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-all">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle min-w-0">
          <span class="text-[11px] font-medium uppercase tracking-wider text-slate-500 truncate block">Registros Filtrados</span>
          <p class="text-xl lg:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1 truncate">
            {{ service.summary().totalRecords }}
          </p>
          <span class="text-[11px] text-slate-400 mt-1 block truncate">de {{ service.filteredRecords().length }} activos</span>
        </div>

        <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle min-w-0">
          <span class="text-[11px] font-medium uppercase tracking-wider text-slate-500 truncate block">Monto Consolidado</span>
          <p class="text-xl lg:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1 truncate">
            {{ service.summary().totalAmount | currencyPen }}
          </p>
          <span class="text-[11px] text-emerald-600 font-medium mt-1 block truncate">En soles (PEN)</span>
        </div>

        <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle min-w-0">
          <span class="text-[11px] font-medium uppercase tracking-wider text-slate-500 truncate block">Ticket Promedio</span>
          <p class="text-xl lg:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1 truncate">
            {{ service.summary().avgAmount | currencyPen }}
          </p>
          <span class="text-[11px] text-slate-400 mt-1 block truncate">por operación</span>
        </div>

        <div class="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle min-w-0">
          <span class="text-[11px] font-medium uppercase tracking-wider text-slate-500 truncate block">Efectividad / Cumplimiento</span>
          <p class="text-xl lg:text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-1 truncate">
            {{ service.summary().completionRate | number:'1.1-1' }}%
          </p>
          <span class="text-[11px] text-slate-400 mt-1 block truncate">registros completados</span>
        </div>
      </div>

      <div class="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-subtle space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros Avanzados de Búsqueda
          </span>
          <span class="text-xs text-slate-400">Total encontrado: <strong class="text-slate-700 dark:text-slate-300 font-mono">{{ service.filteredRecords().length }}</strong></span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">

          <div class="xl:col-span-2">
            <label class="block text-[11px] font-medium text-slate-500 mb-1">Buscar por término</label>
            <div class="relative">
              <input type="text"
                     [ngModel]="service.filters().search"
                     (ngModelChange)="service.setSearch($event)"
                     placeholder="DNI, cliente, operación, código..."
                     class="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" />
              <svg class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-1">Tipo de Registro</label>
            <select [ngModel]="service.filters().category"
                    (ngModelChange)="service.setCategory($event)"
                    class="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="TODOS">Todos los tipos</option>
              <option value="GESTION">Gestiones telefónicas</option>
              <option value="PAGO">Pagos bancarios</option>
              <option value="PROMESA">Promesas de pago</option>
              <option value="PROGRAMADO">Reportes programados</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-1">Cartera / Banco</label>
            <select [ngModel]="service.filters().portfolio"
                    (ngModelChange)="service.setPortfolio($event)"
                    class="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="TODOS">Todas las carteras</option>
              <option value="BCP Comercial">BCP Comercial</option>
              <option value="BBVA Consumo">BBVA Consumo</option>
              <option value="Scotiabank Pyme">Scotiabank Pyme</option>
              <option value="Interbank Personal">Interbank Personal</option>
              <option value="Financiera Sol">Financiera Sol</option>
              <option value="Caja Norte">Caja Norte</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-1">Asesor Responsable</label>
            <select [ngModel]="service.filters().advisor"
                    (ngModelChange)="service.setAdvisor($event)"
                    class="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="TODOS">Todos los asesores</option>
              <option value="Valeria Quispe">Valeria Quispe</option>
              <option value="Carlos Medina">Carlos Medina</option>
              <option value="Lucía Torres">Lucía Torres</option>
              <option value="Fernando Vargas">Fernando Vargas</option>
              <option value="Ana Paredes">Ana Paredes</option>
              <option value="Jorge Huamán">Jorge Huamán</option>
              <option value="Patricia Soto">Patricia Soto</option>
              <option value="Diego Salazar">Diego Salazar</option>
              <option value="Sandra García">Sandra García</option>
              <option value="Marco Rojas">Marco Rojas</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-500 mb-1">Estado</label>
            <select [ngModel]="service.filters().status"
                    (ngModelChange)="service.setStatus($event)"
                    class="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              <option value="TODOS">Todos los estados</option>
              <option value="COMPLETADO">Completado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="OBSERVADO">Observado</option>
              <option value="ANULADO">Anulado</option>
            </select>
          </div>

        </div>
      </div>

      <div class="border border-slate-200/80 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-subtle overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
              Registros Consolidados de Cobranza (CRUD)
            </h3>
            <p class="text-xs text-slate-500 mt-0.5">Listado detallado de gestiones, abonos bancarios, acuerdos y reportes.</p>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-500 hidden sm:inline">Mostrar:</span>
            <select [ngModel]="service.pageSize()"
                    (ngModelChange)="service.setPageSize(+$event)"
                    class="text-xs px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <option [value]="10">10 filas</option>
              <option [value]="25">25 filas</option>
              <option [value]="50">50 filas</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th class="py-3 px-4">Código / Ref</th>
                <th class="py-3 px-4">Fecha & Hora</th>
                <th class="py-3 px-4">Cliente / Documento</th>
                <th class="py-3 px-4">Cartera</th>
                <th class="py-3 px-4">Tipo</th>
                <th class="py-3 px-4">Asesor</th>
                <th class="py-3 px-4 text-right">Monto (S/)</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr *ngFor="let record of service.pagedRecords()"
                  class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">

                <td class="py-3 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                  {{ record.code }}
                </td>

                <td class="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                  {{ record.date }}
                </td>

                <td class="py-3 px-4">
                  <div class="font-semibold text-slate-900 dark:text-slate-100">{{ record.clientName }}</div>
                  <div class="text-[11px] font-mono text-slate-400">DNI: {{ record.clientDoc }} · {{ record.operationNumber }}</div>
                </td>

                <td class="py-3 px-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {{ record.portfolio }}
                  </span>
                </td>

                <td class="py-3 px-4 whitespace-nowrap">
                  <span [ngClass]="getCategoryBadgeClass(record.category)" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wide">
                    {{ record.category }}
                  </span>
                </td>

                <td class="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                  {{ record.advisorName }}
                </td>

                <td class="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap tabular-nums">
                  {{ record.amount | currencyPen }}
                </td>

                <td class="py-3 px-4 whitespace-nowrap">
                  <span [ngClass]="getStatusBadgeClass(record.status)" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium">
                    <span class="w-1.5 h-1.5 rounded-full" [ngClass]="getStatusDotClass(record.status)"></span>
                    {{ record.status }}
                  </span>
                </td>

                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1">
                    <button (click)="service.openDetailModal(record)"
                            title="Ver Detalle"
                            class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button (click)="service.openEditModal(record)"
                            title="Editar Registro"
                            class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    <button (click)="service.openDeleteModal(record)"
                            title="Eliminar Registro"
                            class="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>

              </tr>

              <tr *ngIf="service.pagedRecords().length === 0">
                <td colspan="9" class="py-12 text-center text-slate-400">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <svg class="w-8 h-8 text-slate-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-xs">No se encontraron registros que coincidan con los filtros aplicados.</span>
                    <button (click)="service.resetFilters()" class="text-xs text-indigo-600 hover:underline">Restablecer filtros</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="px-5 py-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Mostrando página <strong class="text-slate-800 dark:text-slate-200 font-mono">{{ service.currentPage() }}</strong> de <strong class="text-slate-800 dark:text-slate-200 font-mono">{{ service.totalPages() }}</strong> ({{ service.filteredRecords().length }} registros en total)
          </div>

          <div class="flex items-center gap-1.5">
            <button (click)="service.setPage(service.currentPage() - 1)"
                    [disabled]="service.currentPage() <= 1"
                    class="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Anterior
            </button>

            <span class="px-2 font-mono text-slate-700 dark:text-slate-300">{{ service.currentPage() }} / {{ service.totalPages() }}</span>

            <button (click)="service.setPage(service.currentPage() + 1)"
                    [disabled]="service.currentPage() >= service.totalPages()"
                    class="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="service.activeModal() === 'create'"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
              Crear Nuevo Registro de Cobranza (CRUD)
            </h3>
            <button (click)="service.closeModal()" class="text-slate-400 hover:text-slate-600 text-lg">×</button>
          </div>

          <form (ngSubmit)="submitCreate()" class="p-6 space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Registro *</label>
                <select [(ngModel)]="newRecordForm.category" name="category" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="GESTION">Gestión telefónica / visita</option>
                  <option value="PAGO">Pago bancario</option>
                  <option value="PROMESA">Promesa de pago</option>
                  <option value="PROGRAMADO">Reporte programado</option>
                </select>
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Cartera *</label>
                <select [(ngModel)]="newRecordForm.portfolio" name="portfolio" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="BCP Comercial">BCP Comercial</option>
                  <option value="BBVA Consumo">BBVA Consumo</option>
                  <option value="Scotiabank Pyme">Scotiabank Pyme</option>
                  <option value="Interbank Personal">Interbank Personal</option>
                  <option value="Financiera Sol">Financiera Sol</option>
                  <option value="Caja Norte">Caja Norte</option>
                </select>
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Cliente *</label>
                <input [(ngModel)]="newRecordForm.clientName" name="clientName" required type="text" placeholder="Ej. Carlos Mendoza Ruiz" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">DNI / Documento *</label>
                <input [(ngModel)]="newRecordForm.clientDoc" name="clientDoc" required type="text" placeholder="8 dígitos" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Asesor Asignado *</label>
                <select [(ngModel)]="newRecordForm.advisorName" name="advisorName" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="Valeria Quispe">Valeria Quispe</option>
                  <option value="Carlos Medina">Carlos Medina</option>
                  <option value="Lucía Torres">Lucía Torres</option>
                  <option value="Fernando Vargas">Fernando Vargas</option>
                  <option value="Ana Paredes">Ana Paredes</option>
                  <option value="Jorge Huamán">Jorge Huamán</option>
                  <option value="Patricia Soto">Patricia Soto</option>
                  <option value="Diego Salazar">Diego Salazar</option>
                  <option value="Sandra García">Sandra García</option>
                  <option value="Marco Rojas">Marco Rojas</option>
                </select>
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Monto en Soles (S/) *</label>
                <input [(ngModel)]="newRecordForm.amount" name="amount" required type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estado *</label>
                <select [(ngModel)]="newRecordForm.status" name="status" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="COMPLETADO">Completado</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="OBSERVADO">Observado</option>
                  <option value="ANULADO">Anulado</option>
                </select>
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono de Contacto</label>
                <input [(ngModel)]="newRecordForm.phone" name="phone" type="text" placeholder="9XXXXXXXX" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>
            </div>

            <div>
              <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Concepto / Tipificación</label>
              <input [(ngModel)]="newRecordForm.concept" name="concept" type="text" placeholder="Ej. Contacto Titular - Promesa de Pago" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
            </div>

            <div>
              <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Observaciones / Notas del Caso</label>
              <textarea [(ngModel)]="newRecordForm.notes" name="notes" rows="3" placeholder="Detalle acuerdos, medio de pago, fecha de abono o incidencia..." class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"></textarea>
            </div>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button type="button" (click)="service.closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-subtle">
                Guardar Registro
              </button>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="service.activeModal() === 'edit' && service.selectedRecord()"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Editar Registro {{ service.selectedRecord()?.code }} (CRUD)
            </h3>
            <button (click)="service.closeModal()" class="text-slate-400 hover:text-slate-600 text-lg">×</button>
          </div>

          <form (ngSubmit)="submitEdit()" class="p-6 space-y-4 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Cliente</label>
                <input [value]="service.selectedRecord()?.clientName" disabled class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed" />
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Cartera</label>
                <select [(ngModel)]="editRecordForm.portfolio" name="editPortfolio" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="BCP Comercial">BCP Comercial</option>
                  <option value="BBVA Consumo">BBVA Consumo</option>
                  <option value="Scotiabank Pyme">Scotiabank Pyme</option>
                  <option value="Interbank Personal">Interbank Personal</option>
                  <option value="Financiera Sol">Financiera Sol</option>
                  <option value="Caja Norte">Caja Norte</option>
                </select>
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Asesor Asignado</label>
                <select [(ngModel)]="editRecordForm.advisorName" name="editAdvisor" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="Valeria Quispe">Valeria Quispe</option>
                  <option value="Carlos Medina">Carlos Medina</option>
                  <option value="Lucía Torres">Lucía Torres</option>
                  <option value="Fernando Vargas">Fernando Vargas</option>
                  <option value="Ana Paredes">Ana Paredes</option>
                  <option value="Jorge Huamán">Jorge Huamán</option>
                  <option value="Patricia Soto">Patricia Soto</option>
                  <option value="Diego Salazar">Diego Salazar</option>
                  <option value="Sandra García">Sandra García</option>
                  <option value="Marco Rojas">Marco Rojas</option>
                </select>
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Monto en Soles (S/)</label>
                <input [(ngModel)]="editRecordForm.amount" name="editAmount" type="number" step="0.01" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                <select [(ngModel)]="editRecordForm.status" name="editStatus" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <option value="COMPLETADO">Completado</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="OBSERVADO">Observado</option>
                  <option value="ANULADO">Anulado</option>
                </select>
              </div>

              <div>
                <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                <input [(ngModel)]="editRecordForm.phone" name="editPhone" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
              </div>
            </div>

            <div>
              <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Concepto / Tipificación</label>
              <input [(ngModel)]="editRecordForm.concept" name="editConcept" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
            </div>

            <div>
              <label class="block font-medium text-slate-700 dark:text-slate-300 mb-1">Observaciones</label>
              <textarea [(ngModel)]="editRecordForm.notes" name="editNotes" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"></textarea>
            </div>

            <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button type="button" (click)="service.closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold">
                Cancelar
              </button>
              <button type="submit" class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-subtle">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>

      <div *ngIf="service.activeModal() === 'delete' && service.selectedRecord()"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 text-xs">
          <div class="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            ¿Eliminar el registro {{ service.selectedRecord()?.code }}?
          </h3>

          <p class="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Esta acción retirará el registro de cobranza del cliente <strong class="text-slate-800 dark:text-slate-200">{{ service.selectedRecord()?.clientName }}</strong> por el monto de <strong class="font-mono text-slate-800 dark:text-slate-200">{{ service.selectedRecord()?.amount | currencyPen }}</strong>.
          </p>

          <div class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 mb-5 space-y-1">
            <div class="flex justify-between">
              <span class="text-slate-400">Operación:</span>
              <span class="font-mono font-medium text-slate-700 dark:text-slate-300">{{ service.selectedRecord()?.operationNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Cartera:</span>
              <span class="text-slate-700 dark:text-slate-300">{{ service.selectedRecord()?.portfolio }}</span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5">
            <button (click)="service.closeModal()" class="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold">
              Cancelar
            </button>
            <button (click)="confirmDelete()" class="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-subtle">
              Sí, Eliminar Registro
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="service.activeModal() === 'detail' && service.selectedRecord()"
           class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 text-xs space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">{{ service.selectedRecord()?.category }}</span>
              <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ service.selectedRecord()?.code }}</h3>
            </div>
            <button (click)="service.closeModal()" class="text-slate-400 hover:text-slate-600 text-lg">×</button>
          </div>

          <div class="grid grid-cols-2 gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span class="text-slate-400 block text-[10px] uppercase">Cliente</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">{{ service.selectedRecord()?.clientName }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase">Documento</span>
              <span class="font-mono text-slate-800 dark:text-slate-200">{{ service.selectedRecord()?.clientDoc }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase">Cartera</span>
              <span class="text-slate-800 dark:text-slate-200">{{ service.selectedRecord()?.portfolio }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase">Operación</span>
              <span class="font-mono text-slate-800 dark:text-slate-200">{{ service.selectedRecord()?.operationNumber }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase">Monto</span>
              <span class="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{{ service.selectedRecord()?.amount | currencyPen }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-[10px] uppercase">Estado</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">{{ service.selectedRecord()?.status }}</span>
            </div>
          </div>

          <div>
            <span class="text-slate-400 block text-[10px] uppercase mb-1">Concepto / Tipificación</span>
            <p class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium">
              {{ service.selectedRecord()?.concept }}
            </p>
          </div>

          <div>
            <span class="text-slate-400 block text-[10px] uppercase mb-1">Observaciones Registradas</span>
            <p class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 leading-relaxed">
              {{ service.selectedRecord()?.notes || 'Sin observaciones registradas.' }}
            </p>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            <span>Gestor: {{ service.selectedRecord()?.advisorName }}</span>
            <span>Fecha: {{ service.selectedRecord()?.date }}</span>
          </div>

          <div class="flex justify-end pt-1">
            <button (click)="service.closeModal()" class="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold shadow-subtle">
              Cerrar Ficha
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="service.toastMessage()"
           class="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xl text-xs font-semibold animate-slide-up">
        <svg class="w-4 h-4 text-emerald-400 dark:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>{{ service.toastMessage() }}</span>
      </div>

    </div>
  `
})
export class ReportesComponent {
  service = inject(ReportesService);

  newRecordForm: Partial<ReportRecord> = {
    category: 'GESTION',
    portfolio: 'BCP Comercial',
    advisorName: 'Valeria Quispe',
    status: 'COMPLETADO',
    amount: 1200.00,
    concept: 'Contacto Titular - Promesa de Pago',
    notes: 'Compromiso pactado para fecha límite.',
    clientName: '',
    clientDoc: '',
    phone: ''
  };

  editRecordForm: Partial<ReportRecord> = {};

  getCategoryBadgeClass(category: ReportCategory): string {
    switch (category) {
      case 'GESTION': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800';
      case 'PAGO': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800';
      case 'PROMESA': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800';
      case 'PROGRAMADO': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  }

  getStatusBadgeClass(status: ReportStatus): string {
    switch (status) {
      case 'COMPLETADO': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'PENDIENTE': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      case 'OBSERVADO': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
      case 'ANULADO': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  }

  getStatusDotClass(status: ReportStatus): string {
    switch (status) {
      case 'COMPLETADO': return 'bg-emerald-500';
      case 'PENDIENTE': return 'bg-amber-500';
      case 'OBSERVADO': return 'bg-rose-500';
      case 'ANULADO': return 'bg-slate-400';
    }
  }

  submitCreate() {
    if (!this.newRecordForm.clientName || !this.newRecordForm.clientDoc) {
      this.service.showToast('Por favor ingrese nombre y documento del cliente');
      return;
    }
    this.service.createRecord(this.newRecordForm);
    this.newRecordForm = {
      category: 'GESTION',
      portfolio: 'BCP Comercial',
      advisorName: 'Valeria Quispe',
      status: 'COMPLETADO',
      amount: 1200.00,
      concept: 'Contacto Titular - Promesa de Pago',
      notes: '',
      clientName: '',
      clientDoc: '',
      phone: ''
    };
  }

  submitEdit() {
    const current = this.service.selectedRecord();
    if (current) {
      this.service.updateRecord(current.id, this.editRecordForm);
    }
  }

  confirmDelete() {
    const current = this.service.selectedRecord();
    if (current) {
      this.service.deleteRecord(current.id);
    }
  }
}
