import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { getErrorMessage, mensajeError } from '../../core/api-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loginForm = this.fb.nonNullable.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required]
  });

  readonly errorMessage = signal(
    this.route.snapshot.queryParamMap.has('sesion')
      ? 'Tu sesión venció. Vuelve a iniciar sesión.'
      : ''
  );
  readonly isLoading = signal(false);

  // Backward compatibility getters
  get form() {
    return this.loginForm;
  }
  get error() {
    return this.errorMessage;
  }
  get cargando() {
    return this.isLoading;
  }

  submitLogin(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set('');
    this.isLoading.set(true);
    const { usuario, password } = this.loginForm.getRawValue();

    this.authService
      .login(usuario.trim(), password)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          const redirectUrl = this.route.snapshot.queryParamMap.get('volver');
          const destination = redirectUrl?.startsWith('/') && !redirectUrl.startsWith('//')
            ? redirectUrl
            : '/clientes';
          void this.router.navigateByUrl(destination);
        },
        error: (err) => {
          this.errorMessage.set(
            err.status === 401
              ? 'Usuario o contraseña incorrectos.'
              : getErrorMessage(err)
          );
        }
      });
  }

  // Backward-compatibility alias
  entrar(): void {
    this.submitLogin();
  }
}
