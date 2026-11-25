import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { DebtorSlideOverComponent } from '../features/gestion-deudor/components/debtor-slide-over.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopbarComponent, DebtorSlideOverComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <!-- Sidebar fija -->
      <app-sidebar></app-sidebar>

      <!-- Contenedor central -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Topbar superior -->
        <app-topbar></app-topbar>

        <!-- Área de contenido con scroll -->
        <main class="flex-1 overflow-y-auto p-6 md:p-8">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Slide-over lateral global para detalle del deudor -->
      <app-debtor-slide-over></app-debtor-slide-over>
    </div>
  `
})
export class MainLayoutComponent {}
