import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ContratoNovoComponent } from './contrato-novo.component';
import { ContratoConcluidoDialogComponent } from '../contrato-concluido-dialog/contrato-concluido-dialog.component';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DocumentoService } from '../../../core/services/documento.service';
import { Contrato } from '../../../core/models/financeiro/parcela.model';
import { of, throwError } from 'rxjs';

describe('ContratoNovoComponent', () => {
  let mockFinanceiro: Partial<FinanceiroService>;
  let mockNotification: Partial<NotificationService>;
  let mockDocumento: Partial<DocumentoService>;
  let mockDialog: any;
  let dialogAfterClosed: any;
  let paramMap: { value: string | null };

  const contratoRetornado: Contrato = {
    id: 'c1',
    numeroContrato: '2026-001',
    clienteNome: 'Empresa A',
    modalidade: 'FIXA',
    valorTotal: 100,
    valorDesconto: 0,
    valorRecebido: 0,
    valorPendente: 100,
    dataFechamento: '2026-02-10',
    status: 'ATIVO',
    parcelas: [],
  };

  beforeEach(async () => {
    paramMap = { value: null };

    mockFinanceiro = {
      listarClientes: vi.fn().mockReturnValue(of({
        content: [{ id: 'cl1', nome: 'Empresa A', ativo: true, tipo: 'PJ' }],
        totalElements: 1, totalPages: 1, size: 200, number: 0, last: true, first: true, empty: false,
      })),
      fecharContrato: vi.fn().mockReturnValue(of(contratoRetornado)),
      fecharContratoParaProcesso: vi.fn().mockReturnValue(of(contratoRetornado)),
    };

    mockNotification = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    mockDocumento = {
      upload: vi.fn().mockReturnValue(of({ id: 'doc1', nomeArquivo: 'contrato.pdf' })),
    };

    dialogAfterClosed = of(null);
    mockDialog = {
      open: vi.fn().mockImplementation(() => ({ afterClosed: () => dialogAfterClosed })),
    };

    await TestBed.configureTestingModule({
      imports: [ContratoNovoComponent, NoopAnimationsModule],
      providers: [
        provideRouter([
          { path: 'financeiro/contratos', component: ContratoNovoComponent },
          { path: 'financeiro/contratos/:id', component: ContratoNovoComponent },
        ]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => paramMap.value } } } },
        { provide: FinanceiroService, useValue: mockFinanceiro },
        { provide: NotificationService, useValue: mockNotification },
        { provide: DocumentoService, useValue: mockDocumento },
      ],
    }).compileComponents();
  });

  function overrideDialog() {
    TestBed.overrideComponent(ContratoNovoComponent, {
      set: { providers: [{ provide: MatDialog, useValue: mockDialog }] },
    });
  }

  function fillValidForm(comp: ContratoNovoComponent) {
    comp.form.patchValue({
      numeroContrato: '2026-001',
      modalidade: 'FIXA',
      valorTotal: 100,
      valorDesconto: 0,
      dataAssinatura: new Date(2026, 1, 10),
    });
    comp.parcelas.at(0).patchValue({ valor: 100, dataVencimento: new Date(2026, 1, 10) });
  }

  it('should create', () => {
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should read numeroProcesso from route and start with one parcela', () => {
    paramMap.value = '12345';
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    expect(fixture.componentInstance.numeroProcesso).toBe('12345');
    expect(fixture.componentInstance.parcelas.length).toBe(1);
  });

  it('should load clientes on init', () => {
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();

    expect(mockFinanceiro.listarClientes).toHaveBeenCalledWith(0, 200);
    expect(fixture.componentInstance.clientes().length).toBe(1);
    expect(fixture.componentInstance.loadingClientes()).toBe(false);
  });

  it('should notify error when loading clientes fails', () => {
    mockFinanceiro.listarClientes = vi.fn().mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();

    expect(mockNotification.error).toHaveBeenCalledWith('Erro ao carregar clientes');
    expect(fixture.componentInstance.loadingClientes()).toBe(false);
  });

  it('should add and remove parcelas', () => {
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    const comp = fixture.componentInstance;

    expect(comp.parcelas.length).toBe(1);
    comp.addParcela();
    expect(comp.parcelas.length).toBe(2);

    comp.removeParcela(0);
    expect(comp.parcelas.length).toBe(1);

    comp.removeParcela(0);
    expect(comp.parcelas.length).toBe(1);
  });

  it('should compute somaParcelas, valorLiquido and parcelasConferem', () => {
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    const comp = fixture.componentInstance;

    comp.parcelas.at(0).patchValue({ valor: 80 });
    comp.form.patchValue({ valorTotal: 100, valorDesconto: 20 });

    expect(comp.somaParcelas).toBe(80);
    expect(comp.valorLiquido).toBe(80);
    expect(comp.parcelasConferem).toBe(true);

    comp.parcelas.at(0).patchValue({ valor: 70 });
    expect(comp.parcelasConferem).toBe(false);
  });

  it('should warn and not submit invalid form', () => {
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();

    fixture.componentInstance.fechar();

    expect(mockNotification.warn).toHaveBeenCalledWith('Preencha todos os campos obrigatórios');
    expect(mockFinanceiro.fecharContrato).not.toHaveBeenCalled();
  });

  it('should error when parcelas do not match liquid value', () => {
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.form.patchValue({ numeroContrato: '2026-001', valorTotal: 100, valorDesconto: 0 });
    comp.parcelas.at(0).patchValue({ valor: 50, dataVencimento: new Date(2026, 1, 10) });

    comp.fechar();

    expect(mockNotification.error).toHaveBeenCalledWith('A soma das parcelas deve ser igual ao valor líquido (total − desconto)');
    expect(mockFinanceiro.fecharContrato).not.toHaveBeenCalled();
  });

  it('should submit valid contract without processo', () => {
    overrideDialog();
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    fillValidForm(comp);
    comp.fechar();

    expect(mockFinanceiro.fecharContrato).toHaveBeenCalledWith({
      numeroContrato: '2026-001',
      descricao: null,
      modalidade: 'FIXA',
      clienteId: null,
      cliente: null,
      documentoId: null,
      valorTotal: 100,
      valorDesconto: 0,
      dataAssinatura: '2026-02-10',
      parcelas: [{ numero: 1, valor: 100, dataVencimento: '2026-02-10' }],
    });
    expect(mockNotification.success).toHaveBeenCalledWith('Contrato fechado com sucesso!');
    expect(comp.loading()).toBe(false);
  });

  it('should submit valid contract linked to processo', () => {
    paramMap.value = '12345';
    overrideDialog();
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    fillValidForm(comp);
    comp.fechar();

    expect(mockFinanceiro.fecharContratoParaProcesso).toHaveBeenCalledWith('12345', expect.objectContaining({ numeroContrato: '2026-001' }));
    expect(mockFinanceiro.fecharContrato).not.toHaveBeenCalled();
  });

  it('should include novo cliente data when provided', () => {
    overrideDialog();
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    fillValidForm(comp);
    comp.form.patchValue({
      novoCliente: { nome: ' Nova Cliente ', cpfCnpj: '123', email: 'n@n.com', telefone: '999' },
    });

    comp.fechar();

    const dto = (mockFinanceiro.fecharContrato as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(dto.cliente).toEqual({
      nome: 'Nova Cliente',
      cpfCnpj: '123',
      email: 'n@n.com',
      telefone: '999',
      tipo: 'PJ',
    });
  });

  it('should navigate to contract when dialog returns verContrato', () => {
    dialogAfterClosed = of('verContrato');
    overrideDialog();

    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');
    const comp = fixture.componentInstance;

    fillValidForm(comp);
    comp.fechar();

    expect(mockDialog.open).toHaveBeenCalledWith(ContratoConcluidoDialogComponent, {
      width: '520px',
      data: { contrato: contratoRetornado, cliente: undefined },
    });
    expect(spy).toHaveBeenCalledWith(['/financeiro/contratos', 'c1']);
  });

  it('should navigate to contract list when dialog is dismissed', () => {
    overrideDialog();
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');
    const comp = fixture.componentInstance;

    fillValidForm(comp);
    comp.fechar();

    expect(spy).toHaveBeenCalledWith(['/financeiro/contratos']);
  });

  it('should notify backend error message when closing contract fails', () => {
    mockFinanceiro.fecharContrato = vi.fn().mockReturnValue(throwError(() => ({ error: { message: 'Contrato duplicado' } })));

    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    fillValidForm(comp);
    comp.fechar();

    expect(mockNotification.error).toHaveBeenCalledWith('Contrato duplicado');
    expect(comp.loading()).toBe(false);
  });

  it('should use generic message when error has no detail', () => {
    mockFinanceiro.fecharContrato = vi.fn().mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    fillValidForm(comp);
    comp.fechar();

    expect(mockNotification.error).toHaveBeenCalledWith('Erro ao fechar contrato');
  });

  it('should do nothing when no file selected', () => {
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    const comp = fixture.componentInstance;

    comp.escolherDocumento({ target: { files: [] } });
    expect(mockDocumento.upload).not.toHaveBeenCalled();
  });

  it('should do nothing when file selected but no numeroProcesso', () => {
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    const comp = fixture.componentInstance;
    const file = new File(['x'], 'x.pdf', { type: 'application/pdf' });

    comp.escolherDocumento({ target: { files: [file] } });
    expect(mockDocumento.upload).not.toHaveBeenCalled();
  });

  it('should reject non-pdf file', () => {
    paramMap.value = '12345';
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const file = new File(['x'], 'x.txt', { type: 'text/plain' });

    comp.escolherDocumento({ target: { files: [file] } });

    expect(mockNotification.error).toHaveBeenCalledWith('Apenas arquivos PDF são permitidos para o contrato.');
    expect(mockDocumento.upload).not.toHaveBeenCalled();
  });

  it('should attach document on successful upload', () => {
    paramMap.value = '12345';
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const file = new File(['x'], 'contrato.pdf', { type: 'application/pdf' });

    comp.escolherDocumento({ target: { files: [file] } });

    expect(mockDocumento.upload).toHaveBeenCalledWith('12345', file, true);
    expect(comp.documentoSelecionado()).toEqual({ nome: 'contrato.pdf', id: 'doc1' });
    expect(mockNotification.success).toHaveBeenCalledWith('Documento do contrato anexado com sucesso!');
    expect(comp.enviandoDocumento()).toBe(false);
  });

  it('should notify error when document upload fails', () => {
    paramMap.value = '12345';
    mockDocumento.upload = vi.fn().mockReturnValue(throwError(() => ({ error: { message: 'Falha no upload' } })));

    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const file = new File(['x'], 'contrato.pdf', { type: 'application/pdf' });

    comp.escolherDocumento({ target: { files: [file] } });

    expect(mockNotification.error).toHaveBeenCalledWith('Falha no upload');
    expect(comp.enviandoDocumento()).toBe(false);
  });

  it('should navigate back on voltar', () => {
    const fixture = TestBed.createComponent(ContratoNovoComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.voltar();
    expect(spy).toHaveBeenCalledWith(['/financeiro/contratos']);
  });
});
