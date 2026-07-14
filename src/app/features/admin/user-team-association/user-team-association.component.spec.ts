import { TestBed } from '@angular/core/testing';
import { UserTeamAssociationComponent } from './user-team-association.component';
import { UserService, UsuarioResponse } from '../../../core/services/user.service';
import { EquipeDto, EquipeService } from '../../../core/services/equipe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('UserTeamAssociationComponent', () => {
  let mockUserService: Partial<UserService>;
  let mockEquipeService: Partial<EquipeService>;
  let mockNotification: Partial<NotificationService>;

  beforeEach(async () => {
    mockUserService = {
      getUsuarios: vi.fn().mockReturnValue(of({
        content: [{ id: 'u1', nome: 'João', username: 'joao', role: 'ANALISTA', equipeId: undefined, equipeNome: undefined }] as UsuarioResponse[],
        totalElements: 1, totalPages: 1, size: 100, number: 0, last: true, first: true, empty: false
      })),
      associarEquipe: vi.fn().mockReturnValue(of({ id: 'u1', nome: 'João', username: 'joao', role: 'ANALISTA', equipeId: 'e1', equipeNome: 'Equipe A' })),
      desassociarEquipe: vi.fn().mockReturnValue(of(undefined)),
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
    };

    await TestBed.configureTestingModule({
      imports: [UserTeamAssociationComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: EquipeService, useValue: mockEquipeService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserTeamAssociationComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load usuarios and equipes on init', () => {
    const fixture = TestBed.createComponent(UserTeamAssociationComponent);
    fixture.detectChanges();

    expect(mockUserService.getUsuarios).toHaveBeenCalledWith(0, 100);
    expect(mockEquipeService.getEquipes).toHaveBeenCalledWith(0, 100);
    expect(fixture.componentInstance.usuarios().length).toBe(1);
    expect(fixture.componentInstance.equipes().length).toBe(1);
  });

  it('should associate user to team on submit', () => {
    const fixture = TestBed.createComponent(UserTeamAssociationComponent);
    fixture.detectChanges();

    fixture.componentInstance.associationForm.patchValue({ usuarioId: 'u1', equipeId: 'e1' });
    fixture.componentInstance.onSubmit();

    expect(mockUserService.associarEquipe).toHaveBeenCalledWith('u1', 'e1');
    expect(mockNotification.success).toHaveBeenCalledWith('Usuário vinculado com sucesso!');
  });

  it('should not submit invalid form', () => {
    const fixture = TestBed.createComponent(UserTeamAssociationComponent);
    fixture.detectChanges();

    fixture.componentInstance.onSubmit();
    expect(mockUserService.associarEquipe).not.toHaveBeenCalled();
  });

  it('should desassociate user from team', () => {
    const fixture = TestBed.createComponent(UserTeamAssociationComponent);
    fixture.detectChanges();

    fixture.componentInstance.desvincular('u1');
    expect(mockUserService.desassociarEquipe).toHaveBeenCalledWith('u1');
    expect(mockNotification.success).toHaveBeenCalledWith('Usuário desvinculado com sucesso!');
  });

  it('should navigate back', () => {
    const fixture = TestBed.createComponent(UserTeamAssociationComponent);
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.back();
    expect(spy).toHaveBeenCalledWith(['/admin']);
  });
});
