import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { OperacionesService } from '../../core/operaciones.service';
import { FilaReporte, FiltrosReporte, OpcionesFiltro, TipoReporte } from '../../core/operaciones.models';
import { getErrorMessage } from '../../core/api-error';
import { downloadCsv } from '../../core/descargas';

function validateDateRange(control: AbstractControl): ValidationErrors | null {
  if (control.get('periodo')?.value !== 'PERSONALIZADO') {
    return null;
  }
  const desde = control.get('desde')?.value;
  const hasta = control.get('hasta')?.value;
  if (!desde || !hasta) {
    return null;
  }
  if (desde > hasta) {
    return { rango: 'La fecha inicial no puede ser posterior a la final.' };
  }
  return (Date.parse(hasta) - Date.parse(desde)) / 86400000 > 366
    ? { rango: 'El rango máximo es de 366 días.' }
    : null;
}

@Component({
  selector: 'app-reportes',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './reportes.html'
})
export class ReportesPage {
  private readonly operacionesService = inject(OperacionesService);
  private readonly fb = inject(FormBuilder);

  readonly filterForm = this.fb.nonNullable.group(
    {
      tipo: ['gestiones' as TipoReporte],
      periodo: ['MES'],
      desde: [''],
      hasta: [''],
      asesorId: [''],
      cartera: [''],
      cosecha: ['']
    },
    { validators: validateDateRange }
  );

  readonly filterOptions = signal<OpcionesFiltro>({ carteras: [], cosechas: [], asesores: [] });
  readonly filterOptionsError = signal('');
  readonly errorMessage = signal('');
  readonly isLoading = signal(false);
  readonly reportRows = signal<FilaReporte[]>([]);
  readonly displayedReportType = signal<TipoReporte>('gestiones');
  readonly currentPage = signal(1);
  readonly querySummary = signal('Este mes');

  readonly pageSize = 25;
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.reportRows().length / this.pageSize))
  );
  readonly visibleRows = computed(() =>
    this.reportRows().slice((this.currentPage() - 1) * this.pageSize, this.currentPage() * this.pageSize)
  );
  readonly totalAmount = computed(() =>
    this.reportRows().reduce((sum, r) => sum + (r.monto || 0), 0)
  );

  get form() { return this.filterForm; }
  get opciones() { return this.filterOptions; }
  get errorOpciones() { return this.filterOptionsError; }
  get error() { return this.errorMessage; }
  get cargando() { return this.isLoading; }
  get filas() { return this.reportRows; }
  get tipoMostrado() { return this.displayedReportType; }
  get pagina() { return this.currentPage; }
  get consulta() { return this.querySummary; }
  get tamano() { return this.pageSize; }
  get paginas() { return this.totalPages; }
  get visibles() { return this.visibleRows; }
  get totalMonto() { return this.totalAmount; }

  constructor() {
    this.operacionesService.getFilterOptions().subscribe({
      next: (opts) => this.filterOptions.set(opts),
      error: (err) => this.filterOptionsError.set(getErrorMessage(err))
    });
    this.loadReport();
  }

  onPeriodChange(): void {
    const isCustom = this.filterForm.controls.periodo.value === 'PERSONALIZADO';
    for (const ctrl of [this.filterForm.controls.desde, this.filterForm.controls.hasta]) {
      ctrl.setValidators(isCustom ? [Validators.required] : []);
      ctrl.updateValueAndValidity();
    }
    this.filterForm.updateValueAndValidity();
  }

  loadReport(): void {
    if (this.filterForm.invalid || this.isLoading()) {
      this.filterForm.markAllAsTouched();
      return;
    }

    const val = this.filterForm.getRawValue();
    const filters: FiltrosReporte = {
      asesorId: val.asesorId,
      cartera: val.cartera,
      cosecha: val.cosecha
    };

    if (val.periodo === 'PERSONALIZADO') {
      filters.desde = val.desde;
      filters.hasta = val.hasta;
    } else {
      filters.periodo = val.periodo;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);
    this.reportRows.set([]);

    this.operacionesService
      .getReport(val.tipo, filters)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (rows) => {
          this.reportRows.set(rows);
          this.displayedReportType.set(val.tipo);
          this.currentPage.set(1);
          const periodNames: Record<string, string> = {
            HOY: 'Hoy',
            SEMANA: 'Esta semana',
            MES: 'Este mes'
          };
          this.querySummary.set(
            val.periodo === 'PERSONALIZADO'
              ? `${val.desde} a ${val.hasta}`
              : periodNames[val.periodo] || val.periodo
          );
        },
        error: (err) => this.errorMessage.set(getErrorMessage(err))
      });
  }

  exportReport(): void {
    const type = this.displayedReportType();
    const header =
      type === 'gestiones'
        ? ['Fecha', 'Documento', 'Cliente', 'Operación', 'Cartera', 'Asesor', 'Tipo de contacto', 'Resultado', 'Teléfono', 'Observación']
        : type === 'pagos'
        ? ['Fecha de pago', 'Documento', 'Cliente', 'Operación', 'Cartera', 'Asesor', 'Monto', 'Referencia']
        : ['Fecha de compromiso', 'Documento', 'Cliente', 'Operación', 'Cartera', 'Asesor', 'Monto', 'Estado'];

    const rows = this.reportRows().map((r) =>
      type === 'gestiones'
        ? [r.fechaHora, r.clienteDocumento, r.clienteNombres, r.numeroOperacion, r.cartera, r.asesorNombre, r.nivel1, r.nivel2, r.telefono, r.observacion]
        : type === 'pagos'
        ? [r.fechaPago, r.clienteDocumento, r.clienteNombres, r.numeroOperacion, r.cartera, r.asesorNombre, r.monto, r.referencia]
        : [r.fechaCompromiso, r.clienteDocumento, r.clienteNombres, r.numeroOperacion, r.cartera, r.asesorNombre, r.monto, r.estado]
    );

    downloadCsv(`escall-${type}.csv`, [header, ...rows]);
  }

  cambiarPeriodo(): void { this.onPeriodChange(); }
  consultar(): void { this.loadReport(); }
  exportar(): void { this.exportReport(); }
}
