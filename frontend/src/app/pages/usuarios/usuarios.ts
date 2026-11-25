import { Component,computed,inject,signal } from '@angular/core';
import { FormBuilder,ReactiveFormsModule,Validators } from '@angular/forms';
import { finalize,forkJoin,of } from 'rxjs';
import { OperacionesService } from '../../core/operaciones.service';
import { AuthService } from '../../core/auth.service';
import { Rol,Usuario } from '../../core/models';
import { UsuarioEntrada } from '../../core/operaciones.models';
import { mensajeError } from '../../core/api-error';
@Component({selector:'app-usuarios',imports:[ReactiveFormsModule],templateUrl:'./usuarios.html'})
export class UsuariosPage {
 readonly auth=inject(AuthService);private api=inject(OperacionesService);private fb=inject(FormBuilder);
 filas=signal<Usuario[]>([]);supervisores=signal<Usuario[]>([]);busqueda=signal('');cargando=signal(false);ocupado=signal(false);error=signal('');errorModal=signal('');exito=signal('');formVisible=signal(false);editando=signal<Usuario|null>(null);estado=signal<Usuario|null>(null);clave=signal<Usuario|null>(null);
 filtrados=computed(()=>{const q=this.busqueda().toLocaleLowerCase().trim();return this.filas().filter(u=>!q||[u.nombre,u.usuario,u.email,u.rol,u.supervisorNombre].some(v=>v?.toLocaleLowerCase().includes(q)));});
 form=this.fb.nonNullable.group({usuario:['',[Validators.required,Validators.pattern(/^[a-zA-Z0-9._-]{3,40}$/)]],nombre:['',[Validators.required,Validators.maxLength(120),Validators.pattern(/\S/)]],email:['',[Validators.required,Validators.email,Validators.maxLength(150)]],password:[''],rol:['ASESOR' as Rol,Validators.required],supervisorId:[null as number|null]});
 passwordForm=this.fb.nonNullable.group({password:['',[Validators.required,Validators.minLength(8),Validators.maxLength(72)]],confirmacion:['',Validators.required]},{validators:c=>c.get('password')?.value===c.get('confirmacion')?.value?null:{coincidencia:true}});
 constructor(){this.cargar();}
 esAdmin(){return this.auth.sesion()?.usuario.rol==='ADMIN';}
 cargar(){this.cargando.set(true);this.error.set('');forkJoin({usuarios:this.api.usuarios(),supervisores:this.esAdmin()?this.api.supervisores():of([] as Usuario[])}).pipe(finalize(()=>this.cargando.set(false))).subscribe({next:d=>{this.filas.set(d.usuarios);this.supervisores.set(d.supervisores);},error:e=>this.error.set(mensajeError(e))});}
 abrir(u:Usuario|null=null){this.editando.set(u);this.errorModal.set('');this.exito.set('');this.form.reset({usuario:u?.usuario||'',nombre:u?.nombre||'',email:u?.email||'',password:'',rol:u?.rol||'ASESOR',supervisorId:u?.supervisorId||null});this.form.controls.password.setValidators(u?[]:[Validators.required,Validators.minLength(8),Validators.maxLength(72)]);this.form.controls.password.updateValueAndValidity();this.reglas();this.formVisible.set(true);}
 reglas(){const s=this.form.controls.supervisorId;s.setValidators(this.esAdmin()&&this.form.controls.rol.value==='ASESOR'?[Validators.required]:[]);if(this.form.controls.rol.value!=='ASESOR')s.setValue(null);s.updateValueAndValidity();}
 guardar(){if(this.form.invalid||this.ocupado()){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();const u=this.editando();const body:UsuarioEntrada={...v,usuario:v.usuario.trim(),nombre:v.nombre.trim(),email:v.email.trim(),password:u?undefined:v.password};this.ocupado.set(true);this.errorModal.set('');const peticion=u?this.api.editarUsuario(u.id,body):this.api.crearUsuario(body);peticion.pipe(finalize(()=>this.ocupado.set(false))).subscribe({next:d=>{this.formVisible.set(false);this.exito.set(u?'Usuario actualizado correctamente.':'Usuario creado correctamente.');if(d.id===this.auth.sesion()?.usuario.id){const s=this.auth.sesion()!;const actualizado={...s,usuario:d};this.auth.sesion.set(actualizado);sessionStorage.setItem('escall.sesion',JSON.stringify(actualizado));}this.cargar();},error:e=>this.errorModal.set(mensajeError(e))});}
 confirmarEstado(){const u=this.estado();if(!u||this.ocupado())return;this.ocupado.set(true);this.errorModal.set('');this.api.estadoUsuario(u.id,!u.activo).pipe(finalize(()=>this.ocupado.set(false))).subscribe({next:()=>{this.estado.set(null);this.exito.set(u.activo?'Usuario desactivado.':'Usuario activado.');this.cargar();},error:e=>this.errorModal.set(mensajeError(e))});}
 abrirEstado(u:Usuario){this.errorModal.set('');this.estado.set(u);}
 abrirClave(u:Usuario){this.passwordForm.reset();this.errorModal.set('');this.clave.set(u);}
 restablecer(){const u=this.clave();if(!u||this.passwordForm.invalid||this.ocupado())return;this.ocupado.set(true);this.errorModal.set('');this.api.passwordUsuario(u.id,this.passwordForm.getRawValue().password).pipe(finalize(()=>this.ocupado.set(false))).subscribe({next:()=>{this.clave.set(null);this.passwordForm.reset();this.exito.set('Contraseña restablecida correctamente.');},error:e=>this.errorModal.set(mensajeError(e))});}
}
