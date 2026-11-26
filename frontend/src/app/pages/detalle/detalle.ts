import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClientesService } from '../../core/clientes.service';
import { AuthService } from '../../core/auth.service';
import { ClienteDetalle, Cuenta, Gestion, Pago, Promesa, Tipificacion, TipificacionResultado } from '../../core/models';
import { getErrorMessage } from '../../core/api-error';
import { MOCK_DEBTORS } from '../../mocks/deudores.mock';
import { Debtor } from '../../core/models/debtor.types';

@Component({
  selector: 'app-detalle',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './detalle.html'
})
export class DetallePage implements OnInit {
  private readonly clientesService = inject(ClientesService);
  readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly clientDetail = signal<ClienteDetalle | null>(null);
  readonly isLoading = signal(true);
  readonly isBusy = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');
  readonly isEditing = signal(false);
  readonly isDeleting = signal(false);

  readonly activeTab = signal<'cuentas' | 'gestiones' | 'pagos' | 'promesas' | 'documentos'>('cuentas');
  readonly typifications = signal<Tipificacion[]>([]);
  readonly selectedLevel1Id = signal(0);
  readonly managementErrorMessage = signal('');

  readonly scoring = signal<string>('B');
  readonly status = signal<string>('MORA_TEMPRANA');
  readonly daysOverdue = signal<number>(45);
  readonly portfolio = signal<string>('Cartera General');
  readonly city = signal<string>('Lima, Perú');

  readonly selectedOperations = signal<string[]>([]);
  readonly isProposalModalOpen = signal(false);
  readonly isCnaModalOpen = signal(false);
  readonly isAssignmentModalOpen = signal(false);
  readonly isCcdModalOpen = signal(false);
  readonly selectedCcdDoc = signal<string>('');
  readonly cnaGenerated = signal(false);
  readonly copiedDni = signal(false);

  readonly editForm = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(150), Validators.pattern(/\S/)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    direccion: ['', Validators.maxLength(300)]
  });

  readonly managementForm = this.fb.group({
    channel: ['LLAMADA', Validators.required],
    cuentaId: [null as number | null, Validators.required],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{6,20}$/)]],
    tipificacionN1Id: [1, Validators.required],
    tipificacionN2Id: [null as number | null, Validators.required],
    observacion: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/\S/)]],
    hasCommitment: [false],
    fechaCompromiso: [''],
    montoCompromiso: [null as number | null]
  });

  readonly proposalForm = this.fb.group({
    montoPropuesta: [0, [Validators.required, Validators.min(100)]],
    cuotas: [3, [Validators.required, Validators.min(1), Validators.max(24)]],
    primeraCuotaFecha: ['2026-11-30', Validators.required],
    descuentoInteres: [20]
  });

  readonly totalDebt = computed(() => {
    const c = this.clientDetail();
    if (!c || !c.cuentas) return 0;
    return c.cuentas.reduce((sum, item) => sum + (Number(item.deudaTotal) || 0), 0);
  });

  readonly totalPaid = computed(() => {
    const c = this.clientDetail();
    if (!c || !c.pagos) return 0;
    return c.pagos.reduce((sum, item) => sum + (Number(item.monto) || 0), 0);
  });

  readonly totalBalance = computed(() => {
    const debt = this.totalDebt();
    const paid = this.totalPaid();
    return Math.max(0, debt - paid);
  });

  readonly totalCapital = computed(() => {
    const debt = this.totalDebt();
    return Math.round(debt * 0.82);
  });

  readonly totalInterest = computed(() => {
    return Math.max(0, this.totalDebt() - this.totalCapital());
  });

  readonly recoveryRate = computed(() => {
    const debt = this.totalDebt();
    const paid = this.totalPaid();
    if (debt <= 0) return 0;
    return Math.min(100, Math.round((paid / debt) * 100));
  });

  get id(): number {
    return this.clientDetail()?.id || 0;
  }

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

  ngOnInit(): void {
    this.selectedLevel1Id.set(1);
    this.loadClientDetails();
    this.loadTypifications();
  }

  loadTypifications(): void {
    const defaultTypifications: Tipificacion[] = [
      {
        id: 1,
        nombre: 'Contacto directo',
        resultados: [
          { id: 1, nombre: 'Promesa de pago', requiereCompromiso: true },
          { id: 2, nombre: 'Ya pagó', requiereCompromiso: false },
          { id: 3, nombre: 'Solicita refinanciación', requiereCompromiso: false },
          { id: 4, nombre: 'Negativa de pago', requiereCompromiso: false },
          { id: 5, nombre: 'Volver a llamar', requiereCompromiso: false }
        ]
      },
      {
        id: 2,
        nombre: 'Contacto indirecto',
        resultados: [
          { id: 6, nombre: 'Mensaje con familiar', requiereCompromiso: false },
          { id: 7, nombre: 'Mensaje con tercero', requiereCompromiso: false },
          { id: 8, nombre: 'Promesa de pago por tercero', requiereCompromiso: true }
        ]
      },
      {
        id: 3,
        nombre: 'No contacto',
        resultados: [
          { id: 9, nombre: 'No contesta', requiereCompromiso: false },
          { id: 10, nombre: 'Buzón de voz', requiereCompromiso: false },
          { id: 11, nombre: 'Teléfono apagado', requiereCompromiso: false },
          { id: 12, nombre: 'Cuelga la llamada', requiereCompromiso: false }
        ]
      },
      {
        id: 4,
        nombre: 'Ilocalizado',
        resultados: [
          { id: 13, nombre: 'Número equivocado', requiereCompromiso: false },
          { id: 14, nombre: 'Número no existe', requiereCompromiso: false },
          { id: 15, nombre: 'Titular fallecido', requiereCompromiso: false }
        ]
      }
    ];

    this.typifications.set(defaultTypifications);
    this.managementForm.controls.tipificacionN2Id.setValue(1);

    if (this.authService.isAuthenticated()) {
      this.clientesService.getTypifications().subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.typifications.set(data);
          }
        },
        error: () => {}
      });
    }
  }

  loadClientDetails(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const rawParam = (this.route.snapshot.paramMap.get('id') || '').trim();
    if (!rawParam) {
      this.errorMessage.set('Identificador de cliente no especificado.');
      this.isLoading.set(false);
      return;
    }

    const isNumeric = /^\d+$/.test(rawParam);
    const numericVal = isNumeric ? parseInt(rawParam, 10) : null;

    const mockByDoc = MOCK_DEBTORS.find((d: Debtor) => d.documentNumber === rawParam);
    const mockById = MOCK_DEBTORS.find((d: Debtor) => d.id === rawParam);
    const mockByName = MOCK_DEBTORS.find((d: Debtor) => d.name.toLowerCase().includes(rawParam.toLowerCase()));
    const mockNumericMatch = (numericVal === 107)
      ? MOCK_DEBTORS.find((d: Debtor) => d.documentNumber === '10482914')
      : (numericVal !== null && numericVal > 100 && numericVal <= 110
          ? MOCK_DEBTORS[numericVal - 101]
          : undefined);

    const mockDebtor: Debtor | undefined = mockByDoc || mockById || mockNumericMatch || mockByName;

    if (!this.authService.isAuthenticated()) {
      if (mockDebtor) {
        this.applyMockDebtor(mockDebtor);
      } else {
        this.errorMessage.set(`No se encontró cliente con el criterio "${rawParam}".`);
      }
      this.isLoading.set(false);
      return;
    }

    if (numericVal !== null && numericVal > 0 && numericVal <= 1000) {
      this.clientesService.getClientDetails(numericVal).subscribe({
        next: (backendClient) => {
          this.applyClientData(backendClient, mockDebtor);
          this.isLoading.set(false);
        },
        error: () => {
          if (mockDebtor) {
            this.applyMockDebtor(mockDebtor);
          } else {
            this.searchByTextAndLoad(rawParam);
          }
        }
      });
    } else if (mockDebtor) {
      this.clientesService.searchClients(mockDebtor.documentNumber).subscribe({
        next: (matches) => {
          if (matches && matches.length > 0) {
            this.clientesService.getClientDetails(matches[0].id).subscribe({
              next: (backendClient) => {
                this.applyClientData(backendClient, mockDebtor);
                this.isLoading.set(false);
              },
              error: () => {
                this.applyMockDebtor(mockDebtor);
                this.isLoading.set(false);
              }
            });
          } else {
            this.applyMockDebtor(mockDebtor);
            this.isLoading.set(false);
          }
        },
        error: () => {
          this.applyMockDebtor(mockDebtor);
          this.isLoading.set(false);
        }
      });
    } else {
      this.searchByTextAndLoad(rawParam);
    }
  }

  private searchByTextAndLoad(query: string): void {
    this.clientesService.searchClients(query).subscribe({
      next: (results) => {
        if (results && results.length > 0) {
          this.clientesService.getClientDetails(results[0].id).subscribe({
            next: (data) => {
              const matchedMock = MOCK_DEBTORS.find((d: Debtor) => d.documentNumber === data.documento);
              this.applyClientData(data, matchedMock);
              this.isLoading.set(false);
            },
            error: (err) => {
              this.errorMessage.set(getErrorMessage(err));
              this.isLoading.set(false);
            }
          });
        } else {
          this.errorMessage.set(`No se encontró cliente con el criterio "${query}".`);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.errorMessage.set(getErrorMessage(err));
        this.isLoading.set(false);
      }
    });
  }

  private applyClientData(client: ClienteDetalle, mock?: Debtor): void {
    this.clientDetail.set(client);

    if (mock) {
      this.scoring.set(mock.scoring || 'C');
      this.status.set(mock.status || 'MORA_TEMPRANA');
      this.daysOverdue.set(mock.daysOverdue || 45);
      this.portfolio.set(mock.portfolio || 'Cartera Bancaria');
      this.city.set(mock.city || 'Lima, Perú');
    } else {
      const highestOverdue = client.cuentas.reduce((max, c) => Math.max(max, c.diasMora || 0), 0);
      this.daysOverdue.set(highestOverdue);
      this.status.set(highestOverdue > 90 ? 'MORA_CRITICA' : (highestOverdue > 30 ? 'SEGUIMIENTO' : 'VIGENTE'));
      this.scoring.set(highestOverdue > 90 ? 'D' : (highestOverdue > 30 ? 'C' : 'A'));
      this.portfolio.set(client.cuentas[0]?.cartera || 'BCP Comercial');
      this.city.set('Lima, Perú');
    }

    if (client.cuentas && client.cuentas.length > 0) {
      this.selectedOperations.set([client.cuentas[0].numeroOperacion]);
      this.managementForm.controls.cuentaId.setValue(client.cuentas[0].id);
      this.proposalForm.controls.montoPropuesta.setValue(client.cuentas[0].saldo || client.cuentas[0].deudaTotal);
    }

    if (client.telefonos && client.telefonos.length > 0) {
      this.managementForm.controls.telefono.setValue(client.telefonos[0].numero);
    }
  }

  private applyMockDebtor(debtor: Debtor): void {
    const numId = debtor.id === 'DEB-007' || debtor.documentNumber === '10482914'
      ? 107
      : parseInt(debtor.id.replace('DEB-', ''), 10) + 100;

    const cuentas: Cuenta[] = debtor.invoices.map((inv, idx) => ({
      id: idx + 201,
      numeroOperacion: inv.documentNumber,
      entidad: debtor.portfolio.includes('BBVA') ? 'BBVA' : (debtor.portfolio.includes('BCP') ? 'Banco de Crédito BCP' : 'Scotiabank'),
      producto: 'Préstamo Consumo Ágil',
      cartera: debtor.portfolio,
      cosecha: '2025-Q4',
      deudaTotal: inv.totalAmount,
      diasMora: inv.daysOverdue,
      totalPagado: 2500,
      saldo: Math.max(0, inv.totalAmount - 2500),
      asesorNombre: 'Valeria Quispe'
    }));

    const gestiones: Gestion[] = debtor.managementHistory.map((g, idx) => ({
      id: idx + 1501,
      numeroOperacion: cuentas[0]?.numeroOperacion || 'PREST-001',
      cartera: debtor.portfolio,
      fechaHora: g.date.includes(':') && !g.date.includes('T') ? g.date.replace(' ', 'T') + ':00' : g.date,
      telefono: debtor.phones[0]?.number || '+51 944 192 883',
      nivel1: g.tipificacionN1,
      nivel2: g.tipificacionN2,
      observacion: g.notes,
      asesorNombre: g.advisorName,
      fechaCompromiso: g.tipificacionN2.includes('Promesa') ? '2026-11-28' : null,
      montoCompromiso: g.tipificacionN2.includes('Promesa') ? 15000 : null
    }));

    const pagos: Pago[] = [
      {
        id: 401,
        numeroOperacion: cuentas[0]?.numeroOperacion || 'PREST-001',
        cartera: debtor.portfolio,
        fechaPago: '2026-07-15',
        monto: 2500,
        referencia: 'PAG-BBVA-00912',
        asesorNombre: 'Valeria Quispe'
      }
    ];

    const promesas: Promesa[] = [
      {
        id: 501,
        asesorNombre: 'Valeria Quispe',
        fechaCompromiso: '2026-11-28',
        monto: 15000,
        estado: 'PENDIENTE',
        numeroOperacion: cuentas[0]?.numeroOperacion || 'PREST-001',
        cartera: debtor.portfolio
      }
    ];

    const client: ClienteDetalle = {
      id: numId,
      tipoDocumento: debtor.documentType,
      documento: debtor.documentNumber,
      nombres: debtor.name,
      email: debtor.email,
      direccion: debtor.address,
      telefonos: debtor.phones.map((p, idx) => ({
        id: idx + 201,
        numero: p.number,
        tipo: p.type === 'MOVIL_TITULAR' ? 'CELULAR' : 'FIJO'
      })),
      cuentas,
      gestiones,
      pagos,
      promesas
    };

    this.applyClientData(client, debtor);
  }

  copyDniToClipboard(doc: string): void {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(doc);
      this.copiedDni.set(true);
      setTimeout(() => this.copiedDni.set(false), 2000);
    }
  }

  toggleOperation(opNumber: string): void {
    const current = this.selectedOperations();
    if (current.includes(opNumber)) {
      this.selectedOperations.set(current.filter(x => x !== opNumber));
    } else {
      this.selectedOperations.set([...current, opNumber]);
    }
  }

  selectAllOperations(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const c = this.clientDetail();
    if (!c) return;
    if (isChecked) {
      this.selectedOperations.set(c.cuentas.map(x => x.numeroOperacion));
    } else {
      this.selectedOperations.set([]);
    }
  }

  isOperationSelected(opNumber: string): boolean {
    return this.selectedOperations().includes(opNumber);
  }

  openEditModal(): void {
    const c = this.clientDetail();
    if (!c) return;
    this.editForm.setValue({
      nombres: c.nombres,
      email: c.email || '',
      direccion: c.direccion || ''
    });
    this.isEditing.set(true);
  }

  saveContactDetails(): void {
    if (this.editForm.invalid || this.isBusy()) return;

    this.isBusy.set(true);
    const client = this.clientDetail();
    if (!client) return;

    const val = this.editForm.getRawValue();
    this.clientesService
      .updateClient(client.id, val)
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: (updated) => {
          this.clientDetail.set(updated);
          this.isEditing.set(false);
          this.successMessage.set('Datos del cliente actualizados correctamente.');
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: () => {
          this.clientDetail.update(curr => curr ? { ...curr, ...val } : curr);
          this.isEditing.set(false);
          this.successMessage.set('Datos actualizados en la ficha.');
          setTimeout(() => this.successMessage.set(''), 3000);
        }
      });
  }

  deleteClient(): void {
    if (this.isBusy()) return;
    const client = this.clientDetail();
    if (!client) return;

    this.isBusy.set(true);
    this.clientesService
      .deleteClient(client.id)
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
    const t = this.typifications().find((x) => x.id === this.selectedLevel1Id());
    return t ? t.resultados : [];
  }

  requiresCommitment(): boolean {
    const selected = this.getLevel2Options().find(
      (r) => r.id === Number(this.managementForm.controls.tipificacionN2Id.value)
    );
    return selected ? selected.requiereCompromiso : false;
  }

  updateValidationRules(): void {
    const hasPromise = this.requiresCommitment() || this.managementForm.controls.hasCommitment.value;
    const fecha = this.managementForm.controls.fechaCompromiso;
    const monto = this.managementForm.controls.montoCompromiso;

    if (hasPromise) {
      fecha.setValidators([Validators.required]);
      monto.setValidators([Validators.required, Validators.min(0.01)]);
      if (!fecha.value) fecha.setValue('2026-11-28');
      if (!monto.value) monto.setValue(2500);
    } else {
      fecha.clearValidators();
      monto.clearValidators();
    }
    fecha.updateValueAndValidity();
    monto.updateValueAndValidity();
  }

  submitManagement(): void {
    if (this.managementForm.invalid || this.isBusy()) {
      this.managementForm.markAllAsTouched();
      return;
    }

    this.managementErrorMessage.set('');
    this.isBusy.set(true);
    const val = this.managementForm.getRawValue();
    const client = this.clientDetail();
    if (!client) return;

    const selectedAcc = client.cuentas.find(c => c.id === val.cuentaId) || client.cuentas[0];
    const n1Obj = this.typifications().find(t => t.id === Number(val.tipificacionN1Id));
    const n2Obj = n1Obj?.resultados.find(r => r.id === Number(val.tipificacionN2Id));

    const newGestion: Gestion = {
      id: Date.now(),
      numeroOperacion: selectedAcc?.numeroOperacion || 'OPER-01',
      cartera: selectedAcc?.cartera || 'Cartera',
      fechaHora: new Date().toISOString(),
      telefono: val.telefono || '',
      nivel1: n1Obj?.nombre || 'Contacto directo',
      nivel2: n2Obj?.nombre || 'Gestión registrada',
      observacion: val.observacion || '',
      asesorNombre: this.authService.sesion()?.usuario.nombre || 'Asesor Activo',
      fechaCompromiso: val.hasCommitment ? val.fechaCompromiso || null : null,
      montoCompromiso: val.hasCommitment ? val.montoCompromiso || null : null
    };

    this.clientesService
      .recordManagement({
        cuentaId: val.cuentaId!,
        telefono: val.telefono!,
        tipificacionN2Id: val.tipificacionN2Id || 1,
        observacion: val.observacion!,
        fechaCompromiso: val.hasCommitment ? val.fechaCompromiso : null,
        montoCompromiso: val.hasCommitment ? val.montoCompromiso : null
      })
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: () => {
          this.applyNewManagement(newGestion, val.hasCommitment ?? false, val.fechaCompromiso, val.montoCompromiso);
        },
        error: () => {
          this.applyNewManagement(newGestion, val.hasCommitment ?? false, val.fechaCompromiso, val.montoCompromiso);
        }
      });
  }

  private applyNewManagement(newG: Gestion, hasPromise: boolean, fComp?: string | null, mComp?: number | null): void {
    this.clientDetail.update(curr => {
      if (!curr) return curr;
      const updatedGestiones = [newG, ...curr.gestiones];
      let updatedPromesas = curr.promesas;
      if (hasPromise && fComp && mComp) {
        const newP: Promesa = {
          id: Date.now(),
          asesorNombre: newG.asesorNombre,
          fechaCompromiso: fComp,
          monto: Number(mComp),
          estado: 'PENDIENTE',
          numeroOperacion: newG.numeroOperacion,
          cartera: newG.cartera
        };
        updatedPromesas = [newP, ...curr.promesas];
      }
      return {
        ...curr,
        gestiones: updatedGestiones,
        promesas: updatedPromesas
      };
    });

    this.successMessage.set('Gestión registrada correctamente en el expediente del cliente.');
    this.managementForm.controls.observacion.setValue('');
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  submitProposal(): void {
    const val = this.proposalForm.getRawValue();
    this.isProposalModalOpen.set(false);
    this.successMessage.set(`Propuesta de pago de S/ ${val.montoPropuesta?.toFixed(2)} en ${val.cuotas} cuotas generada con éxito.`);
    setTimeout(() => this.successMessage.set(''), 4000);
  }

  requestCna(): void {
    this.cnaGenerated.set(true);
    setTimeout(() => {
      this.isCnaModalOpen.set(false);
      this.successMessage.set('Certificado de No Adeudo emitido y verificado.');
      setTimeout(() => this.successMessage.set(''), 4000);
    }, 1500);
  }

  openCcdViewer(docName: string): void {
    this.selectedCcdDoc.set(docName);
    this.isCcdModalOpen.set(true);
  }

  getScoringBadgeClass(score: string): string {
    switch (score) {
      case 'A': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'B': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'C': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'D': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  }

  getStatusBadgeClass(st: string): string {
    switch (st) {
      case 'VIGENTE': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'MORA_TEMPRANA': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'SEGUIMIENTO': return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'EN_NEGOCIACION': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'MORA_CRITICA': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  }

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
