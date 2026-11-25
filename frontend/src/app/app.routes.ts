import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CarteraComponent } from './features/cartera/cartera.component';
import { ReportesComponent } from './features/reportes/reportes.component';
import { ConexionPage } from './pages/conexion/conexion';
import { LoginPage } from './pages/login/login';
import { ClientesPage } from './pages/clientes/clientes';
import { DetallePage } from './pages/detalle/detalle';
import { UsuariosPage } from './pages/usuarios/usuarios';
import { ImportacionesPage } from './pages/importaciones/importaciones';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent, data: { roles: ['ADMIN', 'SUPERVISOR'] } },
      { path: 'cartera', component: CarteraComponent },
      { path: 'reportes', component: ReportesComponent, data: { roles: ['ADMIN', 'SUPERVISOR'] } },
      { path: 'conexion', component: ConexionPage },
      { path: 'clientes', component: ClientesPage },
      { path: 'clientes/:id', component: DetallePage },
      { path: 'usuarios', component: UsuariosPage, data: { roles: ['ADMIN', 'SUPERVISOR'] } },
      { path: 'importaciones', component: ImportacionesPage, data: { roles: ['ADMIN'] } }
    ]
  },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: '**', redirectTo: '' }
];
