import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'theme-preference';
  readonly isDark = signal<boolean>(this.loadPreference());
  constructor() {
    this.applyTheme(this.isDark());
  }
  toggle() {
    const next = !this.isDark();
    this.isDark.set(next);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, next ? 'dark' : 'light');
    }
    this.applyTheme(next);
  }
  private loadPreference(): boolean {
    if (!isPlatformBrowser(this.platformId)) return true;
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
  private applyTheme(dark: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.toggle('dark-mode', dark);
      document.querySelectorAll<HTMLLinkElement>('[data-favicon-theme]').forEach(link => {
        link.media = dark === (link.dataset['faviconTheme'] === 'dark') ? 'all' : 'not all';
      });
    }
  }
}
