import { Component,ElementRef,ViewChild,inject,signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { OperacionesService } from '../../core/operaciones.service';
import { Carga,TipoCarga } from '../../core/operaciones.models';
import { mensajeError } from '../../core/api-error';
import { descargarCsv } from '../../core/descargas';
@Component({selector:'app-importaciones',imports:[DatePipe],templateUrl:'./importaciones.html'})
export class ImportacionesPage {
 @ViewChild('selectorArchivo') selectorArchivo?:ElementRef<HTMLInputElement>;
 private api=inject(OperacionesService);tipo=signal<TipoCarga>('asignaciones');archivo=signal<File|null>(null);cargando=signal(false);consultando=signal(false);error=signal('');errorHistorial=signal('');resultado=signal<Carga|null>(null);historial=signal<Carga[]>([]);detalle=signal<Carga|null>(null);
 constructor(){this.cargarHistorial();}
 cambiarTipo(t:string){if(this.cargando())return;this.tipo.set(t as TipoCarga);this.limpiar();}
 limpiar(){if(this.cargando())return;this.archivo.set(null);this.resultado.set(null);this.error.set('');if(this.selectorArchivo)this.selectorArchivo.nativeElement.value='';}
 seleccionar(event:Event){this.resultado.set(null);this.error.set('');const input=event.target as HTMLInputElement;const f=input.files?.[0]||null;this.archivo.set(null);if(!f)return;if(!/\.(csv|txt)$/i.test(f.name)){this.error.set('Selecciona un archivo CSV o TXT guardado en UTF-8.');input.value='';return;}if(!f.size){this.error.set('El archivo está vacío.');input.value='';return;}if(f.size>10*1024*1024){this.error.set('El archivo supera el límite de 10 MB.');input.value='';return;}this.archivo.set(f);}
 importar(){const f=this.archivo();if(!f||this.cargando())return;this.cargando.set(true);this.error.set('');this.resultado.set(null);this.api.importar(this.tipo(),f).pipe(finalize(()=>this.cargando.set(false))).subscribe({next:r=>{this.resultado.set(r);this.archivo.set(null);if(this.selectorArchivo)this.selectorArchivo.nativeElement.value='';this.cargarHistorial();},error:e=>this.error.set(mensajeError(e))});}
 cargarHistorial(){this.consultando.set(true);this.errorHistorial.set('');this.api.cargas().pipe(finalize(()=>this.consultando.set(false))).subscribe({next:h=>this.historial.set(h),error:e=>this.errorHistorial.set(mensajeError(e))});}
 plantilla(){const columnas=this.tipo()==='asignaciones'?['documento','tipo_documento','nombres','telefono','email','direccion','numero_operacion','entidad','producto','cartera','cosecha','deuda','dias_mora','asesor']:['numero_operacion','fecha_pago','monto','referencia'];descargarCsv(`plantilla-${this.tipo()}.csv`,[columnas]);}
}
