import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DistribuicaoComponent } from './distribuicao.component';
import { DistributionService } from '../../core/services/distribution.service';
import { NotificationService } from '../../core/services/notification.service';
import { EquipeService } from '../../core/services/equipe.service';
import { of, throwError } from 'rxjs';

describe('DistribuicaoComponent', () => {
  let equipeService: any;
  let distService: any;
  let notificationService: any;

  beforeEach(async () => {
    equipeService = {
      getEquipes: vi.fn(),
    };
    distService = {
      executarDistribuicao: vi.fn(),
      executarDistribuicaoPorEquipe: vi.fn(),
    };
    notificationService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DistribuicaoComponent, NoopAnimationsModule],
      providers: [
        { provide: DistributionService, useValue: distService },
        { provide: NotificationService, useValue: notificationService },
        { provide: EquipeService, useValue: equipeService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DistribuicaoComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load active equipes on init', () => {
    equipeService.getEquipes.mockReturnValue(of({
      content: [
        { id: '1', nome: 'Equipe A', ativo: true },
        { id: '2', nome: 'Equipe B', ativo: false },
      ],
      totalElements: 2, totalPages: 1, size: 100, number: 0, last: true, first: true, empty: false,
    }));

    const fixture = TestBed.createComponent(DistribuicaoComponent);
    fixture.detectChanges();

    expect(equipeService.getEquipes).toHaveBeenCalledWith(0, 100);
    expect(fixture.componentInstance.equipes().length).toBe(1);
    expect(fixture.componentInstance.equipes()[0].nome).toBe('Equipe A');
  });

  it('should notify error when load equipes fails', () => {
    equipeService.getEquipes.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = TestBed.createComponent(DistribuicaoComponent);
    fixture.detectChanges();
    expect(notificationService.error).toHaveBeenCalledWith('Erro ao carregar equipes');
  });

  it('should call executarDistribuicao for todos', () => {
    distService.executarDistribuicao.mockReturnValue(of(undefined));
    equipeService.getEquipes.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, size: 100, number: 0, last: true, first: true, empty: true }));

    const fixture = TestBed.createComponent(DistribuicaoComponent);
    fixture.detectChanges();
    fixture.componentInstance.selectedEquipeId.set('todos');
    fixture.componentInstance.executar();

    expect(distService.executarDistribuicao).toHaveBeenCalled();
    expect(distService.executarDistribuicaoPorEquipe).not.toHaveBeenCalled();
    expect(notificationService.success).toHaveBeenCalledWith('Distribuição executada com sucesso!');
  });

  it('should call executarDistribuicaoPorEquipe for specific equipe', () => {
    distService.executarDistribuicaoPorEquipe.mockReturnValue(of(undefined));
    equipeService.getEquipes.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, size: 100, number: 0, last: true, first: true, empty: true }));

    const fixture = TestBed.createComponent(DistribuicaoComponent);
    fixture.detectChanges();
    fixture.componentInstance.selectedEquipeId.set('1');
    fixture.componentInstance.executar();

    expect(distService.executarDistribuicaoPorEquipe).toHaveBeenCalledWith('1');
    expect(distService.executarDistribuicao).not.toHaveBeenCalled();
  });

  it('should show error message on distribution failure', () => {
    distService.executarDistribuicao.mockReturnValue(throwError(() => ({ error: { message: 'Erro de teste' } })));
    equipeService.getEquipes.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, size: 100, number: 0, last: true, first: true, empty: true }));

    const fixture = TestBed.createComponent(DistribuicaoComponent);
    fixture.detectChanges();
    fixture.componentInstance.executar();

    expect(notificationService.error).toHaveBeenCalledWith('Erro de teste');
  });

  it('should show fallback error message when no error message', () => {
    distService.executarDistribuicao.mockReturnValue(throwError(() => ({})));
    equipeService.getEquipes.mockReturnValue(of({ content: [], totalElements: 0, totalPages: 0, size: 100, number: 0, last: true, first: true, empty: true }));

    const fixture = TestBed.createComponent(DistribuicaoComponent);
    fixture.detectChanges();
    fixture.componentInstance.executar();

    expect(notificationService.error).toHaveBeenCalledWith('Erro ao executar distribuição.');
  });
});
