import { Component,inject,signal } from '@angular/core';
import { finalize } from 'rxjs';
import { PublicApiService } from '../../core/public-api.service';
import { mensajeError } from '../../core/api-error';
@Component({selector:'app-conexion',templateUrl:'./conexion.html'})
export class ConexionPage {
  private api=inject(PublicApiService); mensaje=signal('');error=signal('');cargando=signal(false);
  constructor(){this.comprobar();}
  comprobar(){this.cargando.set(true);this.error.set('');this.mensaje.set('');this.api.obtenerSaludo().pipe(finalize(()=>this.cargando.set(false))).subscribe({next:t=>this.mensaje.set(t),error:e=>this.error.set(mensajeError(e))});}
}
