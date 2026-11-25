import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarteraService } from '../../cartera/services/cartera.service';
import { CurrencyPenPipe } from '../../../shared/pipes/currency-pen.pipe';
import { StatusBadgeComponent } from '../../../shared/components/badge/status-badge.component';

@Component({
  selector: 'app-debtor-slide-over',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPenPipe, StatusBadgeComponent],
  template: `

    <div *ngIf="cartera.isSlideOverOpen()"
         (click)="cartera.closeDebtorDrawer()"
         class="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity duration-300">
    </div>

    <div [ngClass]="cartera.isSlideOverOpen() ? 'translate-x-0' : 'translate-x-full'"
         class="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">

      <ng-container *ngIf="cartera.selectedDebtor() as debtor">

        <div class="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {{ debtor.documentType }}: {{ debtor.documentNumber }}
              </span>
              <app-status-badge [status]="debtor.status"></app-status-badge>
              <span [ngClass]="getScoringClass(debtor.scoring)" class="text-xs font-bold px-2 py-0.5 rounded border">
                Scoring: {{ debtor.scoring }}
              </span>
            </div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {{ debtor.name }}
            </h2>
            <p *ngIf="debtor.legalRepresentative" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rep: {{ debtor.legalRepresentative }}
            </p>
          </div>

          <button (click)="cartera.closeDebtorDrawer()"
                  class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-6 py-3.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4">
          <div>
            <p class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Deuda Vencida</p>
            <p class="text-base font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {{ debtor.overdueDebt | currencyPen }}
            </p>
          </div>
          <div>
            <p class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Mora Acumulada</p>
            <p class="text-base font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {{ debtor.daysOverdue }} días
            </p>
          </div>
          <div>
            <p class="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Deuda Total</p>
            <p class="text-base font-bold font-mono text-slate-600 dark:text-slate-300 tabular-nums">
              {{ debtor.totalDebt | currencyPen }}
            </p>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-between">
              <span>Directorio de Contacto</span>
              <span class="text-[11px] font-normal normal-case text-slate-500">{{ debtor.city }}</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div *ngFor="let phone of debtor.phones"
                   class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between hover:border-slate-300 transition-colors">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">{{ phone.number }}</span>
                    <span *ngIf="phone.verified" title="Teléfono validado" class="text-emerald-600 text-xs">✓</span>
                  </div>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ phone.label }}</p>
                </div>
                <div class="flex items-center gap-1">

                  <a [href]="'tel:' + phone.number" class="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300" title="Iniciar llamada">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </a>

                  <a *ngIf="phone.type === 'WHATSAPP' || phone.type === 'MOVIL_TITULAR'"
                     [href]="'https://wa.me/' + phone.number.replace('+', '').replace(/\\s/g, '')" target="_blank"
                     class="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-emerald-600" title="Mensaje WhatsApp">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.004.548 1.956.815 2.806.815 3.182 0 5.769-2.587 5.77-5.766.001-3.181-2.586-5.768-5.77-5.768zm3.36 8.211c-.143.403-.728.775-1.026.824-.298.05-.679.08-2.091-.497-1.706-.696-2.808-2.433-2.893-2.546-.086-.113-.688-.915-.688-1.745 0-.83.434-1.238.589-1.408.155-.17.339-.212.453-.212.114 0 .227.001.326.006.104.005.244-.04.382.291.143.344.489 1.192.532 1.278.043.086.072.186.014.3-.058.114-.087.186-.172.285-.086.1-.182.223-.26.299-.086.086-.176.18-.076.353.1.172.443.731.951 1.183.654.582 1.206.762 1.378.848.172.086.273.072.373-.043.101-.115.432-.503.547-.676.115-.172.23-.143.387-.086.158.058 1.004.474 1.177.56.173.086.288.13.331.202.043.072.043.418-.1.821z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-between">
              <span>Facturas y Pagarés Vencidos</span>
              <span class="text-[11px] font-mono text-slate-500">{{ debtor.invoices.length }} documentos</span>
            </h3>
            <div class="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table class="w-full text-xs">
                <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-medium">
                  <tr>
                    <th class="px-3 py-2 text-left">Documento</th>
                    <th class="px-3 py-2 text-left">Vencimiento</th>
                    <th class="px-3 py-2 text-right">Mora</th>
                    <th class="px-3 py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
                  <tr *ngFor="let inv of debtor.invoices" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td class="px-3 py-2.5 font-mono font-medium text-slate-900 dark:text-slate-200">{{ inv.documentNumber }}</td>
                    <td class="px-3 py-2.5 text-slate-500 font-mono">{{ inv.dueDate }}</td>
                    <td class="px-3 py-2.5 text-right font-mono font-semibold" [ngClass]="inv.daysOverdue > 30 ? 'text-rose-600' : 'text-amber-600'">
                      {{ inv.daysOverdue }}d
                    </td>
                    <td class="px-3 py-2.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {{ inv.balanceDue | currencyPen }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-between">
              <span>Historial Cronológico de Gestiones</span>
              <span class="text-[11px] text-slate-500 font-normal">Últimas acciones</span>
            </h3>

            <div class="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 space-y-4 py-1">
              <div *ngFor="let h of debtor.managementHistory" class="relative pl-6">

                <div class="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-600"></div>

                <div class="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                  <div class="flex items-center justify-between gap-2 mb-1">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-slate-800 dark:text-slate-200">{{ h.advisorName }}</span>
                      <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {{ h.channel }}
                      </span>
                    </div>
                    <span class="font-mono text-[11px] text-slate-400">{{ h.date }}</span>
                  </div>

                  <p class="font-medium text-slate-700 dark:text-slate-300">
                    {{ h.tipificacionN1 }} › <span class="text-indigo-600 dark:text-indigo-400">{{ h.tipificacionN2 }}</span>
                  </p>

                  <p class="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {{ h.notes }}
                  </p>

                  <div *ngIf="h.promiseAmount" class="mt-2 p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center justify-between font-mono">
                    <span>Promesa acordada:</span>
                    <strong class="font-bold">{{ h.promiseAmount | currencyPen }} ({{ h.promiseDate }})</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        <div class="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center justify-between">
            <span>Registrar Nueva Gestión</span>
            <span class="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Modo Rápido
            </span>
          </h4>

          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-2.5">

              <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-1">Canal de Contacto</label>
                <select [(ngModel)]="newRecord.channel" class="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none">
                  <option value="LLAMADA">Llamada telefónica</option>
                  <option value="WHATSAPP">WhatsApp empresarial</option>
                  <option value="CORREO">Correo electrónico</option>
                  <option value="VISITA">Visita domiciliaria</option>
                </select>
              </div>

              <div>
                <label class="block text-[11px] font-medium text-slate-500 mb-1">Resultado (N2)</label>
                <select [(ngModel)]="newRecord.tipificacionN2" (change)="onResultChange()" class="w-full text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none">
                  <option value="Promesa de pago">Promesa de pago</option>
                  <option value="En negociación de convenio">En negociación</option>
                  <option value="Volver a llamar">Volver a llamar</option>
                  <option value="Negativa de pago">Negativa de pago</option>
                  <option value="Teléfono apagado / Ilocalizado">No contactado</option>
                </select>
              </div>
            </div>

            <div *ngIf="newRecord.tipificacionN2 === 'Promesa de pago'" class="grid grid-cols-2 gap-2.5 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <div>
                <label class="block text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Fecha Compromiso</label>
                <input type="date" [(ngModel)]="newRecord.promiseDate" class="w-full text-xs py-1 px-2 rounded border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 font-mono" />
              </div>
              <div>
                <label class="block text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 mb-1">Monto Promesa (S/)</label>
                <input type="number" [(ngModel)]="newRecord.promiseAmount" placeholder="0.00" class="w-full text-xs py-1 px-2 rounded border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 font-mono" />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-500 mb-1">Observaciones de la llamada</label>
              <textarea [(ngModel)]="newRecord.notes" rows="2" placeholder="Resumen de acuerdo o comentarios..." class="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none"></textarea>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <button (click)="submitManagement(debtor.id)"
                      [disabled]="!newRecord.notes"
                      class="flex-1 py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Guardar Gestión y Actualizar Fila
              </button>
            </div>
          </div>
        </div>

      </ng-container>
    </div>
  `
})
export class DebtorSlideOverComponent {
  cartera = inject(CarteraService);

  newRecord = {
    channel: 'LLAMADA' as const,
    tipificacionN1: 'Contacto directo',
    tipificacionN2: 'Promesa de pago',
    promiseDate: '2026-11-28',
    promiseAmount: 15000,
    notes: ''
  };

  onResultChange() {
    if (this.newRecord.tipificacionN2 === 'Teléfono apagado / Ilocalizado') {
      this.newRecord.tipificacionN1 = 'No contacto';
      this.newRecord.promiseAmount = 0;
    } else {
      this.newRecord.tipificacionN1 = 'Contacto directo';
    }
  }

  getScoringClass(scoring: string): string {
    switch (scoring) {
      case 'A': return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300';
      case 'B': return 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300';
      case 'C': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300';
      case 'D': return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  }

  submitManagement(debtorId: string) {
    if (!this.newRecord.notes) return;

    this.cartera.registerManagement(debtorId, {
      channel: this.newRecord.channel,
      tipificacionN1: this.newRecord.tipificacionN1,
      tipificacionN2: this.newRecord.tipificacionN2,
      notes: this.newRecord.notes,
      promiseDate: this.newRecord.tipificacionN2 === 'Promesa de pago' ? this.newRecord.promiseDate : undefined,
      promiseAmount: this.newRecord.tipificacionN2 === 'Promesa de pago' ? Number(this.newRecord.promiseAmount) : undefined
    });

    this.newRecord.notes = '';
  }
}
