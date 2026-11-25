import { Component,inject,signal } from '@angular/core';
import { CurrencyPipe,DatePipe } from '@angular/common';
import { ClientesService } from '../../core/clientes.service';
import { Dashboard } from '../../core/models';
import { mensajeError } from '../../core/api-error';
import { finalize } from 'rxjs';
@Component({selector:'app-dashboard',imports:[CurrencyPipe,DatePipe],templateUrl:'./dashboard.html'})
export class DashboardPage {
 private api=inject(ClientesService);datos=signal<Dashboard|null>(null);periodo=signal('SEMANA');cargando=signal(false);error=signal('');
 constructor(){this.cargar();}
 cargar(){this.cargando.set(true);this.error.set('');this.api.dashboard(this.periodo()).pipe(finalize(()=>this.cargando.set(false))).subscribe({next:d=>this.datos.set(d),error:e=>{this.datos.set(null);this.error.set(mensajeError(e));}});}
 cambiar(p:string){this.periodo.set(p);this.cargar();}
}

