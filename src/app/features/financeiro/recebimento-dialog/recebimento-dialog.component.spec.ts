import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RecebimentoDialogComponent } from './recebimento-dialog.component';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';

describe('RecebimentoDialogComponent', () => {
  let dialogRefSpy: any;
  let mockFinanceiro: Partial<FinanceiroService>;
  let mockNotification: Partial<NotificationService>;

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };
    mockFinanceiro = {
      registrarRecebimento: vi.fn().mockReturnValue({ subscribe: (o: any) => { o.next({}); return { unsubscribe: vi.fn() }; } }),
    };
    mockNotification = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RecebimentoDialogComponent, MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { parcelaId: 'p2' } },
        { provide: FinanceiroService, useValue: mockFinanceiro },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should enable button when valor is positive', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.componentInstance.valor = 10;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Registrar Recebimento');
    expect(el.textContent).toContain('Registrar');
    expect(el.querySelector('button[disabled]')).toBeFalsy();
  });

  it('should disable button when valor is invalid', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button[disabled]')).toBeTruthy();
  });

  it('should render formas de pagamento options when select is opened', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('mat-select');
    expect(select).toBeTruthy();
    select.click();
    fixture.detectChanges();
    const options = Array.from(document.querySelectorAll('mat-option')).map((o) => o.textContent?.trim());
    expect(options).toContain('PIX');
    expect(options).toContain('Boleto');
    expect(options).toContain('Transferência');
  });

  it('should expose formas de pagamento from labels', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    expect(fixture.componentInstance.formas).toEqual(['PIX', 'BOLETO', 'TRANSFERENCIA', 'CARTAO', 'CHEQUE']);
  });

  it('should not allow save when valor is null or zero', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.componentInstance.valor = null;
    expect(fixture.componentInstance.podeSalvar()).toBe(false);

    fixture.componentInstance.valor = 0;
    expect(fixture.componentInstance.podeSalvar()).toBe(false);

    fixture.componentInstance.valor = -5;
    expect(fixture.componentInstance.podeSalvar()).toBe(false);
  });

  it('should allow save when valor is positive', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.componentInstance.valor = 100;
    expect(fixture.componentInstance.podeSalvar()).toBe(true);
  });

  it('should register recebimento and close with true on success', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.componentInstance.valor = 100;
    fixture.componentInstance.jurosMulta = 5;
    fixture.componentInstance.formaPagamento = 'PIX';
    fixture.componentInstance.dataRecebimento = new Date(2026, 1, 10);

    fixture.componentInstance.onConfirm();

    expect(mockFinanceiro.registrarRecebimento).toHaveBeenCalledWith({
      parcelaId: 'p2',
      valorRecebido: 100,
      jurosMulta: 5,
      formaPagamento: 'PIX',
      dataRecebimento: '2026-02-10',
    });
    expect(mockNotification.success).toHaveBeenCalledWith('Recebimento registrado com sucesso!');
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
    expect(fixture.componentInstance.salvando).toBe(false);
  });

  it('should not register when valor is invalid', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.componentInstance.valor = null;

    fixture.componentInstance.onConfirm();

    expect(mockFinanceiro.registrarRecebimento).not.toHaveBeenCalled();
  });

  it('should send empty date when dataRecebimento is null', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.componentInstance.valor = 50;
    fixture.componentInstance.dataRecebimento = null as any;

    fixture.componentInstance.onConfirm();

    expect(mockFinanceiro.registrarRecebimento).toHaveBeenCalledWith(
      expect.objectContaining({ dataRecebimento: '' }),
    );
    expect(mockNotification.success).toHaveBeenCalled();
  });

  it('should notify backend error message on failure', () => {
    mockFinanceiro.registrarRecebimento = vi.fn().mockReturnValue({
      subscribe: (o: any) => { o.error({ error: { message: 'Parcela já paga' } }); return { unsubscribe: vi.fn() }; },
    });

    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.componentInstance.valor = 100;

    fixture.componentInstance.onConfirm();

    expect(mockNotification.error).toHaveBeenCalledWith('Parcela já paga');
    expect(fixture.componentInstance.salvando).toBe(false);
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should use generic message when error has no detail', () => {
    mockFinanceiro.registrarRecebimento = vi.fn().mockReturnValue({
      subscribe: (o: any) => { o.error(new Error('fail')); return { unsubscribe: vi.fn() }; },
    });

    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.componentInstance.valor = 100;

    fixture.componentInstance.onConfirm();

    expect(mockNotification.error).toHaveBeenCalledWith('Erro ao registrar recebimento');
  });

  it('should close with false on cancel', () => {
    const fixture = TestBed.createComponent(RecebimentoDialogComponent);
    fixture.componentInstance.onCancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });
});
