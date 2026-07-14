import { TestBed } from '@angular/core/testing';
import { CacheMonitorComponent } from './cache-monitor.component';
import { CacheService } from '../../../core/services/cache.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('CacheMonitorComponent', () => {
  let mockCacheService: Partial<CacheService>;
  const mockCacheData = {
    processos: { size: 5, chaves: ['key1'], estatisticas: { hitCount: 10, missCount: 2, loadSuccessCount: 8, evictionCount: 1, hitRate: 0.83 } },
    usuarios: { size: 3, chaves: ['u1'], estatisticas: { hitCount: 5, missCount: 1, loadSuccessCount: 4, evictionCount: 0, hitRate: 0.83 } }
  };

  beforeEach(async () => {
    mockCacheService = {
      listarCaches: vi.fn().mockReturnValue(of(mockCacheData))
    };

    if (typeof IntersectionObserver === 'undefined') {
      class MockIntersectionObserver {
        observe() {}
        disconnect() {}
      }
      vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    }

    await TestBed.configureTestingModule({
      imports: [CacheMonitorComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load caches on init', () => {
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    fixture.detectChanges();

    expect(mockCacheService.listarCaches).toHaveBeenCalled();
    expect(fixture.componentInstance.todosCaches().length).toBe(2);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should order caches by predefined ordemRegioes', () => {
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    fixture.detectChanges();

    const caches = fixture.componentInstance.todosCaches();
    expect(caches[0].nome).toBe('processos');
    expect(caches[1].nome).toBe('usuarios');
  });

  it('should display cache cards', () => {
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.cache-card');
    expect(cards.length).toBe(2);
  });

  it('should display total entries', () => {
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    fixture.detectChanges();

    const totalEl = fixture.nativeElement.querySelector('.total');
    expect(totalEl.textContent).toContain('8');
  });

  it('should set loading to false even when map is empty', () => {
    mockCacheService.listarCaches = vi.fn().mockReturnValue(of({}));
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.todosCaches().length).toBe(0);
  });

  it('should handle error when loading caches fails', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCacheService.listarCaches = vi.fn().mockReturnValue(throwError(() => new Error('Erro de rede')));
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.error()).toBe('Não foi possível carregar os caches. Verifique se o usuário possui perfil ADMIN.');
    consoleSpy.mockRestore();
  });

  it('should call carregar when refresh button is clicked', () => {
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    const spy = vi.spyOn(fixture.componentInstance, 'carregar');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(spy).toHaveBeenCalled();
  });

  it('formatPercent should return formatted string', () => {
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    const component = fixture.componentInstance;
    expect(component.formatPercent(0.856)).toBe('85.6%');
    expect(component.formatPercent(0)).toBe('0.0%');
    expect(component.formatPercent(NaN)).toBe('0%');
  });

  it('trackByNome should return item nome', () => {
    const fixture = TestBed.createComponent(CacheMonitorComponent);
    const component = fixture.componentInstance;
    const item = { nome: 'teste', size: 1, chaves: [], estatisticas: { hitCount: 0, missCount: 0, loadSuccessCount: 0, evictionCount: 0, hitRate: 0 } };
    expect(component.trackByNome(0, item)).toBe('teste');
  });
});
