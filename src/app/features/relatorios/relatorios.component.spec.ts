import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RelatoriosComponent } from './relatorios.component';
import { FinanceiroService } from '../../core/services/financeiro.service';
import { NotificationService } from '../../core/services/notification.service';

describe('RelatoriosComponent', () => {
  const relatorio = {
    faturamentoPeriodo: 10000,
    caixaRecebidoPeriodo: 8000,
    contasAReceber: 5000,
    contasVencidas: 1000,
    previsaoRecebimentoProximoMes: 3000,
    contratosFechadosPeriodo: 2,
    ticketMedioPeriodo: 5000,
    contratosValidos: 10,
    contratosPendentes: 3,
    dataReferencia: '2026-01-31',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelatoriosComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: FinanceiroService, useValue: { relatorioFinanceiro: () => ({ subscribe: (o: any) => { o.next(relatorio); return { unsubscribe: vi.fn() }; } }) } },
        { provide: NotificationService, useValue: { error: vi.fn(), warn: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RelatoriosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  }, 15000);

  it('should load relatorio on init', () => {
    const fixture = TestBed.createComponent(RelatoriosComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.relatorio()).toBeTruthy();
  }, 15000);

  it('should build kpis from relatorio', () => {
    const fixture = TestBed.createComponent(RelatoriosComponent);
    fixture.detectChanges();
    const kpis = fixture.componentInstance.kpis;
    expect(kpis.length).toBe(6);
    expect(kpis[0].label).toBe('Contratos fechados');
    expect(kpis[0].value).toBe('2');
    expect(kpis[1].value).toContain('10.000,00');
  }, 15000);

  it('should build resumo table from relatorio', () => {
    const fixture = TestBed.createComponent(RelatoriosComponent);
    fixture.detectChanges();
    const tabela = fixture.componentInstance.tabelaResumo;
    expect(tabela.length).toBe(4);
    expect(tabela[0].metrica).toContain('Contratos válidos');
    expect(tabela[0].valor).toBe('10');
  }, 15000);

  it('should format currency in pt-BR', () => {
    const fixture = TestBed.createComponent(RelatoriosComponent);
    expect(fixture.componentInstance.formatCurrency(1234.5)).toContain('1.234,50');
  }, 15000);
});