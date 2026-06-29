import { TestBed } from '@angular/core/testing';
import { AssignedProcessesListComponent } from './assigned-processes-list.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { DistributionService } from '../../../core/services/distribution.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('AssignedProcessesListComponent', () => {
  let distService: any;

  beforeEach(async () => {
    (window as any).IntersectionObserver = class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(_callback: any) { }
    };

    distService = {
      getMeusProcessos: vi.fn(),
      getProcessosEquipe: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AssignedProcessesListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DistributionService, useValue: distService },
      ],
    }).compileComponents();
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
            statusPrazo: 'NORMAL',
            isVencendoPrazo: false,
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

      expect(distService.getMeusProcessos).toHaveBeenCalledWith(0);
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

      expect(distService.getProcessosEquipe).toHaveBeenCalledWith(0);
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

    expect(distService.getMeusProcessos).toHaveBeenCalledWith(1);
  });
});
