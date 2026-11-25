import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClientesService } from '../../core/clientes.service';
import { AuthService } from '../../core/auth.service';
import { ClienteDetalle, Tipificacion, TipificacionResultado } from '../../core/models';
import { getErrorMessage } from '../../core/api-error';

@Component({
  selector: 'app-detalle',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './detalle.html'
})
export class DetallePage {
  private readonly clientesService = inject(ClientesService);
  readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly clientId = Number(this.route.snapshot.paramMap.get('id'));
  readonly clientDetail = signal<ClienteDetalle | null>(null);
  readonly isLoading = signal(false);
  readonly isBusy = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isEditing = signal(false);
  readonly isDeleting = signal(false);
  readonly activeTab = signal<'cuentas' | 'gestiones' | 'pagos' | 'promesas'>('cuentas');
  readonly typifications = signal<Tipificacion[]>([]);
  readonly selectedLevel1Id = signal(0);
  readonly managementErrorMessage = signal('');

  readonly editForm = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    direccion: ['', Validators.maxLength(300)]
  });

  readonly managementForm = this.fb.group({
    cuentaId: [null as number | null, Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{6,20}$/)]],
    tipificacionN2Id: [null as number | null, Validators.required],
    observacion: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/\S/)]],
    fechaCompromiso: [''],
    montoCompromiso: [null as number | null]
  });

  // Backward-compatibility getters
  get auth() { return this.authService; }
  get id() { return this.clientId; }
  get cliente() { return this.clientDetail; }
  get cargando() { return this.isLoading; }
  get ocupado() { return this.isBusy; }
  get error() { return this.errorMessage; }
  get ok() { return this.successMessage; }
  get editando() { return this.isEditing; }
  get eliminando() { return this.isDeleting; }
  get tab() { return this.activeTab; }
  get tipos() { return this.typifications; }
  get n1() { return this.selectedLevel1Id; }
  get errorGestion() { return this.managementErrorMessage; }
  get edicion() { return this.editForm; }
  get gestion() { return this.managementForm; }

  constructor() {
    this.loadClientDetails();
    if (this.authService.sesion()?.usuario.rol === 'ASESOR') {
      this.clientesService.getTypifications().subscribe({
        next: (data) => this.typifications.set(data),
        error: (err) => this.managementErrorMessage.set(getErrorMessage(err))
      });
    }
  }

  loadClientDetails(): void {
    if (!Number.isInteger(this.clientId) || this.clientId < 1) {
      this.errorMessage.set('Identificador de cliente inválido.');
      return;
    }

    this.isLoading.set(true);
    this.clientesService
      .getClientDetails(this.clientId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.clientDetail.set(data),
        error: (err) => this.errorMessage.set(getErrorMessage(err))
      });
  }

  openEditModal(): void {
    const c = this.clientDetail();
    if (!c) return;
    this.editForm.setValue({
      nombres: c.nombres,
      email: c.email || '',
      direccion: c.direccion || ''
    });
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isEditing.set(true);
  }

  saveContactDetails(): void {
    if (this.editForm.invalid || this.isBusy()) {
      return;
    }

    this.isBusy.set(true);
    this.errorMessage.set('');

    this.clientesService
      .updateClient(this.clientId, this.editForm.getRawValue())
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: (updated) => {
          this.clientDetail.set(updated);
          this.isEditing.set(false);
          this.successMessage.set('Datos del cliente actualizados.');
        },
        error: (err) => this.errorMessage.set(getErrorMessage(err))
      });
  }

  deleteClient(): void {
    if (this.isBusy()) {
      return;
    }

    this.isBusy.set(true);
    this.errorMessage.set('');

    this.clientesService
      .deleteClient(this.clientId)
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/clientes']),
        error: (err) => {
          this.errorMessage.set(getErrorMessage(err));
          this.isDeleting.set(false);
        }
      });
  }

  onLevel1Change(value: string): void {
    this.selectedLevel1Id.set(Number(value));
    this.managementForm.controls.tipificacionN2Id.setValue(null);
    this.updateValidationRules();
  }

  getLevel2Options(): TipificacionResultado[] {
    return this.typifications().find((t) => t.id === this.selectedLevel1Id())?.resultados || [];
  }

  requiresCommitment(): boolean {
    return this.getLevel2Options().find(
      (r) => r.id === Number(this.managementForm.controls.tipificacionN2Id.value)
    )?.requiereCompromiso || false;
  }

  updateValidationRules(): void {
    const fecha = this.managementForm.controls.fechaCompromiso;
    const monto = this.managementForm.controls.montoCompromiso;
    const required = this.requiresCommitment();

    fecha.setValidators(required ? [Validators.required] : []);
    monto.setValidators(required ? [Validators.required, Validators.min(0.01)] : []);

    if (!required) {
      fecha.setValue('');
      monto.setValue(null);
    }

    fecha.updateValueAndValidity();
    monto.updateValueAndValidity();
  }

  submitManagement(): void {
    if (this.managementForm.invalid || this.isBusy()) {
      return;
    }

    this.managementErrorMessage.set('');
    this.isBusy.set(true);
    const val = this.managementForm.getRawValue();

    this.clientesService
      .recordManagement({
        cuentaId: val.cuentaId!,
        telefono: val.telefono!,
        tipificacionN2Id: val.tipificacionN2Id!,
        observacion: val.observacion!,
        fechaCompromiso: val.fechaCompromiso || null,
        montoCompromiso: val.montoCompromiso ?? null
      })
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Gestión registrada correctamente.');
          this.managementForm.reset();
          this.selectedLevel1Id.set(0);
          this.updateValidationRules();
          this.loadClientDetails();
        },
        error: (err) => this.managementErrorMessage.set(getErrorMessage(err))
      });
  }

  // Backward-compatibility aliases
  cargar(): void { this.loadClientDetails(); }
  editar(): void { this.openEditModal(); }
  guardar(): void { this.saveContactDetails(); }
  eliminar(): void { this.deleteClient(); }
  cambiarN1(val: string): void { this.onLevel1Change(val); }
  resultados(): TipificacionResultado[] { return this.getLevel2Options(); }
  requiereCompromiso(): boolean { return this.requiresCommitment(); }
  actualizarReglas(): void { this.updateValidationRules(); }
  registrar(): void { this.submitManagement(); }
}
