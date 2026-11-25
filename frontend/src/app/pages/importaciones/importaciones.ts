import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { OperacionesService } from '../../core/operaciones.service';
import { Carga, TipoCarga } from '../../core/operaciones.models';
import { getErrorMessage } from '../../core/api-error';
import { downloadCsv } from '../../core/descargas';

@Component({
  selector: 'app-importaciones',
  imports: [DatePipe],
  templateUrl: './importaciones.html'
})
export class ImportacionesPage {
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('selectorArchivo') selectorArchivo?: ElementRef<HTMLInputElement>;

  private readonly operacionesService = inject(OperacionesService);

  readonly batchType = signal<TipoCarga>('asignaciones');
  readonly selectedFile = signal<File | null>(null);
  readonly isProcessing = signal(false);
  readonly isHistoryLoading = signal(false);
  readonly errorMessage = signal('');
  readonly historyErrorMessage = signal('');
  readonly importResult = signal<Carga | null>(null);
  readonly batchHistory = signal<Carga[]>([]);
  readonly selectedDetail = signal<Carga | null>(null);

  get tipo() { return this.batchType; }
  get archivo() { return this.selectedFile; }
  get cargando() { return this.isProcessing; }
  get consultando() { return this.isHistoryLoading; }
  get error() { return this.errorMessage; }
  get errorHistorial() { return this.historyErrorMessage; }
  get resultado() { return this.importResult; }
  get historial() { return this.batchHistory; }
  get detalle() { return this.selectedDetail; }

  constructor() {
    this.loadHistory();
  }

  changeBatchType(type: string): void {
    if (this.isProcessing()) return;
    this.batchType.set(type as TipoCarga);
    this.clearSelection();
  }

  clearSelection(): void {
    if (this.isProcessing()) return;
    this.selectedFile.set(null);
    this.importResult.set(null);
    this.errorMessage.set('');
    const el = this.fileInput || this.selectorArchivo;
    if (el) el.nativeElement.value = '';
  }

  onFileSelected(event: Event): void {
    this.importResult.set(null);
    this.errorMessage.set('');
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.selectedFile.set(null);

    if (!file) return;

    if (!/\.(csv|txt)$/i.test(file.name)) {
      this.errorMessage.set('Selecciona un archivo CSV o TXT guardado en UTF-8.');
      input.value = '';
      return;
    }
    if (!file.size) {
      this.errorMessage.set('El archivo está vacío.');
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage.set('El archivo supera el límite de 10 MB.');
      input.value = '';
      return;
    }

    this.selectedFile.set(file);
  }

  importBatch(): void {
    const file = this.selectedFile();
    if (!file || this.isProcessing()) return;

    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.importResult.set(null);

    this.operacionesService
      .importData(this.batchType(), file)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: (res) => {
          this.importResult.set(res);
          this.selectedFile.set(null);
          const el = this.fileInput || this.selectorArchivo;
          if (el) el.nativeElement.value = '';
          this.loadHistory();
        },
        error: (err) => this.errorMessage.set(getErrorMessage(err))
      });
  }

  loadHistory(): void {
    this.isHistoryLoading.set(true);
    this.historyErrorMessage.set('');

    this.operacionesService
      .getBatchLoads()
      .pipe(finalize(() => this.isHistoryLoading.set(false)))
      .subscribe({
        next: (history) => this.batchHistory.set(history),
        error: (err) => this.historyErrorMessage.set(getErrorMessage(err))
      });
  }

  downloadTemplate(): void {
    const columns =
      this.batchType() === 'asignaciones'
        ? ['documento', 'tipo_documento', 'nombres', 'telefono', 'email', 'direccion', 'numero_operacion', 'entidad', 'producto', 'cartera', 'cosecha', 'deuda', 'dias_mora', 'asesor']
        : ['numero_operacion', 'fecha_pago', 'monto', 'referencia'];

    downloadCsv(`plantilla-${this.batchType()}.csv`, [columns]);
  }

  cambiarTipo(t: string): void { this.changeBatchType(t); }
  limpiar(): void { this.clearSelection(); }
  seleccionar(e: Event): void { this.onFileSelected(e); }
  importar(): void { this.importBatch(); }
  cargarHistorial(): void { this.loadHistory(); }
  plantilla(): void { this.downloadTemplate(); }
}
