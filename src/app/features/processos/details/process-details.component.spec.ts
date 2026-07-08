import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { ProcessDetailsComponent } from './process-details.component';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { DocumentoService } from '../../../core/services/documento.service';
import { NotificationService } from '../../../core/services/notification.service';
import { EnriquecimentoService } from '../../../core/services/enriquecimento.service';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { StatusAtribuicao } from '../../../core/models/processo/enums.model';

function createMockBlob(): Blob {
  return new Blob(['fake'], { type: 'application/pdf' });
}

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
    };

    documentoService = {
      listar: vi.fn().mockReturnValue(of({
        content: [
          { id: 'doc1', nomeArquivo: 'test.pdf', contentType: 'application/pdf', tamanho: 1024, createdDate: '2024-01-01' },
        ],
        totalElements: 1, totalPages: 1, size: 20, number: 0, last: true, first: true, empty: false,
      })),
      download: vi.fn().mockReturnValue(of(createMockBlob())),
      deletar: vi.fn().mockReturnValue(of(undefined)),
      upload: vi.fn().mockReturnValue(of({ id: 'newDoc' })),
      getDownloadUrl: vi.fn().mockReturnValue('/download/url'),
      limparCache: vi.fn(),
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
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    })
      .overrideComponent(ProcessDetailsComponent, {
        set: { providers: [{ provide: MatDialog, useValue: dialog }] },
      })
      .compileComponents();
  });

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
    expect(documentoService.download).toHaveBeenCalledWith('123456', 'doc1');
  });

  it('should select a different documento on selecionarDocumento', () => {
    const fixture = createComponent();
    documentoService.download.mockClear();
    const doc2 = { id: 'doc2', nomeArquivo: 'other.pdf', contentType: 'application/pdf', tamanho: 2048, createdDate: '2024-02-01' };
    fixture.componentInstance.selecionarDocumento(doc2);
    expect(fixture.componentInstance.documentoSelecionado()!.id).toBe('doc2');
    expect(documentoService.download).toHaveBeenCalledWith('123456', 'doc2');
  });

  it('should handle preview download error', () => {
    documentoService.download.mockReturnValue(of(createMockBlob())); // success by default
    const fixture = createComponent();
    expect(notification.error).not.toHaveBeenCalled();
  });

  it('should show error notification on preview failure', () => {
    documentoService.download.mockReturnValue(new Subject()); // never emits
    const fixture = createComponent();
    expect(fixture.componentInstance.carregandoPreview()).toBe(true);
  });

  it('should baixarDocumento and trigger click', () => {
    const fixture = createComponent();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    fixture.componentInstance.baixarDocumento({ id: 'doc1', nomeArquivo: 'test.pdf', contentType: 'application/pdf', tamanho: 1024, createdDate: '2024-01-01' });
    expect(documentoService.download).toHaveBeenCalledWith('123456', 'doc1');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should open confirm dialog and delete document on confirmation', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
    const fixture = createComponent();
    fixture.componentInstance.onDeleteDocument({ id: 'doc1', nomeArquivo: 'test.pdf', contentType: 'application/pdf', tamanho: 1024, createdDate: '2024-01-01' });
    expect(dialog.open).toHaveBeenCalled();
    afterClosed$.next(true);
    expect(documentoService.deletar).toHaveBeenCalledWith('123456', 'doc1');
    expect(notification.success).toHaveBeenCalledWith('Documento excluído com sucesso', 3000);
  });

  it('should not delete document when dialog is cancelled', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
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
    expect(fixture.componentInstance.getScoreColor(150)).toBe('high');
    expect(fixture.componentInstance.getScoreColor(75)).toBe('medium');
    expect(fixture.componentInstance.getScoreColor(25)).toBe('low');
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
    const fixture = createComponent();
    fixture.componentInstance.deletarAnotacao('ann1');
    expect(dialog.open).toHaveBeenCalled();
    afterClosed$.next(true);
    expect(processState.deletarAnotacao).toHaveBeenCalledWith('123456', 'ann1');
  });

  it('should not delete annotation if dialog cancelled', () => {
    const afterClosed$ = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => afterClosed$ });
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
    expect(chips[0].textContent).toContain('MEDIO');
    expect(chips[1].textContent).toContain('ATRIBUIDO');
  });
});
