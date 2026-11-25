import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin, of } from 'rxjs';
import { OperacionesService } from '../../core/operaciones.service';
import { AuthService } from '../../core/auth.service';
import { Rol, Usuario } from '../../core/models';
import { UsuarioEntrada } from '../../core/operaciones.models';
import { getErrorMessage } from '../../core/api-error';

@Component({
  selector: 'app-usuarios',
  imports: [ReactiveFormsModule],
  templateUrl: './usuarios.html'
})
export class UsuariosPage {
  readonly authService = inject(AuthService);
  private readonly operacionesService = inject(OperacionesService);
  private readonly fb = inject(FormBuilder);

  readonly usersList = signal<Usuario[]>([]);
  readonly supervisorsList = signal<Usuario[]>([]);
  readonly searchQuery = signal('');
  readonly isLoading = signal(false);
  readonly isBusy = signal(false);
  readonly errorMessage = signal('');
  readonly modalErrorMessage = signal('');
  readonly successMessage = signal('');
  readonly isFormVisible = signal(false);
  readonly editingUser = signal<Usuario | null>(null);
  readonly userToToggleStatus = signal<Usuario | null>(null);
  readonly userToResetPassword = signal<Usuario | null>(null);

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLocaleLowerCase().trim();
    return this.usersList().filter(
      (u) =>
        !q ||
        [u.nombre, u.usuario, u.email, u.rol, u.supervisorNombre].some((v) =>
          v?.toLocaleLowerCase().includes(q)
        )
    );
  });

  readonly userForm = this.fb.nonNullable.group({
    usuario: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]{3,40}$/)]],
    nombre: ['', [Validators.required, Validators.maxLength(120), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: [''],
    rol: ['ASESOR' as Rol, Validators.required],
    supervisorId: [null as number | null]
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
      confirmacion: ['', Validators.required]
    },
    {
      validators: (c) =>
        c.get('password')?.value === c.get('confirmacion')?.value ? null : { coincidencia: true }
    }
  );

  // Backward compatibility getters
  get auth() { return this.authService; }
  get filas() { return this.usersList; }
  get supervisores() { return this.supervisorsList; }
  get busqueda() { return this.searchQuery; }
  get cargando() { return this.isLoading; }
  get ocupado() { return this.isBusy; }
  get error() { return this.errorMessage; }
  get errorModal() { return this.modalErrorMessage; }
  get exito() { return this.successMessage; }
  get formVisible() { return this.isFormVisible; }
  get editando() { return this.editingUser; }
  get estado() { return this.userToToggleStatus; }
  get clave() { return this.userToResetPassword; }
  get filtrados() { return this.filteredUsers; }
  get form() { return this.userForm; }

  constructor() {
    this.loadUsers();
  }

  isAdmin(): boolean {
    return this.authService.sesion()?.usuario.rol === 'ADMIN';
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      usuarios: this.operacionesService.getUsers(),
      supervisores: this.isAdmin() ? this.operacionesService.getSupervisors() : of([] as Usuario[])
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (d) => {
          this.usersList.set(d.usuarios);
          this.supervisorsList.set(d.supervisores);
        },
        error: (err) => this.errorMessage.set(getErrorMessage(err))
      });
  }

  openUserModal(user: Usuario | null = null): void {
    this.editingUser.set(user);
    this.modalErrorMessage.set('');
    this.successMessage.set('');
    this.userForm.reset({
      usuario: user?.usuario || '',
      nombre: user?.nombre || '',
      email: user?.email || '',
      password: '',
      rol: user?.rol || 'ASESOR',
      supervisorId: user?.supervisorId || null
    });
    this.userForm.controls.password.setValidators(
      user ? [] : [Validators.required, Validators.minLength(8), Validators.maxLength(72)]
    );
    this.userForm.controls.password.updateValueAndValidity();
    this.updateValidationRules();
    this.isFormVisible.set(true);
  }

  updateValidationRules(): void {
    const s = this.userForm.controls.supervisorId;
    s.setValidators(this.isAdmin() && this.userForm.controls.rol.value === 'ASESOR' ? [Validators.required] : []);
    if (this.userForm.controls.rol.value !== 'ASESOR') {
      s.setValue(null);
    }
    s.updateValueAndValidity();
  }

  saveUser(): void {
    if (this.userForm.invalid || this.isBusy()) {
      this.userForm.markAllAsTouched();
      return;
    }

    const v = this.userForm.getRawValue();
    const u = this.editingUser();
    const body: UsuarioEntrada = {
      ...v,
      usuario: v.usuario.trim(),
      nombre: v.nombre.trim(),
      email: v.email.trim(),
      password: u ? undefined : v.password
    };

    this.isBusy.set(true);
    this.modalErrorMessage.set('');

    const request$ = u
      ? this.operacionesService.updateUser(u.id, body)
      : this.operacionesService.createUser(body);

    request$.pipe(finalize(() => this.isBusy.set(false))).subscribe({
      next: (saved) => {
        this.isFormVisible.set(false);
        this.successMessage.set(
          u ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.'
        );
        if (saved.id === this.authService.sesion()?.usuario.id) {
          const current = this.authService.sesion()!;
          const updated = { ...current, usuario: saved };
          this.authService.sesion.set(updated);
          sessionStorage.setItem('escall.sesion', JSON.stringify(updated));
        }
        this.loadUsers();
      },
      error: (err) => this.modalErrorMessage.set(getErrorMessage(err))
    });
  }

  openStatusModal(user: Usuario): void {
    this.modalErrorMessage.set('');
    this.userToToggleStatus.set(user);
  }

  confirmToggleStatus(): void {
    const u = this.userToToggleStatus();
    if (!u || this.isBusy()) return;

    this.isBusy.set(true);
    this.modalErrorMessage.set('');

    this.operacionesService
      .updateUserStatus(u.id, !u.activo)
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: () => {
          this.userToToggleStatus.set(null);
          this.successMessage.set(u.activo ? 'Usuario desactivado.' : 'Usuario activado.');
          this.loadUsers();
        },
        error: (err) => this.modalErrorMessage.set(getErrorMessage(err))
      });
  }

  openPasswordModal(user: Usuario): void {
    this.passwordForm.reset();
    this.modalErrorMessage.set('');
    this.userToResetPassword.set(user);
  }

  resetPassword(): void {
    const u = this.userToResetPassword();
    if (!u || this.passwordForm.invalid || this.isBusy()) return;

    this.isBusy.set(true);
    this.modalErrorMessage.set('');

    this.operacionesService
      .updateUserPassword(u.id, this.passwordForm.getRawValue().password)
      .pipe(finalize(() => this.isBusy.set(false)))
      .subscribe({
        next: () => {
          this.userToResetPassword.set(null);
          this.passwordForm.reset();
          this.successMessage.set('Contraseña restablecida correctamente.');
        },
        error: (err) => this.modalErrorMessage.set(getErrorMessage(err))
      });
  }

  // Backward-compatibility aliases
  esAdmin(): boolean { return this.isAdmin(); }
  cargar(): void { this.loadUsers(); }
  abrir(u: Usuario | null = null): void { this.openUserModal(u); }
  reglas(): void { this.updateValidationRules(); }
  guardar(): void { this.saveUser(); }
  abrirEstado(u: Usuario): void { this.openStatusModal(u); }
  confirmarEstado(): void { this.confirmToggleStatus(); }
  abrirClave(u: Usuario): void { this.openPasswordModal(u); }
  restablecer(): void { this.resetPassword(); }
}
