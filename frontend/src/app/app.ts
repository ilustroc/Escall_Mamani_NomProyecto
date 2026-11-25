import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from './core/auth.service';
@Component({selector:'app-root',imports:[RouterOutlet,RouterLink,RouterLinkActive],templateUrl:'./app.html'})
export class App {
  readonly auth=inject(AuthService); private router=inject(Router);
  salir(){this.auth.logout().pipe(finalize(()=>{this.auth.limpiar();void this.router.navigate(['/login']);})).subscribe({error:()=>{}});}
}
