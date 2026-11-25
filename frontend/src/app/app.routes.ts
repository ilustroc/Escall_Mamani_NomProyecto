import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CarteraComponent } from './features/cartera/cartera.component';
import { ReportesComponent } from './features/reportes/reportes.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'cartera', component: CarteraComponent },
      { path: 'clientes', redirectTo: 'cartera' },
      { path: 'reportes', component: ReportesComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
