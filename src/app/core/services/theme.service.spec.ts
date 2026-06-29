import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-mode');
  });

  it('should default to light mode when no preference stored and system is light', () => {
    (window.matchMedia as any).mockReturnValue({ matches: false } as MediaQueryList);
    service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });

  it('should default to dark mode when system prefers dark', () => {
    (window.matchMedia as any).mockReturnValue({ matches: true } as MediaQueryList);
    service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('should restore dark preference from localStorage', () => {
    localStorage.setItem('theme-preference', 'dark');
    service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  it('should restore light preference from localStorage', () => {
    localStorage.setItem('theme-preference', 'light');
    service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });

  it('should toggle from light to dark', () => {
    (window.matchMedia as any).mockReturnValue({ matches: false } as MediaQueryList);
    service = TestBed.inject(ThemeService);

    service.toggle();

    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
    expect(localStorage.getItem('theme-preference')).toBe('dark');
  });

  it('should toggle from dark to light', () => {
    localStorage.setItem('theme-preference', 'dark');
    service = TestBed.inject(ThemeService);

    service.toggle();

    expect(service.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
    expect(localStorage.getItem('theme-preference')).toBe('light');
  });
});
