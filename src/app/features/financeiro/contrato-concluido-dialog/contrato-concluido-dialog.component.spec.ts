import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ContratoConcluidoDialogComponent } from './contrato-concluido-dialog.component';
import { Contrato } from '../../../core/models/financeiro/parcela.model';

describe('ContratoConcluidoDialogComponent', () => {
  let dialogRefSpy: any;

  const contrato: Contrato = {
    id: 'c1',
    numeroContrato: '2026-001',
    clienteNome: 'Empresa A',
    modalidade: 'FIXA',
    valorTotal: 1000,
    valorDesconto: 100,
    valorRecebido: 0,
    valorPendente: 900,
    dataFechamento: '2026-03-01',
    status: 'ATIVO',
    documentoNomeArquivo: 'contrato.pdf',
    parcelas: [
      { id: 'p1', numero: 1, valorPrevisto: 450, dataVencimento: '2026-03-10', jurosMulta: 0, valorRecebido: 0, valorPendente: 450, status: 'ABERTA' },
      { id: 'p2', numero: 2, valorPrevisto: 450, dataVencimento: '2026-04-10', jurosMulta: 0, valorRecebido: 0, valorPendente: 450, status: 'ABERTA' },
    ],
  };

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ContratoConcluidoDialogComponent, MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { contrato, cliente: { nome: 'Novo Cliente', cpfCnpj: '123' } } },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContratoConcluidoDialogComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render cliente and contrato data', () => {
    const fixture = TestBed.createComponent(ContratoConcluidoDialogComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Novo Cliente');
    expect(text).toContain('2026-001');
    expect(text).toContain('contrato.pdf');
  });

  it('should format currency in pt-BR', () => {
    const fixture = TestBed.createComponent(ContratoConcluidoDialogComponent);
    expect(fixture.componentInstance.formatCurrency(1234.5)).toContain('1.234,50');
    expect(fixture.componentInstance.formatCurrency(null as unknown as number)).toContain('0,00');
  });

  it('should format dates as dd/mm/yyyy', () => {
    const fixture = TestBed.createComponent(ContratoConcluidoDialogComponent);
    expect(fixture.componentInstance.formatDate('2026-03-10T00:00:00')).toBe('10/03/2026');
    expect(fixture.componentInstance.formatDate('')).toBe('—');
    expect(fixture.componentInstance.formatDate(null as unknown as string)).toBe('—');
  });

  it('should close with verContrato action', () => {
    const fixture = TestBed.createComponent(ContratoConcluidoDialogComponent);
    fixture.componentInstance.verContrato();
    expect(dialogRefSpy.close).toHaveBeenCalledWith('verContrato');
  });

  it('should close without value on fechar', () => {
    const fixture = TestBed.createComponent(ContratoConcluidoDialogComponent);
    fixture.componentInstance.fechar();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should fall back to contrato clienteNome when cliente is missing', () => {
    TestBed.resetTestingModule();
    dialogRefSpy = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ContratoConcluidoDialogComponent, MatDialogModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { contrato } },
      ],
    });

    const fixture = TestBed.createComponent(ContratoConcluidoDialogComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Empresa A');
  });
});
