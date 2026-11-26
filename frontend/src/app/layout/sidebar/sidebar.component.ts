import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/auth.service';
import { Rol } from '../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-screen select-none transition-colors">

      <div class="h-16 px-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm shadow-sm">
            E
          </div>
          <div>
            <div class="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              ESCALL PERÚ
              <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">PRO</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-none">CRM Cobranzas</p>
          </div>
        </div>
      </div>

      <div class="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        <div class="space-y-1">
          <div class="px-2 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Módulos Principales
          </div>

          <a *ngIf="hasAnyRole('ADMIN', 'SUPERVISOR')" routerLink="/dashboard" routerLinkActive="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-medium"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
            </svg>
            <span>Dashboard Ejecutivo</span>
          </a>

          <a routerLink="/cartera" routerLinkActive="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-medium"
             class="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <div class="flex items-center gap-3">
              <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Cola de Gestión</span>
            </div>
            <span class="text-[11px] font-mono px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold">19</span>
          </a>

          <a *ngIf="hasAnyRole('ADMIN', 'SUPERVISOR')" routerLink="/reportes" routerLinkActive="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-medium"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>
            </svg>
            <span>Reportes & Metas</span>
          </a>
        </div>

        <div class="space-y-1">
          <div class="px-2 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Administración
          </div>

          <a *ngIf="hasAnyRole('ADMIN')" routerLink="/importaciones" routerLinkActive="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-medium"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Importación CSV</span>
          </a>

          <a *ngIf="hasAnyRole('ADMIN', 'SUPERVISOR')" routerLink="/usuarios" routerLinkActive="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 font-medium"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Usuarios & Roles</span>
          </a>
        </div>

        <div class="space-y-2 pt-1">
          <div class="px-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Carteras en Gestión
          </div>

          <div class="px-3 py-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/30 text-xs space-y-1.5">
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                BCP Comercial
              </span>
              <span class="font-mono text-[11px] text-slate-500">S/ 680k</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                BBVA Consumo
              </span>
              <span class="font-mono text-[11px] text-slate-500">S/ 420k</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                Scotiabank Pyme
              </span>
              <span class="font-mono text-[11px] text-slate-500">S/ 385k</span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-indigo-600 text-white font-medium text-xs flex items-center justify-center">
              {{ initials }}
            </div>
            <div class="text-left">
              <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{{ currentUserName }}</p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ currentUserRole }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1">
          <button (click)="logout()" title="Cerrar sesión"
                  class="p-1.5 rounded-md text-slate-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Cerrar sesión">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
          <button (click)="theme.toggleTheme()" [title]="theme.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
                  class="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <svg *ngIf="!theme.isDark()" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg *ngIf="theme.isDark()" class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
          </div>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  private readonly router = inject(Router);

  hasAnyRole(...roles: Rol[]): boolean {
    const role = this.auth.sesion()?.usuario.rol;
    return !!role && roles.includes(role);
  }

  get currentUserName(): string {
    return this.auth.sesion()?.usuario.nombre ?? 'Usuario';
  }

  get currentUserRole(): string {
    const role = this.auth.sesion()?.usuario.rol;
    return role ? role.charAt(0) + role.slice(1).toLowerCase() : '';
  }

  get initials(): string {
    return this.currentUserName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
  }

  logout(): void {
    this.auth.clearSession();
    void this.router.navigate(['/login']);
  }
}
