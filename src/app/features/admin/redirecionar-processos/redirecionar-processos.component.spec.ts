import { TestBed } from '@angular/core/testing';
import { RedirecionarProcessosComponent } from './redirecionar-processos.component';
import { DistributionService } from '../../../core/services/distribution.service';
import { UserService, UsuarioResponse } from '../../../core/services/user.service';
import { EquipeService, EquipeDto } from '../../../core/services/equipe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('RedirecionarProcessosComponent', () => {
  let mockDistService: Partial<DistributionService>;
  let mockUserService: Partial<UserService>;
  let mockEquipeService: Partial<EquipeService>;
  let mockNotification: Partial<NotificationService>;

  beforeEach(async () => {
    mockDistService = {
      redirecionarProcessos: vi.fn().mockReturnValue(of(undefined)),
    };

    mockUserService = {
      getUsuarios: vi.fn().mockReturnValue(of({
        content: [{ id: 'u1', nome: 'João' }] as UsuarioResponse[],
        totalElements: 1, totalPages: 1, size: 200, number: 0, last: true, first: true, empty: false
      })),
    };

    mockEquipeService = {
      getEquipes: vi.fn().mockReturnValue(of({
        content: [{ id: 'e1', nome: 'Equipe A', ativo: true }] as EquipeDto[],
        totalElements: 1, totalPages: 1, size: 100, number: 0, last: true, first: true, empty: false
      })),
    };

    mockNotification = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RedirecionarProcessosComponent, NoopAnimationsModule],
      providers: [
        { provide: DistributionService, useValue: mockDistService },
        { provide: UserService, useValue: mockUserService },
        { provide: EquipeService, useValue: mockEquipeService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(RedirecionarProcessosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load usuarios and equipes on init', () => {
    const fixture = TestBed.createComponent(RedirecionarProcessosComponent);
    fixture.detectChanges();

    expect(mockUserService.getUsuarios).toHaveBeenCalled();
    expect(mockEquipeService.getEquipes).toHaveBeenCalled();
  });

  it('should show warning when origem usuario is selected but no user chosen', () => {
    const fixture = TestBed.createComponent(RedirecionarProcessosComponent);
    fixture.detectChanges();

    fixture.componentInstance.origemTipo.set('usuario');
    fixture.componentInstance.selectedOrigemUsuarioId.set('');
    fixture.componentInstance.redirecionar();

    expect(mockNotification.warn).toHaveBeenCalledWith('Selecione o usuário de origem.');
    expect(mockDistService.redirecionarProcessos).not.toHaveBeenCalled();
  });

  it('should show warning when destino is PESSOA but no user selected', () => {
    const fixture = TestBed.createComponent(RedirecionarProcessosComponent);
    fixture.detectChanges();

    fixture.componentInstance.origemTipo.set('disponiveis');
    fixture.componentInstance.tipoDestino.set('PESSOA');
    fixture.componentInstance.selectedDestinoUsuarioId.set('');
    fixture.componentInstance.redirecionar();

    expect(mockNotification.warn).toHaveBeenCalledWith('Selecione o usuário de destino.');
  });

  it('should show warning when destino is EQUIPE but no equipe selected', () => {
    const fixture = TestBed.createComponent(RedirecionarProcessosComponent);
    fixture.detectChanges();

    fixture.componentInstance.origemTipo.set('disponiveis');
    fixture.componentInstance.tipoDestino.set('EQUIPE');
    fixture.componentInstance.selectedDestinoEquipeId.set('');
    fixture.componentInstance.redirecionar();

    expect(mockNotification.warn).toHaveBeenCalledWith('Selecione a equipe de destino.');
  });

  it('should redirect processos from usuario to pessoa', () => {
    const fixture = TestBed.createComponent(RedirecionarProcessosComponent);
    fixture.detectChanges();

    fixture.componentInstance.origemTipo.set('usuario');
    fixture.componentInstance.selectedOrigemUsuarioId.set('u1');
    fixture.componentInstance.tipoDestino.set('PESSOA');
    fixture.componentInstance.selectedDestinoUsuarioId.set('u2');
    fixture.componentInstance.redirecionar();

    expect(mockDistService.redirecionarProcessos).toHaveBeenCalledWith({
      tipo: 'PESSOA',
      origemUsuarioId: 'u1',
      usuarioId: 'u2',
    });
    expect(mockNotification.success).toHaveBeenCalledWith('Processos redirecionados com sucesso!');
  });

  it('should redirect processos from disponiveis to equipe', () => {
    const fixture = TestBed.createComponent(RedirecionarProcessosComponent);
    fixture.detectChanges();

    fixture.componentInstance.origemTipo.set('disponiveis');
    fixture.componentInstance.tipoDestino.set('EQUIPE');
    fixture.componentInstance.selectedDestinoEquipeId.set('e1');
    fixture.componentInstance.redirecionar();

    expect(mockDistService.redirecionarProcessos).toHaveBeenCalledWith({
      tipo: 'EQUIPE',
      equipeId: 'e1',
    });
    expect(mockNotification.success).toHaveBeenCalledWith('Processos redirecionados com sucesso!');
  });
});
