import { Component,inject,signal } from '@angular/core';
import { FormBuilder,ReactiveFormsModule,Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Router,RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClientesService } from '../../core/clientes.service';
import { AuthService } from '../../core/auth.service';
import { ClienteResumen } from '../../core/models';
import { mensajeError } from '../../core/api-error';
@Component({selector:'app-clientes',imports:[ReactiveFormsModule,RouterLink,CurrencyPipe],templateUrl:'./clientes.html'})
export class ClientesPage {
 private fb=inject(FormBuilder);private api=inject(ClientesService);readonly auth=inject(AuthService);private router=inject(Router);
 filas=signal<ClienteResumen[]>([]);cargando=signal(false);error=signal('');buscado=signal(false);nuevo=signal(false);guardando=signal(false);errorAlta=signal('');
 busqueda=this.fb.nonNullable.group({q:['',[Validators.required,Validators.minLength(3),Validators.maxLength(100)]]});
 alta=this.fb.nonNullable.group({tipoDocumento:['DNI',[Validators.required,Validators.maxLength(10)]],documento:['',[Validators.required,Validators.maxLength(20),Validators.pattern(/\S/)]],nombres:['',[Validators.required,Validators.maxLength(150),Validators.pattern(/\S/)]],email:['',[Validators.email,Validators.maxLength(150)]],direccion:['',Validators.maxLength(300)]});
 buscar(){if(this.busqueda.invalid||this.cargando())return;this.cargando.set(true);this.error.set('');this.filas.set([]);this.api.buscar(this.busqueda.getRawValue().q.trim()).pipe(finalize(()=>this.cargando.set(false))).subscribe({next:d=>{this.filas.set(d);this.buscado.set(true);},error:e=>this.error.set(mensajeError(e))});}
 abrirAlta(){this.alta.reset({tipoDocumento:'DNI'});this.errorAlta.set('');this.nuevo.set(true);}
 crear(){if(this.alta.invalid||this.guardando())return;this.guardando.set(true);this.errorAlta.set('');const c=this.alta.getRawValue();this.api.crear({...c,documento:c.documento.trim(),nombres:c.nombres.trim()}).pipe(finalize(()=>this.guardando.set(false))).subscribe({next:d=>void this.router.navigate(['/clientes',d.id]),error:e=>this.errorAlta.set(mensajeError(e))});}
}
