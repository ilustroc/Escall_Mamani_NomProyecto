import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/api-error';
@Component({selector:'app-login',imports:[ReactiveFormsModule],templateUrl:'./login.html'})
export class LoginPage {
  private fb=inject(FormBuilder);private auth=inject(AuthService);private router=inject(Router);private route=inject(ActivatedRoute);
  form=this.fb.nonNullable.group({usuario:['',Validators.required],password:['',Validators.required]});
  error=signal(this.route.snapshot.queryParamMap.has('sesion')?'Tu sesión venció. Vuelve a iniciar sesión.':''); cargando=signal(false);
  entrar(){if(this.form.invalid || this.cargando()){this.form.markAllAsTouched();return;}this.error.set('');this.cargando.set(true);const v=this.form.getRawValue();
    this.auth.login(v.usuario.trim(),v.password).pipe(finalize(()=>this.cargando.set(false))).subscribe({next:()=>{const volver=this.route.snapshot.queryParamMap.get('volver');void this.router.navigateByUrl(volver?.startsWith('/')&&!volver.startsWith('//')?volver:'/clientes');},error:e=>this.error.set(e.status===401?'Usuario o contraseña incorrectos.':mensajeError(e))});}
}
