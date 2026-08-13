import { TestBed } from '@angular/core/testing';
import { AssignedProcessesListComponent } from './assigned-processes-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DistributionService } from '../../../core/services/distribution.service';
import { EnriquecimentoService } from '../../../core/services/enriquecimento.service';
import { NotificationService } from '../../../core/services/notification.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

describe('AssignedProcessesListComponent', () => {
  let distService: any;
  let enriquecimentoService: any;
  let notificationService: any;

  beforeEach(async () => {
    vi.stubGlobal('IntersectionObserver', class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(_callback: any) { }
    });

    const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, empty: true };

    distService = {
      getMeusProcessos: vi.fn().mockReturnValue(of(emptyPage)),
      getProcessosEquipe: vi.fn().mockReturnValue(of(emptyPage)),
    };
    enriquecimentoService = {
      reprocessarPorNumeros: vi.fn(),
    };
    notificationService = {
      success: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AssignedProcessesListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DistributionService, useValue: distService },
        { provide: EnriquecimentoService, useValue: enriquecimentoService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('mode: meus', () => {
    it('should load meus processos on init', () => {
      const mockPage = {
        content: [
          {
            id: '1',
            status: 'ATRIBUIDO',
            processoNumero: '123',
            processoTribunal: 'TJSP',
            processoOrgaoJulgadorNome: '1ª Vara',
            processoDataAjuizamento: '2023-01-01',
            processoValorCausa: 1000,
            processoSituacao: 'ENRIQUECIDO',
            processoTipologia: 'JUDICIAL',
            processoScoreFinal: 80,
            processoEnriquecimentoStatus: 'CONCLUIDO',
            processoEnriquecimentoErro: '',
            equipeNome: 'Equipe A',
            usuarioNome: 'João',
            monitorado: false,
            statusPrazo: 'PENDENTE',
            prazoFinal: null,
            diasPendentes: null,
            prazoVencendo: false,
            resultadoAtendimento: null,
          }
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 20,
        first: true,
        last: true,
        empty: false,
      };

      distService.getMeusProcessos.mockReturnValue(of(mockPage));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();

      expect(distService.getMeusProcessos).toHaveBeenCalledWith(0, 20, undefined);
      expect(fixture.componentInstance.atribuicoes.length).toBe(1);
      expect(fixture.componentInstance.totalElements).toBe(1);
    });
  });

  describe('mode: equipe', () => {
    it('should load processos da equipe on init', () => {
      const mockPage = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 20,
        first: true,
        last: true,
        empty: true,
      };

      distService.getProcessosEquipe.mockReturnValue(of(mockPage));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'equipe');
      fixture.detectChanges();

      expect(distService.getProcessosEquipe).toHaveBeenCalledWith(0, 20, undefined);
    });
  });

  it('should set correct title based on mode', () => {
    distService.getMeusProcessos.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, empty: true }));

    const fixture = TestBed.createComponent(AssignedProcessesListComponent);
    fixture.componentRef.setInput('mode', 'meus');
    fixture.detectChanges();

    expect(fixture.componentInstance.title).toBe('Meus Processos');
  });

  it('should load next page on scroll', () => {
    distService.getMeusProcessos.mockReturnValue(of({
      content: [],
      totalElements: 0,
      totalPages: 2,
      number: 0,
      size: 20,
      first: true,
      last: false,
      empty: true,
    }));

    const fixture = TestBed.createComponent(AssignedProcessesListComponent);
    fixture.componentRef.setInput('mode', 'meus');
    fixture.detectChanges();

    fixture.componentInstance.onScroll();

    expect(distService.getMeusProcessos).toHaveBeenCalledWith(1, 20, undefined);
  });

  describe('ngOnChanges', () => {
    it('should reset list when mode changes', () => {
      distService.getMeusProcessos.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, empty: true }));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      distService.getMeusProcessos.mockClear();

      fixture.componentRef.setInput('mode', 'equipe');
      distService.getProcessosEquipe.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, empty: true }));
      fixture.detectChanges();

      expect(distService.getProcessosEquipe).toHaveBeenCalledWith(0, 20, undefined);
    });

    it('should reset list when filter changes', () => {
      distService.getMeusProcessos.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, empty: true }));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      distService.getMeusProcessos.mockClear();

      fixture.componentRef.setInput('filter', { numero: '123' });
      distService.getMeusProcessos.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20, first: true, last: true, empty: true }));
      fixture.detectChanges();

      expect(distService.getMeusProcessos).toHaveBeenCalledWith(0, 20, { numero: '123' });
    });
  });

  describe('loadProcesses', () => {
    it('should not load when already loading', () => {
      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();

      distService.getMeusProcessos.mockClear();
      fixture.componentInstance.isLoading.set(true);
      fixture.componentInstance.loadProcesses();

      expect(distService.getMeusProcessos).not.toHaveBeenCalled();
    });

    it('should not load when already on last page', () => {
      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();

      distService.getMeusProcessos.mockClear();
      fixture.componentInstance.isLastPage = true;
      fixture.componentInstance.loadProcesses();

      expect(distService.getMeusProcessos).not.toHaveBeenCalled();
    });

    it('should handle error loading processes', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      distService.getMeusProcessos.mockReturnValue(throwError(() => new Error('Falha ao carregar')));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();

      expect(fixture.componentInstance.isLoading()).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('toggleSelection', () => {
    it('should add numero to selected set', () => {
      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      fixture.componentInstance.toggleSelection('123', true);
      expect(fixture.componentInstance.selectedNumeros().has('123')).toBe(true);
    });

    it('should remove numero from selected set', () => {
      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      fixture.componentInstance.toggleSelection('123', true);
      fixture.componentInstance.toggleSelection('123', false);
      expect(fixture.componentInstance.selectedNumeros().has('123')).toBe(false);
    });

    it('should compute selectedCount correctly', () => {
      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      expect(fixture.componentInstance.selectedCount()).toBe(0);
      fixture.componentInstance.toggleSelection('123', true);
      expect(fixture.componentInstance.selectedCount()).toBe(1);
      fixture.componentInstance.toggleSelection('456', true);
      expect(fixture.componentInstance.selectedCount()).toBe(2);
    });
  });

  describe('onScroll', () => {
    it('should not scroll when isLastPage is true', () => {
      distService.getMeusProcessos.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 1, number: 0, size: 20, first: true, last: true, empty: true }));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      distService.getMeusProcessos.mockClear();

      fixture.componentInstance.isLastPage = true;
      fixture.componentInstance.onScroll();
      expect(distService.getMeusProcessos).not.toHaveBeenCalled();
    });
  });

  describe('reprocessarSelecionados', () => {
    it('should do nothing when no processos selected', () => {
      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      fixture.componentInstance.reprocessarSelecionados();
      expect(enriquecimentoService.reprocessarPorNumeros).not.toHaveBeenCalled();
    });

    it('should call reprocessarPorNumeros with selected numbers', () => {
      enriquecimentoService.reprocessarPorNumeros.mockReturnValue(of({
        resultados: [{ sucesso: true }, { sucesso: true }]
      }));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      fixture.componentInstance.toggleSelection('123', true);
      fixture.componentInstance.toggleSelection('456', true);
      fixture.componentInstance.reprocessarSelecionados();

      expect(enriquecimentoService.reprocessarPorNumeros).toHaveBeenCalledWith(['123', '456']);
    });

    it('should show success notification when all succeed', () => {
      enriquecimentoService.reprocessarPorNumeros.mockReturnValue(of({
        resultados: [{ sucesso: true }, { sucesso: true }]
      }));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      fixture.componentInstance.toggleSelection('123', true);
      fixture.componentInstance.reprocessarSelecionados();

      expect(notificationService.success).toHaveBeenCalled();
      expect(fixture.componentInstance.selectedNumeros().size).toBe(0);
      expect(fixture.componentInstance.reprocessando()).toBe(false);
    });

    it('should show warn notification when some fail', () => {
      enriquecimentoService.reprocessarPorNumeros.mockReturnValue(of({
        resultados: [{ sucesso: true }, { sucesso: false }]
      }));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      fixture.componentInstance.toggleSelection('123', true);
      fixture.componentInstance.reprocessarSelecionados();

      expect(notificationService.warn).toHaveBeenCalled();
      expect(fixture.componentInstance.reprocessando()).toBe(false);
    });

    it('should show error notification on request failure', () => {
      enriquecimentoService.reprocessarPorNumeros.mockReturnValue(throwError(() => new Error('Falha')));

      const fixture = TestBed.createComponent(AssignedProcessesListComponent);
      fixture.componentRef.setInput('mode', 'meus');
      fixture.detectChanges();
      fixture.componentInstance.toggleSelection('123', true);
      fixture.componentInstance.reprocessarSelecionados();

      expect(notificationService.error).toHaveBeenCalled();
      expect(fixture.componentInstance.reprocessando()).toBe(false);
    });
  });
});
