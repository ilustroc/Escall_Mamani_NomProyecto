import { Component,inject,signal } from '@angular/core';
import { FormBuilder,ReactiveFormsModule,Validators } from '@angular/forms';
import { CurrencyPipe,DatePipe } from '@angular/common';
import { ActivatedRoute,Router,RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClientesService } from '../../core/clientes.service';
import { AuthService } from '../../core/auth.service';
import { ClienteDetalle,Tipificacion } from '../../core/models';
import { mensajeError } from '../../core/api-error';
@Component({selector:'app-detalle',imports:[ReactiveFormsModule,RouterLink,CurrencyPipe,DatePipe],templateUrl:'./detalle.html'})
export class DetallePage {
 private api=inject(ClientesService);readonly auth=inject(AuthService);private route=inject(ActivatedRoute);private router=inject(Router);private fb=inject(FormBuilder);
 id=Number(this.route.snapshot.paramMap.get('id'));cliente=signal<ClienteDetalle|null>(null);cargando=signal(false);ocupado=signal(false);error=signal('');ok=signal('');editando=signal(false);eliminando=signal(false);tab=signal('cuentas');tipos=signal<Tipificacion[]>([]);n1=signal(0);errorGestion=signal('');
 edicion=this.fb.nonNullable.group({nombres:['',[Validators.required,Validators.maxLength(150),Validators.pattern(/\S/)]],email:['',[Validators.email,Validators.maxLength(150)]],direccion:['',Validators.maxLength(300)]});
 gestion=this.fb.group({cuentaId:[null as number|null,Validators.required],telefono:['',[Validators.required,Validators.pattern(/^[0-9+ ]{6,20}$/)]],tipificacionN2Id:[null as number|null,Validators.required],observacion:['',[Validators.required,Validators.maxLength(500),Validators.pattern(/\S/)]],fechaCompromiso:[''],montoCompromiso:[null as number|null]});
 constructor(){this.cargar();if(this.auth.sesion()?.usuario.rol==='ASESOR')this.api.tipificaciones().subscribe({next:d=>this.tipos.set(d),error:e=>this.errorGestion.set(mensajeError(e))});}
 cargar(){if(!Number.isInteger(this.id)||this.id<1){this.error.set('Identificador de cliente inválido.');return;}this.cargando.set(true);this.api.detalle(this.id).pipe(finalize(()=>this.cargando.set(false))).subscribe({next:d=>this.cliente.set(d),error:e=>this.error.set(mensajeError(e))});}
 editar(){const c=this.cliente()!;this.edicion.setValue({nombres:c.nombres,email:c.email||'',direccion:c.direccion||''});this.error.set('');this.ok.set('');this.editando.set(true);}
 guardar(){if(this.edicion.invalid||this.ocupado())return;this.ocupado.set(true);this.error.set('');this.api.actualizar(this.id,this.edicion.getRawValue()).pipe(finalize(()=>this.ocupado.set(false))).subscribe({next:d=>{this.cliente.set(d);this.editando.set(false);this.ok.set('Datos del cliente actualizados.');},error:e=>this.error.set(mensajeError(e))});}
 eliminar(){if(this.ocupado())return;this.ocupado.set(true);this.error.set('');this.api.eliminar(this.id).pipe(finalize(()=>this.ocupado.set(false))).subscribe({next:()=>void this.router.navigate(['/clientes']),error:e=>{this.error.set(mensajeError(e));this.eliminando.set(false);}});}
 cambiarN1(valor:string){this.n1.set(Number(valor));this.gestion.controls.tipificacionN2Id.setValue(null);this.actualizarReglas();}
 resultados(){return this.tipos().find(n=>n.id===this.n1())?.resultados||[];}
 requiereCompromiso(){return this.resultados().find(r=>r.id===Number(this.gestion.controls.tipificacionN2Id.value))?.requiereCompromiso||false;}
 actualizarReglas(){const fecha=this.gestion.controls.fechaCompromiso,monto=this.gestion.controls.montoCompromiso;const requiere=this.requiereCompromiso();fecha.setValidators(requiere?[Validators.required]:[]);monto.setValidators(requiere?[Validators.required,Validators.min(.01)]:[]);if(!requiere){fecha.setValue('');monto.setValue(null);}fecha.updateValueAndValidity();monto.updateValueAndValidity();}
 registrar(){if(this.gestion.invalid||this.ocupado())return;this.errorGestion.set('');this.ocupado.set(true);const v=this.gestion.getRawValue();this.api.registrarGestion({...v,fechaCompromiso:v.fechaCompromiso||null}).pipe(finalize(()=>this.ocupado.set(false))).subscribe({next:()=>{this.ok.set('Gestión registrada correctamente.');this.gestion.reset();this.n1.set(0);this.actualizarReglas();this.cargar();},error:e=>this.errorGestion.set(mensajeError(e))});}
}
