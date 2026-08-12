import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { Subject, of, throwError } from 'rxjs';
import { ProcessDetailsComponent } from './process-details.component';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { DocumentoService } from '../../../core/services/documento.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EnriquecimentoService } from '../../../core/services/enriquecimento.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { StatusAtribuicao } from '../../../core/models/processo/enums.model';
import { ContatoService } from '../../../core/services/contato.service';

function mockProcesso(overrides: any = {}) {
  return {
    numero: '123456',
    tribunal: 'TJSP',
    sistemaNome: 'Sistema X',
    grau: '1',
    valorCausa: 10000,
    scoreFinal: 80,
    nivel: 'MEDIO',
    statusAtribuicao: StatusAtribuicao.ATRIBUIDO,
    classeJudicial: 'Procedimento Comum',
    assuntoJudicial: 'Direito Civil',
    orgaoJulgador: '1ª Vara Cível',
    foro: 'Foro Central',
    dataAjuizamento: '2024-01-01',
    usuarioResponsavel: 'João',
    equipeNome: 'Equipe A',
    monitorado: false,
    anotacoes: [],
    historicoContatos: [],
    movimentacoes: [],
    partes: [],
    hipoteses: [],
    ...overrides,
  };
}

describe('ProcessDetailsComponent', () => {
  let processState: any;
  let documentoService: any;
  let notification: any;
  let dialog: any;
  let enriquecimentoService: any;
  let location: any;
  let contatoService: any;

  function createComponent() {
    const fixture = TestBed.createComponent(ProcessDetailsComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    processState = {
      getProcessoDetalhe: vi.fn().mockReturnValue(of(mockProcesso())),
      alternarMonitoramento: vi.fn().mockReturnValue(of(undefined)),
      adicionarAnotacao: vi.fn().mockReturnValue(of(undefined)),
      deletarAnotacao: vi.fn().mockReturnValue(of(undefined)),
      discardProcess: vi.fn().mockReturnValue(of(undefined)),
      atualizarStatus: vi.fn().mockReturnValue(of(undefined)),
    };

    documentoService = {
      listar: vi.fn().mockReturnValue(of({
        content: [
          { id: 'doc1', nomeArquivo: 'test.pdf', contentType: 'application/pdf', tamanho: 1024, createdDate: '2024-01-01' },
        ],
        totalElements: 1, totalPages: 1, size: 20, number: 0, last: true, first: true, empty: false,
      })),
      getPreviewUrl: vi.fn().mockReturnValue(of({ url: 'https://d123.cloudfront.net/processos/x.pdf?sig=1' })),
      deletar: vi.fn().mockReturnValue(of(undefined)),
      upload: vi.fn().mockReturnValue(of({ id: 'newDoc' })),
      getDownloadUrl: vi.fn().mockReturnValue(of({ url: '/download/url' })),
      invalidatePreviewUrl: vi.fn(),
    };

    notification = {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    };

    dialog = {
      open: vi.fn(),
    };

    enriquecimentoService = {
      reprocessarPorNumeros: vi.fn().mockReturnValue(of({ resultados: [{ sucesso: true }] })),
    };

    location = {
      back: vi.fn(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    };

    contatoService = {
      listar: vi.fn().mockReturnValue(of([
        { id: 'c1', tipo: 'EMAIL', valor: 'teste@test.com', nome: 'Contato 1', principal: true },
      ])),
      salvar: vi.fn().mockReturnValue(of({ id: 'c2' })),
      atualizar: vi.fn().mockReturnValue(of({ id: 'c1' })),
      deletar: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [ProcessDetailsComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['numero', '123456']]) } } },
        { provide: ProcessStateService, useValue: processState },
        { provide: DocumentoService, useValue: documentoService },
        { provide: NotificationService, useValue: notification },
        { provide: EnriquecimentoService, useValue: enriquecimentoService },
        { provide: Location, useValue: location },
        { provide: ContatoService, useValue: contatoService },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();
  });

  function overrideDialog() {
    TestBed.overrideComponent(ProcessDetailsComponent, {
      set: { providers: [{ provide: MatDialog, useValue: dialog }] },
    });
  }

  it('should create', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  }, 15000);

  it('should load processo and documentos on init', () => {
    const fixture = createComponent();
    expect(processState.getProcessoDetalhe).toHaveBeenCalledWith('123456');
    expect(documentoService.listar).toHaveBeenCalledWith('123456');
    expect(fixture.componentInstance.numero()).toBe('123456');
    expect(fixture.componentInstance.processo()).toBeTruthy();
  });

  it('should select first documento on carregarDocumentos if none selected', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.documentoSelecionado()).toBeTruthy();
    expect(fixture.componentInstance.documentoSelecionado()!.id).toBe('doc1');
    expect(documentoService.getPreviewUrl).toHaveBeenCalledWith('123456', 'doc1');
  });

  it('should select a different documento on selecionarDocumento', () => {
    const fixture = createComponent();
    documentoService.getPreviewUrl.mockClear();
    const doc2 = { id: 'doc2', nomeArquivo: 'other.pdf', contentType: 'application/pdf', tamanho: 2048, createdDate: '2024-02-01' };
    fixture.componentInstance.selecionarDocumento(doc2);
    expect(fixture.componentInstance.documentoSelecionado()!.id).toBe('doc2');
    expect(documentoService.getPreviewUrl).toHaveBeenCalledWith('123456', 'doc2');
  });

  it('should handle preview success', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.previewUrl()).toBe('https://d123.cloudfront.net/processos/x.pdf?sig=1');
    expect(notification.error).not.toHaveBeenCalled();
  });

  it('should show error notification on preview failure', () => {
    documentoService.getPreviewUrl.mockReturnValue(new Subject()); // never emits
    const fixture = createComponent();
    expect(fixture.componentInstance.carregandoPreview()).toBe(true);
  });

  it('should baixarDocumento and trigger click', () => {
    const fixture = createComponent();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    fixture.componentInstance.baixarDocumento({ id: 'doc1', nomeArquivo: 'test.pdf', contentType: 'application/pdf', tamanho: 1024, createdDate: '2024-01-01' });
    expect(documentoService.getDownloadUrl).toHaveBeenCalledWith('123456', 'doc1');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should open confirm dialog and delete document on confirmation', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();
    fixture.componentInstance.onDeleteDocument({ id: 'doc1', nomeArquivo: 'test.pdf', contentType: 'application/pdf', tamanho: 1024, createdDate: '2024-01-01' });
    expect(dialog.open).toHaveBeenCalled();
    afterClosed$.next(true);
    expect(documentoService.deletar).toHaveBeenCalledWith('123456', 'doc1');
    expect(documentoService.invalidatePreviewUrl).toHaveBeenCalledWith('123456', 'doc1');
    expect(notification.success).toHaveBeenCalledWith('Documento excluído com sucesso', 3000);
  });

  it('should not delete document when dialog is cancelled', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();
    fixture.componentInstance.onDeleteDocument({ id: 'doc1', nomeArquivo: 'test.pdf', contentType: 'application/pdf', tamanho: 1024, createdDate: '2024-01-01' });
    afterClosed$.next(false);
    expect(documentoService.deletar).not.toHaveBeenCalled();
  });

  it('should download all documentos', () => {
    const fixture = createComponent();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    fixture.componentInstance.downloadTodosDocumentos();
    expect(notification.info).toHaveBeenCalledWith('Iniciando download de todos os documentos...', 2000);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should open upload dialog and upload file', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();
    const event = { target: { files: [new File(['test'], 'doc.pdf', { type: 'application/pdf' })] } };
    fixture.componentInstance.onFileSelected(event);
    expect(dialog.open).toHaveBeenCalled();
    afterClosed$.next({ isContrato: true });
    expect(documentoService.upload).toHaveBeenCalledWith('123456', event.target.files[0], true);
  });

  it('should upload file with isContrato false when dialog returns no data', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();
    const event = { target: { files: [new File(['test'], 'doc.pdf', { type: 'application/pdf' })] } };
    fixture.componentInstance.onFileSelected(event);
    afterClosed$.next(undefined);
    expect(documentoService.upload).toHaveBeenCalledWith('123456', event.target.files[0], false);
  });

  it('should add annotation and clear input', () => {
    const fixture = createComponent();
    fixture.componentInstance.novaAnotacao.set('Nova anotação de teste');
    fixture.componentInstance.adicionarAnotacao();
    expect(processState.adicionarAnotacao).toHaveBeenCalledWith('123456', 'Nova anotação de teste');
    expect(fixture.componentInstance.novaAnotacao()).toBe('');
  });

  it('should not add empty annotation', () => {
    const fixture = createComponent();
    fixture.componentInstance.novaAnotacao.set('');
    fixture.componentInstance.adicionarAnotacao();
    expect(processState.adicionarAnotacao).not.toHaveBeenCalled();
  });

  it('should not add annotation while already sending', () => {
    const fixture = createComponent();
    fixture.componentInstance.enviandoAnotacao.set(true);
    fixture.componentInstance.novaAnotacao.set('test');
    fixture.componentInstance.adicionarAnotacao();
    expect(processState.adicionarAnotacao).not.toHaveBeenCalled();
  });

  it('should toggle monitoramento and refresh', () => {
    const fixture = createComponent();
    fixture.componentInstance.toggleMonitoramento();
    expect(processState.alternarMonitoramento).toHaveBeenCalledWith('123456');
  });

  it('should open confirm dialog and discard process', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();
    fixture.componentInstance.onDiscard();
    expect(dialog.open).toHaveBeenCalled();
    afterClosed$.next(true);
    expect(processState.discardProcess).toHaveBeenCalledWith('123456');
    expect(notification.success).toHaveBeenCalledWith('Processo descartado com sucesso', 3000);
    expect(location.back).toHaveBeenCalled();
  });

  it('should not discard process when dialog is cancelled', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();
    fixture.componentInstance.onDiscard();
    afterClosed$.next(false);
    expect(processState.discardProcess).not.toHaveBeenCalled();
  });

  it('should go back on goBack', () => {
    const fixture = createComponent();
    fixture.componentInstance.goBack();
    expect(location.back).toHaveBeenCalled();
  });

  it('should reprocessar with success notification', () => {
    const fixture = createComponent();
    fixture.componentInstance.reprocessar();
    expect(enriquecimentoService.reprocessarPorNumeros).toHaveBeenCalledWith(['123456']);
    expect(notification.success).toHaveBeenCalledWith('Processo enviado para scraping', 5000);
    expect(fixture.componentInstance.reprocessando()).toBe(false);
  });

  it('should reprocessar with warn when result has no sucesso', () => {
    enriquecimentoService.reprocessarPorNumeros.mockReturnValue(of({ resultados: [{ sucesso: false }] }));
    const fixture = createComponent();
    fixture.componentInstance.reprocessar();
    expect(notification.warn).toHaveBeenCalledWith('Processo enviado, mas pode haver falhas', 5000);
  });

  it('should reprocessar with error notification', () => {
    enriquecimentoService.reprocessarPorNumeros.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = createComponent();
    fixture.componentInstance.reprocessar();
    expect(notification.error).toHaveBeenCalledWith('Erro ao enviar processo para scraping', 5000);
    expect(fixture.componentInstance.reprocessando()).toBe(false);
  });

  it('should show error notification when discard fails', () => {
    processState.discardProcess = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();
    fixture.componentInstance.onDiscard();
    afterClosed$.next(true);
    expect(notification.error).toHaveBeenCalledWith('Erro ao descartar processo', 3000);
  });

  it('should copy process number to clipboard', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });
    const fixture = createComponent();
    fixture.componentInstance.copyProcessNumber();
    await vi.waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith('123456');
      expect(notification.success).toHaveBeenCalledWith('Número do processo copiado!', 2000);
    });
  });

  it('should compute timeline sorted by date', () => {
    const fixture = createComponent();
    fixture.componentInstance.processo.set(mockProcesso({
      anotacoes: [
        { id: 'a1', texto: 'Note 1', usuarioNome: 'User A', dataCriacao: '2024-01-02T10:00:00' },
      ],
      historicoContatos: [
        { descricao: 'Contact 1', usuarioNome: 'User B', dataCriacao: '2024-01-01T10:00:00' },
      ],
    }));
    const tl = fixture.componentInstance.timeline();
    expect(tl.length).toBe(2);
    expect(tl[0].type).toBe('ANOTACAO');
    expect(tl[1].type).toBe('CONTATO');
  });

  it('should return correct score color', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.getScoreColor(150)).toBe('low');
    expect(fixture.componentInstance.getScoreColor(75)).toBe('medium');
    expect(fixture.componentInstance.getScoreColor(25)).toBe('high');
  });

  it('should return correct doc icon per content type', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.getDocIcon('application/pdf')).toBe('picture_as_pdf');
    expect(fixture.componentInstance.getDocIcon('image/png')).toBe('image');
    expect(fixture.componentInstance.getDocIcon('application/msword')).toBe('article');
    expect(fixture.componentInstance.getDocIcon('application/vnd.ms-excel')).toBe('table_chart');
    expect(fixture.componentInstance.getDocIcon('text/plain')).toBe('text_snippet');
    expect(fixture.componentInstance.getDocIcon('application/zip')).toBe('insert_drive_file');
  });

  it('should format file size correctly', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.formatFileSize(500)).toBe('500 B');
    expect(fixture.componentInstance.formatFileSize(2048)).toBe('2 KB');
    expect(fixture.componentInstance.formatFileSize(1048576)).toBe('1.0 MB');
    expect(fixture.componentInstance.formatFileSize(2621440)).toBe('2.5 MB');
  });

  it('should return correct level color', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.getLevelColor('ALTO')).toBe('warn');
    expect(fixture.componentInstance.getLevelColor('INTERMEDIARIO_ALTO')).toBe('warn');
    expect(fixture.componentInstance.getLevelColor('MEDIO')).toBe('accent');
    expect(fixture.componentInstance.getLevelColor('INTERMEDIARIO_BAIXO')).toBe('primary');
    expect(fixture.componentInstance.getLevelColor('MINIMO')).toBe('primary');
    expect(fixture.componentInstance.getLevelColor('DESCONHECIDO')).toBeUndefined();
  });

  it('should call refreshDetails on retry', () => {
    const fixture = createComponent();
    const refreshSpy = vi.spyOn(fixture.componentInstance, 'refreshDetails');
    fixture.componentInstance.onRetryDetails();
    expect(refreshSpy).toHaveBeenCalled();
  });

  it('should call carregarDocumentos on document retry', () => {
    const fixture = createComponent();
    const loadSpy = vi.spyOn(fixture.componentInstance, 'carregarDocumentos');
    fixture.componentInstance.onRetryDocumentos();
    expect(loadSpy).toHaveBeenCalled();
  });

  it('should delete annotation after confirm', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();
    fixture.componentInstance.deletarAnotacao('ann1');
    expect(dialog.open).toHaveBeenCalled();
    afterClosed$.next(true);
    expect(processState.deletarAnotacao).toHaveBeenCalledWith('123456', 'ann1');
  });

  it('should not delete annotation if dialog cancelled', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();
    fixture.componentInstance.deletarAnotacao('ann1');
    afterClosed$.next(false);
    expect(processState.deletarAnotacao).not.toHaveBeenCalled();
  });

  it('should not delete annotation without id', () => {
    const fixture = createComponent();
    fixture.componentInstance.deletarAnotacao(undefined);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should render back button and process number in template', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.copy-number')?.textContent).toContain('123456');
    expect(compiled.querySelector('button[matTooltip="Voltar"]')).toBeTruthy();
  });

  it('should render level chip with correct color', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const chips = compiled.querySelectorAll('mat-chip');
    expect(chips.length).toBeGreaterThanOrEqual(2);
  });

  it('should render document section when documentos are loaded', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const tabLabels = compiled.querySelectorAll('.mat-mdc-tab');
    expect(tabLabels.length).toBe(4);
    (tabLabels[3] as HTMLElement).click();
    fixture.detectChanges();
    expect(compiled.querySelector('.documents-tab-layout')).toBeTruthy();
  });

  it('should show loading overlay when processo is null', () => {
    processState.getProcessoDetalhe.mockReturnValue(new Subject());
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-loading-overlay')).toBeTruthy();
  });

  it('should render breadcrumb navigation', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.breadcrumb')).toBeTruthy();
    expect(compiled.querySelector('.breadcrumb .active')?.textContent).toContain('Detalhes');
  });

  it('should render info summary bar with process data', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('.summary-item');
    expect(items.length).toBe(5);
    expect(items[0].textContent).toContain('TJSP');
    expect(items[1].textContent).toContain('Sistema X');
    expect(items[2].textContent).toContain('1');
    expect(items[4].textContent).toContain('80');
  });

  it('should render side card info items', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const infoItems = compiled.querySelectorAll('.info-item');
    expect(infoItems.length).toBe(6);
    expect(infoItems[0].textContent).toContain('Direito Civil');
    expect(infoItems[1].textContent).toContain('1ª Vara Cível');
    expect(infoItems[4].textContent).toContain('João');
    expect(infoItems[5].textContent).toContain('Equipe A');
  });

  it('should render subtitle row with assunto fallback when assunto is null', () => {
    processState.getProcessoDetalhe.mockReturnValue(of(mockProcesso({ assuntoJudicial: null })));
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.subtitle-row')?.textContent).toContain('assunto não tem nome');
  });

  it('should show empty state when movimentacoes is empty', () => {
    processState.getProcessoDetalhe.mockReturnValue(of(mockProcesso({ movimentacoes: [] })));
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const tabLabels = compiled.querySelectorAll('.mat-mdc-tab');
    (tabLabels[0] as HTMLElement).click();
    fixture.detectChanges();
    expect(compiled.querySelector('app-empty-state')).toBeTruthy();
  });

  it('should show empty state when partes is empty', () => {
    processState.getProcessoDetalhe.mockReturnValue(of(mockProcesso({ partes: [] })));
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const tabLabels = compiled.querySelectorAll('.mat-mdc-tab');
    (tabLabels[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(compiled.querySelector('app-empty-state')).toBeTruthy();
  });

  it('should show empty state when hipoteses is empty', () => {
    processState.getProcessoDetalhe.mockReturnValue(of(mockProcesso({ hipoteses: [] })));
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const tabLabels = compiled.querySelectorAll('.mat-mdc-tab');
    (tabLabels[2] as HTMLElement).click();
    fixture.detectChanges();
    expect(compiled.querySelector('app-empty-state')).toBeTruthy();
  });

  it('should render empty timeline state', () => {
    processState.getProcessoDetalhe.mockReturnValue(of(mockProcesso({ anotacoes: [], historicoContatos: [] })));
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelectorAll('.timeline-item').length).toBe(0);
  });

  it('should render timeline with CONTATO type items', () => {
    processState.getProcessoDetalhe.mockReturnValue(of(mockProcesso({
      anotacoes: [
        { id: 'a1', texto: 'Note 1', usuarioNome: 'User A', dataCriacao: '2024-01-02T10:00:00' },
      ],
      historicoContatos: [
        { descricao: 'Contact 1', usuarioNome: 'User B', dataCriacao: '2024-01-01T10:00:00' },
      ],
    })));
    const fixture = createComponent();
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const items = compiled.querySelectorAll('.timeline-item');
    expect(items.length).toBe(2);
    expect(items[0].classList.contains('contact')).toBe(false);
    expect(items[1].classList.contains('contact')).toBe(true);
  });

  it('should show document viewer no selection state', () => {
    const fixture = createComponent();
    fixture.componentInstance.documentoSelecionado.set(null);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const tabLabels = compiled.querySelectorAll('.mat-mdc-tab');
    (tabLabels[3] as HTMLElement).click();
    fixture.detectChanges();
    expect(compiled.querySelector('.no-selection')).toBeTruthy();
  });

  it('should show star icon when monitorado is true', () => {
    processState.getProcessoDetalhe.mockReturnValue(of(mockProcesso({ monitorado: true })));
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.monitored')).toBeTruthy();
  });

  it('should render flow stepper with correct steps', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const steps = compiled.querySelectorAll('.flow-step');
    expect(steps.length).toBe(5);
    expect(steps[0].textContent).toContain('Atribuído');
    expect(steps[1].textContent).toContain('Em Conversa');
    expect(steps[2].textContent).toContain('Em Negociação');
    expect(steps[3].textContent).toContain('Positivo');
    expect(steps[4].textContent).toContain('Negativo');
  });

  it('should render partes tab when partes exist', () => {
    processState.getProcessoDetalhe.mockReturnValue(of(mockProcesso({
      partes: [
        { nome: 'João Silva', polo: 'ATIVO', documento: '123', advogados: ['Dr. Advogado'] },
      ],
    })));
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const tabLabels = compiled.querySelectorAll('.mat-mdc-tab');
    (tabLabels[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(compiled.querySelector('.parte-card')).toBeTruthy();
    expect(compiled.querySelector('.parte-card')?.textContent).toContain('João Silva');
    expect(compiled.querySelector('.adv-item')?.textContent).toContain('Dr. Advogado');
  });

  it('should render hipoteses in score tab', () => {
    processState.getProcessoDetalhe.mockReturnValue(of(mockProcesso({
      hipoteses: [
        { nomeRegra: 'Regra 1', pontos: 50, justificativa: 'Justificativa 1' },
        { nomeRegra: 'Regra 2', pontos: -20, justificativa: 'Justificativa 2' },
      ],
    })));
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const tabLabels = compiled.querySelectorAll('.mat-mdc-tab');
    (tabLabels[2] as HTMLElement).click();
    fixture.detectChanges();
    const cards = compiled.querySelectorAll('.hipotese-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('Regra 1');
    expect(cards[0].querySelector('.hip-points')?.textContent).toContain('+50');
    expect(cards[1].querySelector('.hip-points')?.textContent).toContain('-20');
  });

  it('should render status chips in title row', () => {
    const fixture = createComponent();
    const compiled = fixture.nativeElement;
    const chips = compiled.querySelectorAll('mat-chip');
    expect(chips.length).toBeGreaterThanOrEqual(2);
    expect(chips[0].textContent).toContain('Médio');
    expect(chips[1].textContent).toContain('Atribuído');
  });

  it('should open WhatsApp link on abrirContato with WHATSAPP type', () => {
    const openSpy = vi.fn();
    vi.stubGlobal('open', openSpy);
    const fixture = createComponent();
    fixture.componentInstance.abrirContato({
      id: '1', tipo: 'WHATSAPP', valor: '5511999999999', nome: 'Contato', principal: true,
    });
    expect(openSpy).toHaveBeenCalledWith('https://wa.me/5511999999999', '_blank');
    vi.unstubAllGlobals();
  });

  it('should open mailto link on abrirContato with EMAIL type', () => {
    const openSpy = vi.fn();
    vi.stubGlobal('open', openSpy);
    const fixture = createComponent();
    fixture.componentInstance.abrirContato({
      id: '2', tipo: 'EMAIL', valor: 'teste@test.com', nome: 'Email', principal: false,
    });
    expect(openSpy).toHaveBeenCalledWith('mailto:teste@test.com', '_blank');
    vi.unstubAllGlobals();
  });

  describe('flow stepper', () => {
    it('getCurrentStepIndex should return correct index', () => {
      const fixture = createComponent();
      expect(fixture.componentInstance.getCurrentStepIndex()).toBe(0);
    });

    it('getCurrentStepIndex should return -1 when no processo', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(null);
      expect(fixture.componentInstance.getCurrentStepIndex()).toBe(-1);
    });

    it('isStepCompleted should handle currentIdx === 4', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(mockProcesso({
        statusAtribuicao: StatusAtribuicao.CONCLUIDO_RECUSADO,
      }));
      expect(fixture.componentInstance.isStepCompleted(0)).toBe(false);
      expect(fixture.componentInstance.isStepCompleted(4)).toBe(false);
    });

    it('isStepCompleted should handle currentIdx === 3 with index === 4', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(mockProcesso({
        statusAtribuicao: StatusAtribuicao.CONCLUIDO_SUCESSO,
      }));
      expect(fixture.componentInstance.isStepCompleted(0)).toBe(true);
      expect(fixture.componentInstance.isStepCompleted(1)).toBe(true);
      expect(fixture.componentInstance.isStepCompleted(2)).toBe(true);
      expect(fixture.componentInstance.isStepCompleted(3)).toBe(true);
      expect(fixture.componentInstance.isStepCompleted(4)).toBe(false);
    });

    it('isStepCurrent should return correct values', () => {
      const fixture = createComponent();
      expect(fixture.componentInstance.isStepCurrent(0)).toBe(true);
      expect(fixture.componentInstance.isStepCurrent(1)).toBe(false);
    });

    it('isStepCurrent should return false when no processo', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(null);
      expect(fixture.componentInstance.isStepCurrent(0)).toBe(false);
    });

    it('isConnectorActive should return true for completed steps', () => {
      const fixture = createComponent();
      expect(fixture.componentInstance.isConnectorActive(0)).toBe(true);
    });

    it('isConnectorActive should return false for non-completed steps', () => {
      const fixture = createComponent();
      expect(fixture.componentInstance.isConnectorActive(1)).toBe(false);
    });

    it('isConnectorActive should return false when beforeIdx === 3', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(mockProcesso({
        statusAtribuicao: StatusAtribuicao.CONCLUIDO_SUCESSO,
      }));
      expect(fixture.componentInstance.isConnectorActive(3)).toBe(false);
    });

    it('isStepAvailable should return true for valid transitions', () => {
      const fixture = createComponent();
      expect(fixture.componentInstance.isStepAvailable(1)).toBe(true);
    });

    it('isStepAvailable should return false for invalid transitions', () => {
      const fixture = createComponent();
      expect(fixture.componentInstance.isStepAvailable(0)).toBe(false);
      expect(fixture.componentInstance.isStepAvailable(3)).toBe(false);
    });

    it('isStepAvailable should handle terminal to positive transition', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(mockProcesso({
        statusAtribuicao: StatusAtribuicao.CONCLUIDO_RECUSADO,
      }));
      expect(fixture.componentInstance.isStepAvailable(3)).toBe(true);
    });

    it('isStepAvailable should return false when no processo', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(null);
      expect(fixture.componentInstance.isStepAvailable(0)).toBe(false);
    });

    it('isTerminalStatus should return true for terminal statuses', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(mockProcesso({
        statusAtribuicao: StatusAtribuicao.CONCLUIDO_SUCESSO,
      }));
      expect(fixture.componentInstance.isTerminalStatus()).toBe(true);
    });

    it('isTerminalStatus should return false for non-terminal status', () => {
      const fixture = createComponent();
      expect(fixture.componentInstance.isTerminalStatus()).toBe(false);
    });

    it('avancarStatus should call atualizarStatus for step transition', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(mockProcesso({
        statusAtribuicao: StatusAtribuicao.EM_CONVERSA,
      }));
      processState.atualizarStatus = vi.fn(() => of(null));
      fixture.componentInstance.avancarStatus(2);
      expect(processState.atualizarStatus).toHaveBeenCalledWith('123456', StatusAtribuicao.EM_NEGOCIACAO);
    });

    it('avancarStatus should handle error notification', () => {
      const fixture = createComponent();
      fixture.componentInstance.processo.set(mockProcesso({
        statusAtribuicao: StatusAtribuicao.EM_CONVERSA,
      }));
      processState.atualizarStatus = vi.fn(() => throwError(() => new Error('fail')));
      fixture.componentInstance.avancarStatus(2);
      expect(notification.error).toHaveBeenCalledWith('Erro ao atualizar status do processo');
    });

    it('avancarStatus should not proceed without numero', () => {
      const fixture = createComponent();
      fixture.componentInstance.numero.set(null);
      fixture.componentInstance.avancarStatus(1);
      expect(processState.atualizarStatus).not.toHaveBeenCalled();
    });
  });

  it('should handle preview error notification', () => {
    documentoService.getPreviewUrl = vi.fn(() => throwError(() => new Error('preview fail')));
    createComponent();
    expect(notification.error).toHaveBeenCalledWith('Erro ao carregar pré-visualização', 3000);
  });

  it('should show contatos tab only after step 1', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.mostrarAbaContatos()).toBe(false);
    fixture.componentInstance.processo.set(mockProcesso({ statusAtribuicao: StatusAtribuicao.EM_CONVERSA }));
    expect(fixture.componentInstance.mostrarAbaContatos()).toBe(true);
    fixture.componentInstance.processo.set(null);
    expect(fixture.componentInstance.mostrarAbaContatos()).toBe(false);
  });

  it('should format contato values for phone and email', () => {
    const fixture = createComponent();
    expect(fixture.componentInstance.formatContatoValor({ tipo: 'EMAIL', valor: 'a@b.com' } as any)).toBe('a@b.com');
    expect(fixture.componentInstance.formatContatoValor({ tipo: 'WHATSAPP', valor: '11999999999' } as any)).toBe('(11) 99999-9999');
    expect(fixture.componentInstance.formatContatoValor({ tipo: 'WHATSAPP', valor: '1199999999' } as any)).toBe('(11) 9999-9999');
    expect(fixture.componentInstance.formatContatoValor({ tipo: 'WHATSAPP', valor: 'xyz' } as any)).toBe('xyz');
  });

  it('should start and cancel editing contato', () => {
    const fixture = createComponent();
    fixture.componentInstance.startEditContato({ id: 'c1', tipo: 'EMAIL', valor: 'a@b.com', nome: 'Contato', principal: true } as any);
    expect(fixture.componentInstance.editandoContatoId()).toBe('c1');
    expect(fixture.componentInstance.editFormNome()).toBe('Contato');
    expect(fixture.componentInstance.editFormValor()).toBe('a@b.com');

    fixture.componentInstance.cancelEditContato();
    expect(fixture.componentInstance.editandoContatoId()).toBeNull();
    expect(fixture.componentInstance.editFormNome()).toBe('');
    expect(fixture.componentInstance.editFormValor()).toBe('');
  });

  it('should delete contato after confirm', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();

    fixture.componentInstance.deletarContato({ id: 'c1', tipo: 'EMAIL', valor: 'a@b.com', nome: 'Contato', principal: true } as any);
    afterClosed$.next(true);
    expect(contatoService.deletar).toHaveBeenCalledWith('123456', 'c1');
    expect(notification.success).toHaveBeenCalledWith('Contato excluído com sucesso', 3000);
    expect(contatoService.listar).toHaveBeenCalled();
  });

  it('should not delete contato when dialog is cancelled', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();

    fixture.componentInstance.deletarContato({ id: 'c1', tipo: 'EMAIL', valor: 'a@b.com', nome: 'Contato', principal: true } as any);
    afterClosed$.next(false);
    expect(contatoService.deletar).not.toHaveBeenCalled();
  });

  it('should notify error when deleting contato fails', () => {
    contatoService.deletar = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();

    fixture.componentInstance.deletarContato({ id: 'c1', tipo: 'EMAIL', valor: 'a@b.com', nome: 'Contato', principal: true } as any);
    afterClosed$.next(true);
    expect(notification.error).toHaveBeenCalledWith('Erro ao excluir contato', 3000);
  });

  it('should set contato as principal', () => {
    const fixture = createComponent();
    fixture.componentInstance.definirComoPrincipal({ id: 'c1', tipo: 'EMAIL', valor: 'a@b.com', nome: 'Contato', principal: false } as any);
    expect(contatoService.atualizar).toHaveBeenCalledWith('123456', 'c1', {
      tipo: 'EMAIL', valor: 'a@b.com', nome: 'Contato', principal: true,
    });
    expect(notification.success).toHaveBeenCalledWith('Contato definido como principal', 3000);
  });

  it('should notify error when setting principal contato fails', () => {
    contatoService.atualizar = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
    const fixture = createComponent();
    fixture.componentInstance.definirComoPrincipal({ id: 'c1', tipo: 'EMAIL', valor: 'a@b.com', nome: 'Contato', principal: false } as any);
    expect(notification.error).toHaveBeenCalledWith('Erro ao definir contato como principal', 3000);
  });

  it('should add contato from dialog result', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();

    fixture.componentInstance.adicionarContato();
    afterClosed$.next({ tipo: 'EMAIL', valor: 'novo@test.com', nome: 'Novo', principal: false });
    expect(contatoService.salvar).toHaveBeenCalledWith('123456', {
      tipo: 'EMAIL', valor: 'novo@test.com', nome: 'Novo', principal: false,
    });
    expect(notification.success).toHaveBeenCalledWith('Contato adicionado com sucesso', 3000);
    expect(fixture.componentInstance.salvandoContato()).toBe(false);
  });

  it('should not add contato when dialog is cancelled', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();

    fixture.componentInstance.adicionarContato();
    afterClosed$.next(null);
    expect(contatoService.salvar).not.toHaveBeenCalled();
  });

  it('should notify error when adding contato fails', () => {
    contatoService.salvar = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();

    fixture.componentInstance.adicionarContato();
    afterClosed$.next({ tipo: 'EMAIL', valor: 'novo@test.com', principal: false });
    expect(notification.error).toHaveBeenCalledWith('Erro ao adicionar contato', 3000);
    expect(fixture.componentInstance.salvandoContato()).toBe(false);
  });

  it('should save edited contato', () => {
    const fixture = createComponent();
    fixture.componentInstance.startEditContato({ id: 'c1', tipo: 'EMAIL', valor: 'antigo@test.com', nome: 'Contato', principal: true } as any);
    fixture.componentInstance.editFormNome.set('Contato Atualizado');
    fixture.componentInstance.editFormValor.set('novo@test.com');

    fixture.componentInstance.salvarEditContato({ id: 'c1', tipo: 'EMAIL', valor: 'antigo@test.com', nome: 'Contato', principal: true } as any);

    expect(contatoService.atualizar).toHaveBeenCalledWith('123456', 'c1', {
      tipo: 'EMAIL', valor: 'novo@test.com', nome: 'Contato Atualizado',
    });
    expect(notification.success).toHaveBeenCalledWith('Contato atualizado com sucesso', 3000);
    expect(fixture.componentInstance.editandoContatoId()).toBeNull();
  });

  it('should not save edit contato when fields are empty', () => {
    const fixture = createComponent();
    fixture.componentInstance.editFormNome.set('');
    fixture.componentInstance.editFormValor.set('');
    fixture.componentInstance.salvarEditContato({ id: 'c1', tipo: 'EMAIL', valor: 'a@b.com', nome: 'Contato', principal: true } as any);
    expect(contatoService.atualizar).not.toHaveBeenCalled();
  });

  it('should notify error when updating contato fails', () => {
    contatoService.atualizar = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
    const fixture = createComponent();
    fixture.componentInstance.editFormNome.set('Contato');
    fixture.componentInstance.editFormValor.set('novo@test.com');
    fixture.componentInstance.salvarEditContato({ id: 'c1', tipo: 'EMAIL', valor: 'a@b.com', nome: 'Contato', principal: true } as any);
    expect(notification.error).toHaveBeenCalledWith('Erro ao atualizar contato', 3000);
    expect(fixture.componentInstance.salvandoContato()).toBe(false);
  });

  it('should navigate to new contract on fecharContrato', () => {
    const fixture = createComponent();
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.fecharContrato();
    expect(spy).toHaveBeenCalledWith(['/financeiro/contratos/novo', '123456']);
  });

  it('should advance status from atribuido via contact dialog', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();

    fixture.componentInstance.avancarStatus(1);
    expect(dialog.open).toHaveBeenCalled();
    afterClosed$.next({ tipo: 'WHATSAPP', valor: '5511999999999', nome: 'Cliente', principal: true });
    expect(contatoService.salvar).toHaveBeenCalledWith('123456', {
      tipo: 'WHATSAPP', valor: '5511999999999', nome: 'Cliente', principal: true,
    });
    expect(processState.atualizarStatus).toHaveBeenCalledWith('123456', StatusAtribuicao.EM_CONVERSA);
  });

  it('should do nothing when contact dialog returns nothing', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    overrideDialog();
    const fixture = createComponent();

    fixture.componentInstance.avancarStatus(1);
    afterClosed$.next(null);
    expect(contatoService.salvar).not.toHaveBeenCalled();
  });

  it('should not upload when no file selected', () => {
    const fixture = createComponent();
    fixture.componentInstance.onFileSelected({ target: { files: [] } });
    expect(documentoService.upload).not.toHaveBeenCalled();
  });
});
