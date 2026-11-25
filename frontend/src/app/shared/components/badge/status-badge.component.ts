import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebtStatus } from '../../../core/models/debtor.types';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="badgeClasses" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors">
      <span [ngClass]="dotClasses" class="w-1.5 h-1.5 rounded-full"></span>
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: DebtStatus;

  get label(): string {
    switch (this.status) {
      case 'AL_DIA': return 'Al día';
      case 'POR_VENCER': return 'Por vencer';
      case 'MORA_CRITICA': return 'Mora crítica';
      case 'EN_NEGOCIACION': return 'En negociación';
      default: return this.status;
    }
  }

  get badgeClasses(): string {
    switch (this.status) {
      case 'AL_DIA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
      case 'POR_VENCER':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
      case 'MORA_CRITICA':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
      case 'EN_NEGOCIACION':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  }

  get dotClasses(): string {
    switch (this.status) {
      case 'AL_DIA': return 'bg-emerald-500';
      case 'POR_VENCER': return 'bg-amber-500';
      case 'MORA_CRITICA': return 'bg-rose-500 animate-pulse';
      case 'EN_NEGOCIACION': return 'bg-sky-500';
      default: return 'bg-slate-500';
    }
  }
}
