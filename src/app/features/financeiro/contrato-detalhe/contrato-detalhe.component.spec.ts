import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ContratoDetalheComponent } from './contrato-detalhe.component';
import { RecebimentoDialogComponent } from '../recebimento-dialog/recebimento-dialog.component';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SituacaoFinanceira } from '../../../core/models/financeiro/parcela.model';
import { of, throwError } from 'rxjs';

describe('ContratoDetalheComponent', () => {
  let mockFinanceiro: Partial<FinanceiroService>;
  let mockNotification: Partial<NotificationService>;
  let mockDialog: any;
  let dialogAfterClosed: any;
  let paramMap: { value: string | null };

  const situacao: SituacaoFinanceira = {
    contratoId: 'c1',
    numeroContrato: '2026-001',
    valorContratado: 1000,
    valorRecebido: 400,
    valorPendente: 600,
    quantidadeParcelas: 2,
    parcelasPagas: 1,
    situacao: 'PARCIAL',
    parcelas: [
      { id: 'p1', numero: 1, valorPrevisto: 500, dataVencimento: '2026-01-10', jurosMulta: 0, valorRecebido: 500, valorPendente: 0, status: 'PAGA' },
      { id: 'p2', numero: 2, valorPrevisto: 500, dataVencimento: '2026-02-10', jurosMulta: 0, valorRecebido: 0, valorPendente: 500, status: 'ABERTA' },
    ],
  };

  beforeEach(async () => {
    paramMap = { value: 'c1' };

    mockFinanceiro = {
      situacaoFinanceira: vi.fn().mockReturnValue(of(situacao)),
    };

    mockNotification = {
      error: vi.fn(),
    };

    dialogAfterClosed = of(false);
    mockDialog = {
      open: vi.fn().mockImplementation(() => ({ afterClosed: () => dialogAfterClosed })),
    };

    await TestBed.configureTestingModule({
      imports: [ContratoDetalheComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramMap.value } } } },
        { provide: FinanceiroService, useValue: mockFinanceiro },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  function overrideDialog() {
    TestBed.overrideComponent(ContratoDetalheComponent, {
      set: { providers: [{ provide: MatDialog, useValue: mockDialog }] },
    });
  }

  it('should create', () => {
    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load situacao on init with route id', () => {
    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.contratoId).toBe('c1');
    expect(mockFinanceiro.situacaoFinanceira).toHaveBeenCalledWith('c1');
    expect(fixture.componentInstance.situacao()).toEqual(situacao);
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should navigate back to list when no id in route', () => {
    paramMap.value = null;
    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(['/financeiro/contratos']);
    expect(mockFinanceiro.situacaoFinanceira).not.toHaveBeenCalled();
  });

  it('should notify error when loading situacao fails', () => {
    mockFinanceiro.situacaoFinanceira = vi.fn().mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    fixture.detectChanges();

    expect(mockNotification.error).toHaveBeenCalledWith('Erro ao carregar situação financeira');
    expect(fixture.componentInstance.loading()).toBe(false);
  });

  it('should reload situacao when dialog reports registration', () => {
    dialogAfterClosed = of(true);
    overrideDialog();

    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    fixture.detectChanges();

    const callsBefore = (mockFinanceiro.situacaoFinanceira as ReturnType<typeof vi.fn>).mock.calls.length;
    fixture.componentInstance.registrarRecebimento('p2');

    expect(mockDialog.open).toHaveBeenCalledWith(RecebimentoDialogComponent, { width: '480px', data: { parcelaId: 'p2' } });
    expect((mockFinanceiro.situacaoFinanceira as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsBefore + 1);
  });

  it('should not reload situacao when dialog is dismissed', () => {
    dialogAfterClosed = of(false);
    overrideDialog();

    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    fixture.detectChanges();

    const callsBefore = (mockFinanceiro.situacaoFinanceira as ReturnType<typeof vi.fn>).mock.calls.length;
    fixture.componentInstance.registrarRecebimento('p2');

    expect((mockFinanceiro.situacaoFinanceira as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsBefore);
  });

  it('should navigate back on voltar', () => {
    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.voltar();
    expect(spy).toHaveBeenCalledWith(['/financeiro/contratos']);
  });

  it('should map parcela status to label', () => {
    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.statusParcelaLabel('PAGA' as any)).toBe('Paga');
    expect(fixture.componentInstance.statusParcelaLabel('DESCONHECIDO' as any)).toBe('DESCONHECIDO');
  });

  it('should format currency and dates', () => {
    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.formatCurrency(1234.5)).toContain('1.234,50');
    expect(fixture.componentInstance.formatCurrency(null as unknown as number)).toContain('0,00');
    expect(fixture.componentInstance.formatDate('2026-02-10T00:00:00')).toBe('10/02/2026');
    expect(fixture.componentInstance.formatDate('')).toBe('—');
    expect(fixture.componentInstance.formatDate(null as unknown as string)).toBe('—');
  });

  it('should render parcela rows', () => {
    const fixture = TestBed.createComponent(ContratoDetalheComponent);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });
});
