import { Component,computed,inject,signal } from '@angular/core';
import { FormBuilder,ReactiveFormsModule,Validators,AbstractControl,ValidationErrors } from '@angular/forms';
import { CurrencyPipe,DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { OperacionesService } from '../../core/operaciones.service';
import { FilaReporte,FiltrosReporte,OpcionesFiltro,TipoReporte } from '../../core/operaciones.models';
import { mensajeError } from '../../core/api-error';
import { descargarCsv } from '../../core/descargas';
function rangoValido(c:AbstractControl):ValidationErrors|null{
 if(c.get('periodo')?.value!=='PERSONALIZADO')return null;
 const desde=c.get('desde')?.value,hasta=c.get('hasta')?.value;if(!desde||!hasta)return null;
 if(desde>hasta)return {rango:'La fecha inicial no puede ser posterior a la final.'};
 return (Date.parse(hasta)-Date.parse(desde))/86400000>366?{rango:'El rango máximo es de 366 días.'}:null;
}
@Component({selector:'app-reportes',imports:[ReactiveFormsModule,CurrencyPipe,DatePipe],templateUrl:'./reportes.html'})
export class ReportesPage {
 private api=inject(OperacionesService);private fb=inject(FormBuilder);
 form=this.fb.nonNullable.group({tipo:['gestiones' as TipoReporte],periodo:['MES'],desde:[''],hasta:[''],asesorId:[''],cartera:[''],cosecha:['']},{validators:rangoValido});
 opciones=signal<OpcionesFiltro>({carteras:[],cosechas:[],asesores:[]});errorOpciones=signal('');error=signal('');cargando=signal(false);filas=signal<FilaReporte[]>([]);tipoMostrado=signal<TipoReporte>('gestiones');pagina=signal(1);consulta=signal('Este mes');
 readonly tamano=25;paginas=computed(()=>Math.max(1,Math.ceil(this.filas().length/this.tamano)));visibles=computed(()=>this.filas().slice((this.pagina()-1)*this.tamano,this.pagina()*this.tamano));totalMonto=computed(()=>this.filas().reduce((s,r)=>s+(r.monto||0),0));
 constructor(){this.api.filtros().subscribe({next:o=>this.opciones.set(o),error:e=>this.errorOpciones.set(mensajeError(e))});this.consultar();}
 cambiarPeriodo(){const personal=this.form.controls.periodo.value==='PERSONALIZADO';for(const c of [this.form.controls.desde,this.form.controls.hasta]){c.setValidators(personal?[Validators.required]:[]);c.updateValueAndValidity();}this.form.updateValueAndValidity();}
 consultar(){if(this.form.invalid||this.cargando()){this.form.markAllAsTouched();return;}const v=this.form.getRawValue();const filtros:FiltrosReporte={asesorId:v.asesorId,cartera:v.cartera,cosecha:v.cosecha};if(v.periodo==='PERSONALIZADO'){filtros.desde=v.desde;filtros.hasta=v.hasta;}else filtros.periodo=v.periodo;
 this.error.set('');this.cargando.set(true);this.filas.set([]);this.api.reporte(v.tipo,filtros).pipe(finalize(()=>this.cargando.set(false))).subscribe({next:r=>{this.filas.set(r);this.tipoMostrado.set(v.tipo);this.pagina.set(1);const nombres:Record<string,string>={HOY:'Hoy',SEMANA:'Esta semana',MES:'Este mes'};this.consulta.set(v.periodo==='PERSONALIZADO'?`${v.desde} a ${v.hasta}`:nombres[v.periodo]);},error:e=>this.error.set(mensajeError(e))});}
 exportar(){const tipo=this.tipoMostrado();const cabecera=tipo==='gestiones'?['Fecha','Documento','Cliente','Operación','Cartera','Asesor','Tipo de contacto','Resultado','Teléfono','Observación']:tipo==='pagos'?['Fecha de pago','Documento','Cliente','Operación','Cartera','Asesor','Monto','Referencia']:['Fecha de compromiso','Documento','Cliente','Operación','Cartera','Asesor','Monto','Estado'];
 const filas=this.filas().map(r=>tipo==='gestiones'?[r.fechaHora,r.clienteDocumento,r.clienteNombres,r.numeroOperacion,r.cartera,r.asesorNombre,r.nivel1,r.nivel2,r.telefono,r.observacion]:tipo==='pagos'?[r.fechaPago,r.clienteDocumento,r.clienteNombres,r.numeroOperacion,r.cartera,r.asesorNombre,r.monto,r.referencia]:[r.fechaCompromiso,r.clienteDocumento,r.clienteNombres,r.numeroOperacion,r.cartera,r.asesorNombre,r.monto,r.estado]);descargarCsv(`escall-${tipo}.csv`,[cabecera,...filas]);}
}
