export type DebtStatus = 'AL_DIA' | 'POR_VENCER' | 'MORA_CRITICA' | 'EN_NEGOCIACION';

export type MoraSegment = 'TODOS' | '0_15' | '16_30' | '31_60' | '61_90' | 'MAS_90';

export interface PhoneContact {
  id: string;
  number: string;
  type: 'MOVIL_TITULAR' | 'MOVIL_LABORAL' | 'FIJO_CASA' | 'WHATSAPP';
  label: string;
  verified: boolean;
  isPreferred: boolean;
}

export interface OverdueInvoice {
  id: string;
  documentNumber: string;
  issueDate: string;
  dueDate: string;
  daysOverdue: number;
  totalAmount: number;
  balanceDue: number;
  currency: 'PEN' | 'USD';
  status: 'PENDIENTE' | 'PARCIAL' | 'VENCIDO';
}

export interface ManagementRecord {
  id: string;
  date: string;
  advisorName: string;
  channel: 'LLAMADA' | 'WHATSAPP' | 'CORREO' | 'VISITA';
  tipificacionN1: string;
  tipificacionN2: string;
  notes: string;
  promiseDate?: string;
  promiseAmount?: number;
}

export interface Debtor {
  id: string;
  documentType: 'DNI' | 'RUC';
  documentNumber: string;
  name: string;
  legalRepresentative?: string;
  portfolio: string;
  totalDebt: number;
  overdueDebt: number;
  daysOverdue: number;
  status: DebtStatus;
  scoring: 'A' | 'B' | 'C' | 'D';
  city: string;
  address: string;
  email: string;
  phones: PhoneContact[];
  invoices: OverdueInvoice[];
  managementHistory: ManagementRecord[];
  lastManagementDate: string;
  lastManagementResult: string;
  nextActionDate: string;
  nextActionType: string;
}

export interface KpiMetrics {
  totalPortfolio: number;
  totalPortfolioChange: number;
  recoveryRate: number;
  recoveryTarget: number;
  promisesTodayCount: number;
  promisesTodayAmount: number;
  promisesFulfilledCount: number;
  criticalDebtAmount: number;
  criticalDebtDebtorsCount: number;
}

export interface DailyRecoveryProgress {
  day: number;
  label: string;
  actualAmount: number;
  targetAmount: number;
}

export interface PriorityAlert {
  id: string;
  type: 'PROCESO_VENCIDO' | 'DEUDA_ALTA_SIN_GESTION' | 'CONVENIO_INCUMPLIDO';
  severity: 'URGENTE' | 'ALTA' | 'MEDIA';
  debtorId: string;
  debtorName: string;
  amount: number;
  message: string;
  timeAgo: string;
}
