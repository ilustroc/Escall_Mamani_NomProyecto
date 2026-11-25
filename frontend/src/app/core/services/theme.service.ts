import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDark = signal<boolean>(false);

  constructor() {
    // Verificar preferencia guardada o preferencia del sistema
    const saved = localStorage.getItem('escall_theme');
    if (saved) {
      this.isDark.set(saved === 'dark');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDark.set(prefersDark);
    }

    effect(() => {
      const dark = this.isDark();
      if (dark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('escall_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('escall_theme', 'light');
      }
    });
  }

  toggleTheme() {
    this.isDark.update(prev => !prev);
  }
}
