import { Debtor } from '../core/models/debtor.types';

export const MOCK_DEBTORS: Debtor[] = [
  {
    id: 'DEB-001',
    documentType: 'RUC',
    documentNumber: '20601948271',
    name: 'Corporación Minera Andina S.A.C.',
    legalRepresentative: 'Ing. Carlos Zavaleta Torres',
    portfolio: 'BCP Crédito Empresarial',
    totalDebt: 124500.00,
    overdueDebt: 84200.00,
    daysOverdue: 68,
    status: 'MORA_CRITICA',
    scoring: 'C',
    city: 'Lima - San Isidro',
    address: 'Av. Las Begonias 441, Of. 802',
    email: 'finanzas@mineraandina.pe',
    phones: [
      { id: 'p1', number: '+51 984 120 445', type: 'WHATSAPP', label: 'Gerencia Finanzas', verified: true, isPreferred: true },
      { id: 'p2', number: '+51 1 422 9080', type: 'FIJO_CASA', label: 'Central Telefónica', verified: true, isPreferred: false },
      { id: 'p3', number: '+51 997 341 298', type: 'MOVIL_LABORAL', label: 'Representante Legal', verified: true, isPreferred: false }
    ],
    invoices: [
      { id: 'inv1', documentNumber: 'FACT-001-00892', issueDate: '2026-08-15', dueDate: '2026-09-18', daysOverdue: 68, totalAmount: 48000.00, balanceDue: 48000.00, currency: 'PEN', status: 'VENCIDO' },
      { id: 'inv2', documentNumber: 'FACT-001-00914', issueDate: '2026-09-10', dueDate: '2026-10-10', daysOverdue: 46, totalAmount: 36200.00, balanceDue: 36200.00, currency: 'PEN', status: 'VENCIDO' },
      { id: 'inv3', documentNumber: 'PAGARE-99824', issueDate: '2026-10-01', dueDate: '2026-12-15', daysOverdue: 0, totalAmount: 40300.00, balanceDue: 40300.00, currency: 'PEN', status: 'PENDIENTE' }
    ],
    managementHistory: [
      {
        id: 'h1',
        date: '2026-11-24 16:30',
        advisorName: 'Valeria Quispe',
        channel: 'LLAMADA',
        tipificacionN1: 'Contacto directo',
        tipificacionN2: 'Promesa de pago',
        notes: 'Conversación con Gerente de Finanzas. Acepta amortización del 50% de la primera factura vencida para frenar reporte a centrales de riesgo.',
        promiseDate: '2026-11-28',
        promiseAmount: 24000.00
      },
      {
        id: 'h2',
        date: '2026-11-18 11:15',
        advisorName: 'Valeria Quispe',
        channel: 'WHATSAPP',
        tipificacionN1: 'Contacto indirecto',
        tipificacionN2: 'Mensaje con asistente',
        notes: 'Envío de estado de cuenta actualizado y solicitud de reunión de conciliación.'
      }
    ],
    lastManagementDate: 'Ayer, 16:30',
    lastManagementResult: 'Promesa S/ 24,000.00',
    nextActionDate: '2026-11-28',
    nextActionType: 'Verificar abono BCP'
  },
  {
    id: 'DEB-002',
    documentType: 'RUC',
    documentNumber: '20519827364',
    name: 'Distribuidora Lima Norte S.R.L.',
    legalRepresentative: 'Rosa María Chávez',
    portfolio: 'BBVA Capital de Trabajo',
    totalDebt: 67800.00,
    overdueDebt: 67800.00,
    daysOverdue: 42,
    status: 'EN_NEGOCIACION',
    scoring: 'B',
    city: 'Lima - Los Olivos',
    address: 'Av. Carlos Izaguirre 1250',
    email: 'cobranzas@distribuidoralimanorte.com',
    phones: [
      { id: 'p4', number: '+51 971 884 102', type: 'WHATSAPP', label: 'Administración', verified: true, isPreferred: true },
      { id: 'p5', number: '+51 1 521 8900', type: 'FIJO_CASA', label: 'Oficina Los Olivos', verified: true, isPreferred: false }
    ],
    invoices: [
      { id: 'inv4', documentNumber: 'LETRA-002-4819', issueDate: '2026-09-01', dueDate: '2026-10-14', daysOverdue: 42, totalAmount: 67800.00, balanceDue: 67800.00, currency: 'PEN', status: 'VENCIDO' }
    ],
    managementHistory: [
      {
        id: 'h3',
        date: '2026-11-25 10:45',
        advisorName: 'Carlos Medina',
        channel: 'LLAMADA',
        tipificacionN1: 'Contacto directo',
        tipificacionN2: 'En negociación de convenio',
        notes: 'Se evaluó propuesta de 3 cuotas mensuales de S/ 22,600. Pendiente de firma digital del convenio.',
        promiseDate: '2026-11-30',
        promiseAmount: 22600.00
      }
    ],
    lastManagementDate: 'Hoy, 10:45',
    lastManagementResult: 'Convenio en revisión',
    nextActionDate: '2026-11-30',
    nextActionType: 'Firma de convenio'
  },
  {
    id: 'DEB-003',
    documentType: 'DNI',
    documentNumber: '46892145',
    name: 'Juan Carlos Mendoza Paredes',
    portfolio: 'Interbank Tarjetas Oro',
    totalDebt: 18450.00,
    overdueDebt: 18450.00,
    daysOverdue: 94,
    status: 'MORA_CRITICA',
    scoring: 'D',
    city: 'Arequipa - Yanahuara',
    address: 'Calle Lima 314, Dpto 201',
    email: 'jcmendoza.ing@gmail.com',
    phones: [
      { id: 'p6', number: '+51 958 314 990', type: 'MOVIL_TITULAR', label: 'Personal', verified: true, isPreferred: true },
      { id: 'p7', number: '+51 954 112 004', type: 'WHATSAPP', label: 'Alternativo', verified: false, isPreferred: false }
    ],
    invoices: [
      { id: 'inv5', documentNumber: 'TC-5482-P01', issueDate: '2026-07-20', dueDate: '2026-08-23', daysOverdue: 94, totalAmount: 18450.00, balanceDue: 18450.00, currency: 'PEN', status: 'VENCIDO' }
    ],
    managementHistory: [
      {
        id: 'h4',
        date: '2026-11-23 15:20',
        advisorName: 'Lucía Torres',
        channel: 'LLAMADA',
        tipificacionN1: 'Contacto directo',
        tipificacionN2: 'Negativa de pago',
        notes: 'Titular alega problemas de liquidez temporal. Se le notificó el inicio de medidas prejudiciales y castigo de deuda.'
      }
    ],
    lastManagementDate: '23/11/2026',
    lastManagementResult: 'Negativa de pago',
    nextActionDate: '2026-11-26',
    nextActionType: 'Envío de carta notarial'
  },
  {
    id: 'DEB-004',
    documentType: 'RUC',
    documentNumber: '20491827491',
    name: 'Constructora Horizonte del Perú S.A.',
    legalRepresentative: 'Arq. Fernando Beltrán Gil',
    portfolio: 'Scotiabank Pyme Express',
    totalDebt: 215400.00,
    overdueDebt: 45000.00,
    daysOverdue: 12,
    status: 'POR_VENCER',
    scoring: 'A',
    city: 'Lima - Miraflores',
    address: 'Av. José Pardo 805, Piso 12',
    email: 'gerencia@constructora-horizonte.pe',
    phones: [
      { id: 'p8', number: '+51 998 774 210', type: 'WHATSAPP', label: 'Tesorería', verified: true, isPreferred: true },
      { id: 'p9', number: '+51 1 445 6070', type: 'FIJO_CASA', label: 'Oficina Central', verified: true, isPreferred: false }
    ],
    invoices: [
      { id: 'inv6', documentNumber: 'PAGARE-SCOTIA-81', issueDate: '2026-10-10', dueDate: '2026-11-13', daysOverdue: 12, totalAmount: 45000.00, balanceDue: 45000.00, currency: 'PEN', status: 'VENCIDO' },
      { id: 'inv7', documentNumber: 'PAGARE-SCOTIA-82', issueDate: '2026-11-01', dueDate: '2026-12-01', daysOverdue: 0, totalAmount: 170400.00, balanceDue: 170400.00, currency: 'PEN', status: 'PENDIENTE' }
    ],
    managementHistory: [
      {
        id: 'h5',
        date: '2026-11-25 09:10',
        advisorName: 'Valeria Quispe',
        channel: 'LLAMADA',
        tipificacionN1: 'Contacto directo',
        tipificacionN2: 'Promesa de pago',
        notes: 'Confirmaron que cobran valorización de obra municipal este jueves. Pago programado para el viernes por la mañana.',
        promiseDate: '2026-11-27',
        promiseAmount: 45000.00
      }
    ],
    lastManagementDate: 'Hoy, 09:10',
    lastManagementResult: 'Promesa S/ 45,000.00',
    nextActionDate: '2026-11-27',
    nextActionType: 'Verificar abono bancario'
  },
  {
    id: 'DEB-005',
    documentType: 'DNI',
    documentNumber: '71849203',
    name: 'María Fernanda Alva Ramos',
    portfolio: 'Caja Huancayo Crédito MYPE',
    totalDebt: 9800.00,
    overdueDebt: 0.00,
    daysOverdue: 0,
    status: 'AL_DIA',
    scoring: 'A',
    city: 'Huancayo - El Tambo',
    address: 'Av. Huancavelica 1420',
    email: 'mfer.alva@outlook.com',
    phones: [
      { id: 'p10', number: '+51 964 883 129', type: 'WHATSAPP', label: 'Móvil Titular', verified: true, isPreferred: true }
    ],
    invoices: [
      { id: 'inv8', documentNumber: 'CH-2026-089', issueDate: '2026-11-05', dueDate: '2026-12-05', daysOverdue: 0, totalAmount: 9800.00, balanceDue: 9800.00, currency: 'PEN', status: 'PENDIENTE' }
    ],
    managementHistory: [
      {
        id: 'h6',
        date: '2026-11-20 14:00',
        advisorName: 'Carlos Medina',
        channel: 'WHATSAPP',
        tipificacionN1: 'Contacto directo',
        tipificacionN2: 'Abono realizado',
        notes: 'Cliente canceló cuota vencida de S/ 2,450.00 oportunamente.'
      }
    ],
    lastManagementDate: '20/11/2026',
    lastManagementResult: 'Abono verificado',
    nextActionDate: '2026-12-03',
    nextActionType: 'Recordatorio preventivo'
  },
  {
    id: 'DEB-006',
    documentType: 'RUC',
    documentNumber: '20608821901',
    name: 'Tech Solutions Perú S.A.C.',
    legalRepresentative: 'Ing. Gustavo Cárdenas Silva',
    portfolio: 'BCP Crédito Empresarial',
    totalDebt: 89400.00,
    overdueDebt: 32100.00,
    daysOverdue: 28,
    status: 'POR_VENCER',
    scoring: 'B',
    city: 'Lima - Magdalena del Mar',
    address: 'Jirón Bolognesi 345, Of. 401',
    email: 'administracion@techsolutions.pe',
    phones: [
      { id: 'p11', number: '+51 987 654 321', type: 'WHATSAPP', label: 'Contacto Directo', verified: true, isPreferred: true },
      { id: 'p12', number: '+51 1 264 8899', type: 'FIJO_CASA', label: 'Oficina Central', verified: true, isPreferred: false }
    ],
    invoices: [
      { id: 'inv9', documentNumber: 'FACT-002-0941', issueDate: '2026-09-25', dueDate: '2026-10-28', daysOverdue: 28, totalAmount: 32100.00, balanceDue: 32100.00, currency: 'PEN', status: 'VENCIDO' },
      { id: 'inv10', documentNumber: 'FACT-002-0980', issueDate: '2026-10-25', dueDate: '2026-11-25', daysOverdue: 0, totalAmount: 57300.00, balanceDue: 57300.00, currency: 'PEN', status: 'PENDIENTE' }
    ],
    managementHistory: [
      {
        id: 'h7',
        date: '2026-11-25 11:30',
        advisorName: 'Lucía Torres',
        channel: 'LLAMADA',
        tipificacionN1: 'Contacto directo',
        tipificacionN2: 'Promesa de pago',
        notes: 'Cliente gestiona facturación de servicios a cliente corporativo. Se compromete a abonar S/ 15,000 este viernes.',
        promiseDate: '2026-11-27',
        promiseAmount: 15000.00
      }
    ],
    lastManagementDate: 'Hoy, 11:30',
    lastManagementResult: 'Promesa S/ 15,000.00',
    nextActionDate: '2026-11-27',
    nextActionType: 'Llamar para verificar abono'
  },
  {
    id: 'DEB-007',
    documentType: 'DNI',
    documentNumber: '10482914',
    name: 'Jorge Luis Morales Vega',
    portfolio: 'BBVA Consumo Ágil',
    totalDebt: 34100.00,
    overdueDebt: 34100.00,
    daysOverdue: 115,
    status: 'MORA_CRITICA',
    scoring: 'D',
    city: 'Trujillo - Víctor Larco',
    address: 'Av. Larco 890, Urb. California',
    email: 'jorge.morales.vega@gmail.com',
    phones: [
      { id: 'p13', number: '+51 944 192 883', type: 'MOVIL_TITULAR', label: 'Celular', verified: true, isPreferred: true },
      { id: 'p14', number: '+51 44 284 910', type: 'FIJO_CASA', label: 'Domicilio', verified: false, isPreferred: false }
    ],
    invoices: [
      { id: 'inv11', documentNumber: 'PREST-BBVA-901', issueDate: '2026-06-10', dueDate: '2026-08-02', daysOverdue: 115, totalAmount: 34100.00, balanceDue: 34100.00, currency: 'PEN', status: 'VENCIDO' }
    ],
    managementHistory: [
      {
        id: 'h8',
        date: '2026-11-22 17:10',
        advisorName: 'Valeria Quispe',
        channel: 'LLAMADA',
        tipificacionN1: 'No contacto',
        tipificacionN2: 'Teléfono apagado',
        notes: 'Intentos en mañana y tarde. Línea apagada. Se envió SMS y correo informativo de escalamiento a cobranza judicial.'
      }
    ],
    lastManagementDate: '22/11/2026',
    lastManagementResult: 'Teléfono apagado',
    nextActionDate: '2026-11-26',
    nextActionType: 'Visita de campo a domicilio'
  },
  {
    id: 'DEB-008',
    documentType: 'RUC',
    documentNumber: '20194829104',
    name: 'Importaciones & Exportaciones Pacífico S.A.C.',
    legalRepresentative: 'Sr. Roberto Wong Salazar',
    portfolio: 'Scotiabank Pyme Express',
    totalDebt: 156900.00,
    overdueDebt: 78500.00,
    daysOverdue: 54,
    status: 'EN_NEGOCIACION',
    scoring: 'B',
    city: 'Callao - Bellavista',
    address: 'Av. Elmer Faucett 2100',
    email: 'rwong@pacificotrading.com.pe',
    phones: [
      { id: 'p15', number: '+51 991 228 471', type: 'WHATSAPP', label: 'Gerente General', verified: true, isPreferred: true },
      { id: 'p16', number: '+51 1 574 2000', type: 'FIJO_CASA', label: 'Almacén Callao', verified: true, isPreferred: false }
    ],
    invoices: [
      { id: 'inv12', documentNumber: 'LETR-SCO-3914', issueDate: '2026-08-20', dueDate: '2026-10-02', daysOverdue: 54, totalAmount: 78500.00, balanceDue: 78500.00, currency: 'PEN', status: 'VENCIDO' },
      { id: 'inv13', documentNumber: 'LETR-SCO-3915', issueDate: '2026-09-20', dueDate: '2026-12-20', daysOverdue: 0, totalAmount: 78400.00, balanceDue: 78400.00, currency: 'PEN', status: 'PENDIENTE' }
    ],
    managementHistory: [
      {
        id: 'h9',
        date: '2026-11-25 12:15',
        advisorName: 'Carlos Medina',
        channel: 'WHATSAPP',
        tipificacionN1: 'Contacto directo',
        tipificacionN2: 'Acuerdo de reestructuración',
        notes: 'Se aprobó exoneración de gastos de cobranza condicionado al pago de S/ 40,000 al contado este lunes 30.',
        promiseDate: '2026-11-30',
        promiseAmount: 40000.00
      }
    ],
    lastManagementDate: 'Hoy, 12:15',
    lastManagementResult: 'Acuerdo S/ 40,000.00',
    nextActionDate: '2026-11-30',
    nextActionType: 'Validar transferencia interbancaria'
  }
];

export const MOCK_KPIS: {
  metrics: {
    totalPortfolio: number;
    totalPortfolioChange: number;
    recoveryRate: number;
    recoveryTarget: number;
    promisesTodayCount: number;
    promisesTodayAmount: number;
    promisesFulfilledCount: number;
    criticalDebtAmount: number;
    criticalDebtDebtorsCount: number;
  };
  dailyProgress: { day: number; label: string; actualAmount: number; targetAmount: number }[];
  priorityAlerts: {
    id: string;
    type: 'PROCESO_VENCIDO' | 'DEUDA_ALTA_SIN_GESTION' | 'CONVENIO_INCUMPLIDO';
    severity: 'URGENTE' | 'ALTA' | 'MEDIA';
    debtorId: string;
    debtorName: string;
    amount: number;
    message: string;
    timeAgo: string;
  }[];
} = {
  metrics: {
    totalPortfolio: 1485290.00,
    totalPortfolioChange: 4.2,
    recoveryRate: 68.4,
    recoveryTarget: 75.0,
    promisesTodayCount: 24,
    promisesTodayAmount: 48920.00,
    promisesFulfilledCount: 16,
    criticalDebtAmount: 382100.00,
    criticalDebtDebtorsCount: 19
  },
  dailyProgress: [
    { day: 1, label: '01 Nov', actualAmount: 32000, targetAmount: 25000 },
    { day: 5, label: '05 Nov', actualAmount: 98000, targetAmount: 85000 },
    { day: 10, label: '10 Nov', actualAmount: 215000, targetAmount: 200000 },
    { day: 15, label: '15 Nov', actualAmount: 430000, targetAmount: 410000 },
    { day: 20, label: '20 Nov', actualAmount: 690000, targetAmount: 700000 },
    { day: 25, label: '25 Nov', actualAmount: 1016000, targetAmount: 1113900 }
  ],
  priorityAlerts: [
    {
      id: 'alt-1',
      type: 'PROCESO_VENCIDO',
      severity: 'URGENTE',
      debtorId: 'DEB-001',
      debtorName: 'Corporación Minera Andina S.A.C.',
      amount: 24000.00,
      message: 'Promesa de amortización programada para mañana. Requiere confirmación de voucher.',
      timeAgo: 'Hace 30 min'
    },
    {
      id: 'alt-2',
      type: 'CONVENIO_INCUMPLIDO',
      severity: 'ALTA',
      debtorId: 'DEB-003',
      debtorName: 'Juan Carlos Mendoza Paredes',
      amount: 18450.00,
      message: 'Mora superó los 90 días (94 días). Asesor reportó negativa. Notificar a Legal.',
      timeAgo: 'Hace 2 horas'
    },
    {
      id: 'alt-3',
      type: 'DEUDA_ALTA_SIN_GESTION',
      severity: 'MEDIA',
      debtorId: 'DEB-007',
      debtorName: 'Jorge Luis Morales Vega',
      amount: 34100.00,
      message: 'Teléfono apagado en últimos 3 intentos. Derivar a visita de campo inmediata.',
      timeAgo: 'Hace 4 horas'
    }
  ]
};
