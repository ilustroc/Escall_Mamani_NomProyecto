import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginPage } from './pages/login/login';
import { ConexionPage } from './pages/conexion/conexion';
import { ClientesPage } from './pages/clientes/clientes';
import { DetallePage } from './pages/detalle/detalle';
import { DashboardPage } from './pages/dashboard/dashboard';
import { ReportesPage } from './pages/reportes/reportes';
import { UsuariosPage } from './pages/usuarios/usuarios';
import { ImportacionesPage } from './pages/importaciones/importaciones';
export const routes:Routes=[
  {path:'',pathMatch:'full',redirectTo:'clientes'},
  {path:'login',component:LoginPage},
  {path:'conexion',component:ConexionPage},
  {path:'clientes',component:ClientesPage,canActivate:[authGuard]},
  {path:'clientes/:id',component:DetallePage,canActivate:[authGuard]},
  {path:'dashboard',component:DashboardPage,canActivate:[authGuard],data:{roles:['ADMIN','SUPERVISOR']}},
  {path:'reportes',component:ReportesPage,canActivate:[authGuard],data:{roles:['ADMIN','SUPERVISOR']}},
  {path:'usuarios',component:UsuariosPage,canActivate:[authGuard],data:{roles:['ADMIN','SUPERVISOR']}},
  {path:'importaciones',component:ImportacionesPage,canActivate:[authGuard],data:{roles:['ADMIN']}},
  {path:'**',redirectTo:'clientes'}
];
