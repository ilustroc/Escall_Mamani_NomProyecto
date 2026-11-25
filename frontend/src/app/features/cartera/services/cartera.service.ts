import { Injectable, signal, computed } from '@angular/core';
import { Debtor, DebtStatus, MoraSegment, ManagementRecord } from '../../../core/models/debtor.types';
import { MOCK_DEBTORS, MOCK_KPIS } from '../../../mocks/deudores.mock';

@Injectable({
  providedIn: 'root'
})
export class CarteraService {
  // Estado base con signals
  private debtorsList = signal<Debtor[]>(MOCK_DEBTORS);
  searchTerm = signal<string>('');
  selectedSegment = signal<MoraSegment>('TODOS');
  selectedStatus = signal<DebtStatus | 'TODOS'>('TODOS');
  sortField = signal<keyof Debtor>('daysOverdue');
  sortDirection = signal<'asc' | 'desc'>('desc');

  // Slide-over state
  selectedDebtor = signal<Debtor | null>(null);
  isSlideOverOpen = signal<boolean>(false);

  // KPIs
  kpis = signal(MOCK_KPIS);

  // Lista filtrada y ordenada computada
  filteredDebtors = computed(() => {
    let list = [...this.debtorsList()];
    const query = this.searchTerm().trim().toLowerCase();
    const segment = this.selectedSegment();
    const status = this.selectedStatus();
    const field = this.sortField();
    const direction = this.sortDirection();

    // 1. Filtrado por texto
    if (query) {
      list = list.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.documentNumber.includes(query) ||
        d.portfolio.toLowerCase().includes(query) ||
        (d.legalRepresentative && d.legalRepresentative.toLowerCase().includes(query))
      );
    }

    // 2. Filtrado por tramo de mora
    if (segment !== 'TODOS') {
      list = list.filter(d => {
        switch (segment) {
          case '0_15': return d.daysOverdue >= 0 && d.daysOverdue <= 15;
          case '16_30': return d.daysOverdue >= 16 && d.daysOverdue <= 30;
          case '31_60': return d.daysOverdue >= 31 && d.daysOverdue <= 60;
          case '61_90': return d.daysOverdue >= 61 && d.daysOverdue <= 90;
          case 'MAS_90': return d.daysOverdue > 90;
          default: return true;
        }
      });
    }

    // 3. Filtrado por estado
    if (status !== 'TODOS') {
      list = list.filter(d => d.status === status);
    }

    // 4. Ordenamiento
    list.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      return direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return list;
  });

  // Métodos de control
  setSearch(term: string) {
    this.searchTerm.set(term);
  }

  setSegment(segment: MoraSegment) {
    this.selectedSegment.set(segment);
  }

  setStatus(status: DebtStatus | 'TODOS') {
    this.selectedStatus.set(status);
  }

  toggleSort(field: keyof Debtor) {
    if (this.sortField() === field) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  openDebtorDrawer(debtor: Debtor) {
    this.selectedDebtor.set(debtor);
    this.isSlideOverOpen.set(true);
  }

  closeDebtorDrawer() {
    this.isSlideOverOpen.set(false);
  }

  // Registrar gestión o promesa reactivamente
  registerManagement(debtorId: string, record: {
    channel: 'LLAMADA' | 'WHATSAPP' | 'CORREO' | 'VISITA';
    tipificacionN1: string;
    tipificacionN2: string;
    notes: string;
    promiseDate?: string;
    promiseAmount?: number;
    newStatus?: DebtStatus;
  }) {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('es-PE')} ${now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`;

    const newRecord: ManagementRecord = {
      id: 'h-' + Date.now(),
      date: formattedDate,
      advisorName: 'Valeria Quispe (Tú)',
      channel: record.channel,
      tipificacionN1: record.tipificacionN1,
      tipificacionN2: record.tipificacionN2,
      notes: record.notes,
      promiseDate: record.promiseDate,
      promiseAmount: record.promiseAmount
    };

    this.debtorsList.update(list => {
      return list.map(d => {
        if (d.id === debtorId) {
          const updatedHistory = [newRecord, ...d.managementHistory];
          const updatedStatus = record.newStatus || (record.promiseAmount ? 'EN_NEGOCIACION' : d.status);
          const updatedResult = record.promiseAmount 
            ? `Promesa S/ ${record.promiseAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}` 
            : record.tipificacionN2;

          const updatedDebtor: Debtor = {
            ...d,
            managementHistory: updatedHistory,
            lastManagementDate: 'Hace un momento',
            lastManagementResult: updatedResult,
            status: updatedStatus,
            nextActionDate: record.promiseDate || d.nextActionDate,
            nextActionType: record.promiseAmount ? 'Seguimiento de promesa' : d.nextActionType
          };

          // Actualizar deudor seleccionado si está abierto
          if (this.selectedDebtor()?.id === debtorId) {
            this.selectedDebtor.set(updatedDebtor);
          }

          return updatedDebtor;
        }
        return d;
      });
    });
  }
}
