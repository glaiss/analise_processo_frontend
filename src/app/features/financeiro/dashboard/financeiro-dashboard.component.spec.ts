import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { FinanceiroDashboardComponent } from './financeiro-dashboard.component';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('FinanceiroDashboardComponent', () => {
  beforeEach(async () => {
    const indicadores = {
      faturamentoPeriodo: 1000,
      caixaRecebidoPeriodo: 600,
      contasAReceber: 400,
      contasVencidas: 50,
      previsaoRecebimentoProximoMes: 200,
      dataReferencia: '2026-01-31',
    };
    await TestBed.configureTestingModule({
      imports: [FinanceiroDashboardComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: FinanceiroService, useValue: { indicadores: () => ({ subscribe: (o: any) => { o.next(indicadores); return { unsubscribe: vi.fn() }; } }) } },
        { provide: NotificationService, useValue: { error: vi.fn(), warn: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(FinanceiroDashboardComponent);
    expect(fixture.componentInstance).toBeTruthy();
  }, 15000);

  it('should load indicadores on init', () => {
    const fixture = TestBed.createComponent(FinanceiroDashboardComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.indicadores()).toBeTruthy();
  }, 15000);

  it('should format currency in pt-BR', () => {
    const fixture = TestBed.createComponent(FinanceiroDashboardComponent);
    expect(fixture.componentInstance.formatCurrency(1234.5)).toBe('R$ 1.234,50');
  }, 15000);
});