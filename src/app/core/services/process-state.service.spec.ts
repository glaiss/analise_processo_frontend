import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProcessStateService } from './process-state.service';
import { environment } from '../../../environments/environment';
import { ProcessoResumoDTO } from '../models/processo/processo-resumo.model';
import { StatusAtribuicao, ProcessoSituacao } from '../models/processo/enums.model';
import { Page } from '../models/processo/pagination.model';

const API_URL = `${environment.apiUrl}/v1/analise/processos`;

function createMockProcesso(overrides?: Partial<ProcessoResumoDTO>): ProcessoResumoDTO {
  return {
    numero: '0000001-12.2023.8.26.0100',
    classeJudicial: 'Procedimento Comum',
    assuntoJudicial: 'Indenização',
    dataAjuizamento: '2023-01-15T10:00:00',
    scoreFinal: 75,
    nivel: 'ALTO',
    statusAtribuicao: StatusAtribuicao.DISPONIVEL,
    usuarioResponsavel: null,
    prazoVencendo: false,
    diasParaVencer: 30,
    processoSituacao: ProcessoSituacao.ENRIQUECIDO,
    monitorado: false,
    ...overrides,
  };
}

function createMockPage(content: ProcessoResumoDTO[]): Page<ProcessoResumoDTO> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    number: 0,
    size: 20,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

describe('ProcessStateService', () => {
  let service: ProcessStateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ProcessStateService],
    });
    service = TestBed.inject(ProcessStateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty initial state', () => {
      expect(service.allProcesses()).toEqual([]);
      expect(service.isLoading()).toBe(false);
      expect(service.errorMessage()).toBeNull();
      expect(service.isLastPage()).toBe(true);
      expect(service.currentMode()).toBe('all');
      expect(service.totalElementCount()).toBe(0);
    });
  });

  describe('loadProcesses', () => {
    it('should load processes from API', () => {
      const processos = [createMockProcesso()];
      service.loadProcesses();

      const req = httpMock.expectOne(`${API_URL}?page=0&size=20`);
      expect(req.request.method).toBe('GET');
      req.flush(createMockPage(processos));

      expect(service.allProcesses()).toEqual(processos);
      expect(service.isLoading()).toBe(false);
      expect(service.totalElementCount()).toBe(1);
    });

    it('should load monitored processes when mode is monitorados', () => {
      service.setMode('monitorados');

      const req = httpMock.expectOne(`${API_URL}/monitorados?page=0&size=20`);
      expect(req.request.method).toBe('GET');
      req.flush(createMockPage([]));

      expect(service.currentMode()).toBe('monitorados');
    });

    it('should append processes when append is true', () => {
      const p1 = createMockProcesso({ numero: '1' });
      const p2 = createMockProcesso({ numero: '2' });

      service.loadProcesses();
      httpMock.expectOne(`${API_URL}?page=0&size=20`).flush(createMockPage([p1]));

      service.loadProcesses(true);
      httpMock.expectOne(`${API_URL}?page=0&size=20`).flush(createMockPage([p2]));

      expect(service.allProcesses()).toEqual([p1, p2]);
    });

    it('should not load if already loading', () => {
      service.loadProcesses();
      service.loadProcesses();

      const req = httpMock.expectOne(`${API_URL}?page=0&size=20`);
      httpMock.expectNone(`${API_URL}?page=0&size=20`);
      req.flush({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, empty: true });
    });

    it('should set error on failure', () => {
      service.loadProcesses();

      const req = httpMock.expectOne(`${API_URL}?page=0&size=20`);
      req.error(new ProgressEvent('error'));

      expect(service.errorMessage()).toBe('Erro ao carregar processos');
      expect(service.isLoading()).toBe(false);
    });

    it('should include filter params when set', () => {
      service.setFilterNivel(['ALTO']);
      httpMock.expectOne(`${API_URL}?page=0&size=20&niveis=ALTO`).flush(createMockPage([]));

      service.setFilterStatus([StatusAtribuicao.DISPONIVEL]);
      httpMock.expectOne(`${API_URL}?page=0&size=20&niveis=ALTO&status=DISPONIVEL`).flush(createMockPage([]));

      service.setSearchQuery('123');
      httpMock.expectOne(`${API_URL}?page=0&size=20&numero=123&niveis=ALTO&status=DISPONIVEL`).flush(createMockPage([]));

      service.setFilterSituacao([ProcessoSituacao.ENRIQUECIDO]);
      httpMock.expectOne(`${API_URL}?page=0&size=20&numero=123&niveis=ALTO&status=DISPONIVEL&situacao=ENRIQUECIDO`).flush(createMockPage([]));

      service.setFilterAssunto('Indenização');
      httpMock.expectOne(`${API_URL}?page=0&size=20&numero=123&assunto=Indeniza%C3%A7%C3%A3o&niveis=ALTO&status=DISPONIVEL&situacao=ENRIQUECIDO`).flush(createMockPage([]));
    });
  });

  describe('loadNextPage', () => {
    it('should increment page and load more', () => {
      service.loadProcesses();
      httpMock.expectOne(`${API_URL}?page=0&size=20`).flush({ ...createMockPage([createMockProcesso()]), totalPages: 2 });

      service.loadNextPage();
      httpMock.expectOne(`${API_URL}?page=1&size=20`).flush(createMockPage([createMockProcesso()]));
    });

    it('should not load if already on last page', () => {
      service.loadProcesses();
      httpMock.expectOne(`${API_URL}?page=0&size=20`).flush({
        content: [], totalElements: 0, totalPages: 1, number: 0, size: 20, first: true, last: true, empty: true
      });

      service.loadNextPage();
      httpMock.expectNone(`${API_URL}?page=1&size=20`);
    });
  });

  describe('alternarMonitoramento', () => {
    it('should toggle monitorado optimistically and revert on error', () => {
      const processo = createMockProcesso({ numero: '123', monitorado: false });
      service.loadProcesses();
      httpMock.expectOne(`${API_URL}?page=0&size=20`).flush(createMockPage([processo]));

      service.alternarMonitoramento('123').subscribe();

      expect(service.allProcesses()[0].monitorado).toBe(true);

      const req = httpMock.expectOne(`${API_URL}/123/monitorar`);
      expect(req.request.method).toBe('POST');
      req.error(new ProgressEvent('error'));

      expect(service.allProcesses()[0].monitorado).toBe(false);
    });
  });

  describe('groupedProcesses', () => {
    it('should group processes by equipeNome', () => {
      const p1 = createMockProcesso({ numero: '1', equipeNome: 'Equipe A', scoreFinal: 100 });
      const p2 = createMockProcesso({ numero: '2', equipeNome: 'Equipe A', scoreFinal: 50 });
      const p3 = createMockProcesso({ numero: '3', equipeNome: 'Equipe B', scoreFinal: 200 });

      service.loadProcesses();
      httpMock.expectOne(`${API_URL}?page=0&size=20`).flush(createMockPage([p1, p2, p3]));

      const groups = service.groupedProcesses();
      expect(groups.length).toBe(2);
      expect(groups[0].name).toBe('Equipe A');
      expect(groups[0].count).toBe(2);
      expect(groups[0].totalScore).toBe(150);
      expect(groups[1].name).toBe('Equipe B');
      expect(groups[1].count).toBe(1);
      expect(groups[1].totalScore).toBe(200);
    });

    it('should group null equipe as Não Atribuído', () => {
      const p = createMockProcesso({ numero: '1', equipeNome: undefined });
      service.loadProcesses();
      httpMock.expectOne(`${API_URL}?page=0&size=20`).flush(createMockPage([p]));

      expect(service.groupedProcesses()[0].name).toBe('Não Atribuído');
    });
  });

  describe('discardProcess', () => {
    it('should DELETE processo', () => {
      service.discardProcess('123').subscribe();
      const req = httpMock.expectOne(`${API_URL}/123/descartar`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('getProcessoDetalhe', () => {
    it('should GET processo detalhe', () => {
      service.getProcessoDetalhe('123').subscribe();
      const req = httpMock.expectOne(`${API_URL}/123`);
      expect(req.request.method).toBe('GET');
      req.flush({ numero: '123' });
    });
  });

  describe('getAuditoriaScore', () => {
    it('should GET auditoria-score', () => {
      service.getAuditoriaScore('123').subscribe();
      const req = httpMock.expectOne(`${API_URL}/123/auditoria-score`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('adicionarAnotacao', () => {
    it('should POST anotacao', () => {
      service.adicionarAnotacao('123', 'Texto da anotação').subscribe();
      const req = httpMock.expectOne(`${API_URL}/123/anotacoes`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe('Texto da anotação');
      req.flush(null);
    });
  });

  describe('deletarAnotacao', () => {
    it('should DELETE anotacao', () => {
      service.deletarAnotacao('123', 'anot1').subscribe();
      const req = httpMock.expectOne(`${API_URL}/123/anotacoes/anot1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('setGroupBy', () => {
    it('should change group key', () => {
      service.setGroupBy('usuarioResponsavel');
      expect(service.groupedProcesses).toBeDefined();
    });
  });
});
