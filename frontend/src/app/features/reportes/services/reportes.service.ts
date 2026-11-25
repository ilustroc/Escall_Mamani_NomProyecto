import { Injectable, signal, computed } from '@angular/core';

export type ReportCategory = 'GESTION' | 'PAGO' | 'PROMESA' | 'PROGRAMADO';
export type ReportStatus = 'COMPLETADO' | 'PENDIENTE' | 'OBSERVADO' | 'ANULADO';

export interface ReportRecord {
  id: string;
  code: string;
  category: ReportCategory;
  date: string;
  clientName: string;
  clientDoc: string;
  operationNumber: string;
  portfolio: string;
  advisorName: string;
  concept: string;
  amount: number;
  status: ReportStatus;
  notes: string;
  phone?: string;
  channel?: string;
}

export interface ReportFilters {
  search: string;
  category: ReportCategory | 'TODOS';
  portfolio: string;
  advisor: string;
  status: ReportStatus | 'TODOS';
  period: 'TODOS' | 'HOY' | '7_DIAS' | 'ESTE_MES' | '90_DIAS';
}

export interface ReportSummary {
  totalRecords: number;
  totalAmount: number;
  avgAmount: number;
  completionRate: number;
}

const INITIAL_REPORTS_SEED: ReportRecord[] = [
  {
    id: 'REP-1001',
    code: 'GES-2026-0841',
    category: 'GESTION',
    date: '2026-11-25 10:45',
    clientName: 'Juan Carlos Quispe Mamani',
    clientDoc: '10293847',
    operationNumber: 'OP-BCP-10029',
    portfolio: 'BCP Comercial',
    advisorName: 'Valeria Quispe',
    concept: 'Contacto Titular - Promesa de Pago',
    amount: 1450.00,
    status: 'COMPLETADO',
    notes: 'Cliente confirma abono de cuota antes de las 18:00 hrs vía banca móvil BCP.',
    phone: '987112233',
    channel: 'Llamada telefónica'
  },
  {
    id: 'REP-1002',
    code: 'PAG-2026-0249',
    category: 'PAGO',
    date: '2026-11-25 09:15',
    clientName: 'Rosa Elena Flores Vargas',
    clientDoc: '40918273',
    operationNumber: 'OP-BBVA-20441',
    portfolio: 'BBVA Consumo',
    advisorName: 'Carlos Medina',
    concept: 'Abono en Ventanilla BBVA',
    amount: 3200.00,
    status: 'COMPLETADO',
    notes: 'Operación bancaria OP-BBVA-77491 conciliada y cancelada en sistema.',
    phone: '998443322',
    channel: 'Banca por Internet'
  },
  {
    id: 'REP-1003',
    code: 'PRO-2026-0188',
    category: 'PROMESA',
    date: '2026-11-25 11:30',
    clientName: 'Manuel Antonio Sánchez Ruiz',
    clientDoc: '08765432',
    operationNumber: 'OP-SCO-30112',
    portfolio: 'Scotiabank Pyme',
    advisorName: 'Lucía Torres',
    concept: 'Compromiso de Amortización Capital',
    amount: 4850.00,
    status: 'PENDIENTE',
    notes: 'Deudor acuerda amortización del 50% con cheque de gerencia para el 28/11.',
    phone: '976554433',
    channel: 'WhatsApp Business'
  },
  {
    id: 'REP-1004',
    code: 'GES-2026-0839',
    category: 'GESTION',
    date: '2026-11-24 16:20',
    clientName: 'Carmen Rosa Mendoza Chávez',
    clientDoc: '21839401',
    operationNumber: 'OP-INT-40552',
    portfolio: 'Interbank Personal',
    advisorName: 'Fernando Vargas',
    concept: 'Contacto Tercero - Recado a Familiar',
    amount: 2150.00,
    status: 'OBSERVADO',
    notes: 'Atiende cónyuge; indica que el titular se encuentra de viaje. Reagendado para el jueves.',
    phone: '965443311',
    channel: 'Llamada telefónica'
  },
  {
    id: 'REP-1005',
    code: 'PAG-2026-0248',
    category: 'PAGO',
    date: '2026-11-24 14:10',
    clientName: 'Víctor Hugo Paredes Castro',
    clientDoc: '72615438',
    operationNumber: 'OP-SOL-50119',
    portfolio: 'Financiera Sol',
    advisorName: 'Ana Paredes',
    concept: 'Cancelación Total con Descuento',
    amount: 5800.00,
    status: 'COMPLETADO',
    notes: 'Aplicó campaña de condonación de intereses moratorios. Carta de no adeudo generada.',
    phone: '954332211',
    channel: 'Transferencia Interbancaria'
  },
  {
    id: 'REP-1006',
    code: 'PRO-2026-0187',
    category: 'PROMESA',
    date: '2026-11-24 12:00',
    clientName: 'Teresa De Jesús Silva Morales',
    clientDoc: '09871234',
    operationNumber: 'OP-CAJ-60228',
    portfolio: 'Caja Norte',
    advisorName: 'Jorge Huamán',
    concept: 'Promesa Pago Cuota Vencida',
    amount: 980.00,
    status: 'PENDIENTE',
    notes: 'Cliente promete acercarse a agencia de San Martín el viernes al mediodía.',
    phone: '943221100',
    channel: 'Llamada telefónica'
  },
  {
    id: 'REP-1007',
    code: 'REP-2026-0042',
    category: 'PROGRAMADO',
    date: '2026-11-24 08:00',
    clientName: 'Consolidado Cartera BCP',
    clientDoc: '20100047218',
    operationNumber: 'BAT-2026-Q4-01',
    portfolio: 'BCP Comercial',
    advisorName: 'Sandra García',
    concept: 'Auditoría Mensual de Tramos y Recupero',
    amount: 142500.00,
    status: 'COMPLETADO',
    notes: 'Informe gerencial consolidado para comité de riesgo. Exportado a matriz ejecutiva.',
    phone: '014221100',
    channel: 'Servicio Automático'
  },
  {
    id: 'REP-1008',
    code: 'GES-2026-0838',
    category: 'GESTION',
    date: '2026-11-23 17:40',
    clientName: 'Jorge Luis Huamán Ramos',
    clientDoc: '43928172',
    operationNumber: 'OP-BCP-10034',
    portfolio: 'BCP Comercial',
    advisorName: 'Valeria Quispe',
    concept: 'Sin Contacto - Buzón de Voz',
    amount: 3600.00,
    status: 'OBSERVADO',
    notes: 'Segundo intento del día sin respuesta. Notificación de cobranza remitida vía SMS.',
    phone: '932110099',
    channel: 'Llamada telefónica'
  },
  {
    id: 'REP-1009',
    code: 'PAG-2026-0247',
    category: 'PAGO',
    date: '2026-11-23 15:30',
    clientName: 'Patricia Del Pilar Soto Guzmán',
    clientDoc: '15827364',
    operationNumber: 'OP-BBVA-20448',
    portfolio: 'BBVA Consumo',
    advisorName: 'Patricia Soto',
    concept: 'Abono Parcial de Capital',
    amount: 1850.00,
    status: 'COMPLETADO',
    notes: 'Ref. Yape/Plin número B-881923. Aplicado a la cuota 4 de refinanciamiento.',
    phone: '921009988',
    channel: 'Billetera Digital'
  },
  {
    id: 'REP-1010',
    code: 'PRO-2026-0186',
    category: 'PROMESA',
    date: '2026-11-23 11:15',
    clientName: 'César Augusto Vega Benítez',
    clientDoc: '07654321',
    operationNumber: 'OP-SCO-30118',
    portfolio: 'Scotiabank Pyme',
    advisorName: 'Diego Salazar',
    concept: 'Compromiso por Venta de Mercadería',
    amount: 7400.00,
    status: 'PENDIENTE',
    notes: 'Titular de negocio mayorista compromete cancelación con liquidación de factura comercial.',
    phone: '910998877',
    channel: 'WhatsApp Business'
  },
  {
    id: 'REP-1011',
    code: 'GES-2026-0837',
    category: 'GESTION',
    date: '2026-11-22 16:50',
    clientName: 'Elena Beatriz Navarro Campos',
    clientDoc: '31827465',
    operationNumber: 'OP-INT-40559',
    portfolio: 'Interbank Personal',
    advisorName: 'Carlos Medina',
    concept: 'Contacto Titular - Negativa de Pago',
    amount: 6200.00,
    status: 'ANULADO',
    notes: 'Cliente manifiesta desacuerdo con tasa de interés compensatorio. Derivado a reclamos.',
    phone: '988776655',
    channel: 'Llamada telefónica'
  },
  {
    id: 'REP-1012',
    code: 'PAG-2026-0246',
    category: 'PAGO',
    date: '2026-11-22 10:20',
    clientName: 'Héctor Raúl Morales Delgado',
    clientDoc: '70918234',
    operationNumber: 'OP-SOL-50125',
    portfolio: 'Financiera Sol',
    advisorName: 'Marco Rojas',
    concept: 'Pago Cuota Refinanciada',
    amount: 2450.00,
    status: 'COMPLETADO',
    notes: 'Pago validado contra extracto bancario del día. Próximo vencimiento 22/12/2026.',
    phone: '977665544',
    channel: 'Banca por Internet'
  },
  {
    id: 'REP-1013',
    code: 'REP-2026-0041',
    category: 'PROGRAMADO',
    date: '2026-11-21 18:00',
    clientName: 'Control Semanal de Cuentas Castigadas',
    clientDoc: '20501238910',
    operationNumber: 'BAT-2026-Q4-02',
    portfolio: 'Caja Norte',
    advisorName: 'Marco Rojas',
    concept: 'Reporte de Eficiencia Judicial',
    amount: 88900.00,
    status: 'COMPLETADO',
    notes: 'Evaluación de expedientes en tramo judicial superior a 180 días.',
    phone: '017182900',
    channel: 'Servicio Automático'
  },
  {
    id: 'REP-1014',
    code: 'PRO-2026-0185',
    category: 'PROMESA',
    date: '2026-11-21 14:30',
    clientName: 'Lucía Fernanda Cruz Romero',
    clientDoc: '25839401',
    operationNumber: 'OP-BCP-10042',
    portfolio: 'BCP Comercial',
    advisorName: 'Valeria Quispe',
    concept: 'Promesa con Descuento Especial',
    amount: 3100.00,
    status: 'PENDIENTE',
    notes: 'Aprobación de gerencia para condonación de moras si cancela el 27/11.',
    phone: '966554433',
    channel: 'WhatsApp Business'
  },
  {
    id: 'REP-1015',
    code: 'GES-2026-0836',
    category: 'GESTION',
    date: '2026-11-20 11:10',
    clientName: 'Miguel Ángel Aguirre Lozano',
    clientDoc: '08192837',
    operationNumber: 'OP-BBVA-20455',
    portfolio: 'BBVA Consumo',
    advisorName: 'Lucía Torres',
    concept: 'Contacto Titular - Solicitud de Convenio',
    amount: 4500.00,
    status: 'PENDIENTE',
    notes: 'Titular solicita fraccionamiento en 6 cuotas mensuales. En evaluación de supervisor.',
    phone: '955443322',
    channel: 'Llamada telefónica'
  },
  {
    id: 'REP-1016',
    code: 'PAG-2026-0245',
    category: 'PAGO',
    date: '2026-11-20 09:40',
    clientName: 'Silvia Cristina Romero Salas',
    clientDoc: '42819302',
    operationNumber: 'OP-SCO-30125',
    portfolio: 'Scotiabank Pyme',
    advisorName: 'Fernando Vargas',
    concept: 'Abono Depósito en Efectivo',
    amount: 5120.00,
    status: 'COMPLETADO',
    notes: 'Conciliación bancaria cerrada con número de voucher Scotiabank 994012.',
    phone: '944332211',
    channel: 'Depósito Agente'
  },
  {
    id: 'REP-1017',
    code: 'GES-2026-0835',
    category: 'GESTION',
    date: '2026-11-19 15:55',
    clientName: 'Guillermo Enrique Peña Ortiz',
    clientDoc: '10928374',
    operationNumber: 'OP-INT-40566',
    portfolio: 'Interbank Personal',
    advisorName: 'Ana Paredes',
    concept: 'Ilocalizable - Verificación Domiciliaria',
    amount: 8900.00,
    status: 'OBSERVADO',
    notes: 'Dirección no corresponde al titular según informe de mensajería. Requiere rastreo.',
    phone: '933221100',
    channel: 'Visita domiciliaria'
  },
  {
    id: 'REP-1018',
    code: 'PRO-2026-0184',
    category: 'PROMESA',
    date: '2026-11-19 12:20',
    clientName: 'Adriana Maribel Medina Flores',
    clientDoc: '71829304',
    operationNumber: 'OP-SOL-50133',
    portfolio: 'Financiera Sol',
    advisorName: 'Jorge Huamán',
    concept: 'Compromiso Pago de Saldo',
    amount: 1750.00,
    status: 'COMPLETADO',
    notes: 'Promesa cumplida y verificada con el área de operaciones.',
    phone: '922110099',
    channel: 'Llamada telefónica'
  },
  {
    id: 'REP-1019',
    code: 'PAG-2026-0244',
    category: 'PAGO',
    date: '2026-11-18 16:15',
    clientName: 'Roberto Carlos Díaz Valenzuela',
    clientDoc: '09182736',
    operationNumber: 'OP-CAJ-60235',
    portfolio: 'Caja Norte',
    advisorName: 'Patricia Soto',
    concept: 'Cancelación Crédito Pyme',
    amount: 11200.00,
    status: 'COMPLETADO',
    notes: 'Cancelación total con abono en cheque certificado. Cuenta liquidada.',
    phone: '911009988',
    channel: 'Cheque Certificado'
  },
  {
    id: 'REP-1020',
    code: 'GES-2026-0834',
    category: 'GESTION',
    date: '2026-11-18 10:05',
    clientName: 'Gloria Mercedes Castillo Vera',
    clientDoc: '44819203',
    operationNumber: 'OP-BCP-10049',
    portfolio: 'BCP Comercial',
    advisorName: 'Diego Salazar',
    concept: 'Contacto Titular - Promesa Fin de Mes',
    amount: 2890.00,
    status: 'PENDIENTE',
    notes: 'Titular pagará con gratificación adelantada el día 30 de noviembre.',
    phone: '900998877',
    channel: 'Llamada telefónica'
  }
];

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private recordsList = signal<ReportRecord[]>(INITIAL_REPORTS_SEED);

  filters = signal<ReportFilters>({
    search: '',
    category: 'TODOS',
    portfolio: 'TODOS',
    advisor: 'TODOS',
    status: 'TODOS',
    period: 'TODOS'
  });

  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  selectedRecord = signal<ReportRecord | null>(null);
  activeModal = signal<'none' | 'create' | 'edit' | 'delete' | 'detail'>('none');
  toastMessage = signal<string | null>(null);

  filteredRecords = computed(() => {
    let list = [...this.recordsList()];
    const f = this.filters();
    const query = f.search.trim().toLowerCase();

    if (query) {
      list = list.filter(r =>
        r.clientName.toLowerCase().includes(query) ||
        r.clientDoc.includes(query) ||
        r.operationNumber.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        r.advisorName.toLowerCase().includes(query)
      );
    }

    if (f.category !== 'TODOS') {
      list = list.filter(r => r.category === f.category);
    }

    if (f.portfolio !== 'TODOS') {
      list = list.filter(r => r.portfolio === f.portfolio);
    }

    if (f.advisor !== 'TODOS') {
      list = list.filter(r => r.advisorName === f.advisor);
    }

    if (f.status !== 'TODOS') {
      list = list.filter(r => r.status === f.status);
    }

    if (f.period !== 'TODOS') {
      const today = '2026-11-25';
      if (f.period === 'HOY') {
        list = list.filter(r => r.date.startsWith(today));
      } else if (f.period === '7_DIAS') {
        list = list.filter(r => r.date >= '2026-11-18');
      } else if (f.period === 'ESTE_MES') {
        list = list.filter(r => r.date.startsWith('2026-11'));
      }
    }

    return list;
  });

  summary = computed<ReportSummary>(() => {
    const list = this.filteredRecords();
    const totalRecords = list.length;
    const totalAmount = list.reduce((acc, r) => acc + (r.amount || 0), 0);
    const avgAmount = totalRecords > 0 ? totalAmount / totalRecords : 0;
    const completedCount = list.filter(r => r.status === 'COMPLETADO').length;
    const completionRate = totalRecords > 0 ? (completedCount / totalRecords) * 100 : 0;

    return {
      totalRecords,
      totalAmount,
      avgAmount,
      completionRate
    };
  });

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.filteredRecords().length / this.pageSize()));
  });

  pagedRecords = computed(() => {
    const list = this.filteredRecords();
    const page = Math.min(this.currentPage(), this.totalPages());
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  setSearch(search: string) {
    this.filters.update(f => ({ ...f, search }));
    this.currentPage.set(1);
  }

  setCategory(category: ReportCategory | 'TODOS') {
    this.filters.update(f => ({ ...f, category }));
    this.currentPage.set(1);
  }

  setPortfolio(portfolio: string) {
    this.filters.update(f => ({ ...f, portfolio }));
    this.currentPage.set(1);
  }

  setAdvisor(advisor: string) {
    this.filters.update(f => ({ ...f, advisor }));
    this.currentPage.set(1);
  }

  setStatus(status: ReportStatus | 'TODOS') {
    this.filters.update(f => ({ ...f, status }));
    this.currentPage.set(1);
  }

  setPeriod(period: 'TODOS' | 'HOY' | '7_DIAS' | 'ESTE_MES' | '90_DIAS') {
    this.filters.update(f => ({ ...f, period }));
    this.currentPage.set(1);
  }

  resetFilters() {
    this.filters.set({
      search: '',
      category: 'TODOS',
      portfolio: 'TODOS',
      advisor: 'TODOS',
      status: 'TODOS',
      period: 'TODOS'
    });
    this.currentPage.set(1);
    this.showToast('Filtros restablecidos');
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  setPageSize(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  openCreateModal() {
    this.selectedRecord.set(null);
    this.activeModal.set('create');
  }

  openEditModal(record: ReportRecord) {
    this.selectedRecord.set({ ...record });
    this.activeModal.set('edit');
  }

  openDeleteModal(record: ReportRecord) {
    this.selectedRecord.set(record);
    this.activeModal.set('delete');
  }

  openDetailModal(record: ReportRecord) {
    this.selectedRecord.set(record);
    this.activeModal.set('detail');
  }

  closeModal() {
    this.activeModal.set('none');
    this.selectedRecord.set(null);
  }

  createRecord(recordData: Partial<ReportRecord>) {
    const nextNum = this.recordsList().length + 1001;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: ReportRecord = {
      id: `REP-${nextNum}`,
      code: recordData.code || `REG-${now.getFullYear()}-${String(nextNum).slice(-4)}`,
      category: recordData.category || 'GESTION',
      date: recordData.date || dateStr,
      clientName: recordData.clientName || 'Cliente sin nombre',
      clientDoc: recordData.clientDoc || '00000000',
      operationNumber: recordData.operationNumber || `OP-NEW-${nextNum}`,
      portfolio: recordData.portfolio || 'BCP Comercial',
      advisorName: recordData.advisorName || 'Valeria Quispe',
      concept: recordData.concept || 'Registro de cobranza',
      amount: Number(recordData.amount) || 0,
      status: recordData.status || 'PENDIENTE',
      notes: recordData.notes || '',
      phone: recordData.phone || '',
      channel: recordData.channel || 'Llamada telefónica'
    };

    this.recordsList.update(list => [newRecord, ...list]);
    this.closeModal();
    this.showToast(`Registro ${newRecord.code} creado exitosamente`);
  }

  updateRecord(id: string, updates: Partial<ReportRecord>) {
    this.recordsList.update(list =>
      list.map(r => r.id === id ? { ...r, ...updates } : r)
    );
    this.closeModal();
    this.showToast(`Registro ${id} actualizado correctamente`);
  }

  deleteRecord(id: string) {
    this.recordsList.update(list => list.filter(r => r.id !== id));
    this.closeModal();
    this.showToast(`Registro ${id} eliminado del sistema`);
  }

  showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  exportToCsv() {
    const list = this.filteredRecords();
    if (list.length === 0) {
      this.showToast('No hay registros para exportar');
      return;
    }

    const headers = [
      'ID',
      'Código',
      'Categoría',
      'Fecha',
      'Cliente',
      'Documento',
      'Operación',
      'Cartera',
      'Asesor',
      'Concepto',
      'Monto PEN',
      'Estado',
      'Teléfono',
      'Observaciones'
    ];

    const escapeCsv = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = list.map(r => [
      escapeCsv(r.id),
      escapeCsv(r.code),
      escapeCsv(r.category),
      escapeCsv(r.date),
      escapeCsv(r.clientName),
      escapeCsv(r.clientDoc),
      escapeCsv(r.operationNumber),
      escapeCsv(r.portfolio),
      escapeCsv(r.advisorName),
      escapeCsv(r.concept),
      escapeCsv(r.amount.toFixed(2)),
      escapeCsv(r.status),
      escapeCsv(r.phone || ''),
      escapeCsv(r.notes)
    ].join(';'));

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_cobranzas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast(`Se exportaron ${list.length} registros a CSV exitosamente`);
  }
}
