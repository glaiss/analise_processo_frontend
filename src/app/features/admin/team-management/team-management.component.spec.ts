import { TestBed } from '@angular/core/testing';
import { TeamManagementComponent } from './team-management.component';
import { EquipeDto, EquipeService } from '../../../core/services/equipe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('TeamManagementComponent', () => {
  let mockEquipeService: Partial<EquipeService>;
  let mockNotification: Partial<NotificationService>;

  beforeEach(async () => {
    mockEquipeService = {
      getEquipes: vi.fn().mockReturnValue(of({
        content: [
          { id: '1', nome: 'Equipe A', ativo: true },
          { id: '2', nome: 'Equipe B', ativo: false },
        ] as EquipeDto[],
        totalElements: 2, totalPages: 1, size: 20, number: 0, last: true, first: true, empty: false
      })),
      criarEquipe: vi.fn().mockReturnValue(of({ id: '3', nome: 'Nova Equipe', ativo: true } as EquipeDto)),
    };

    mockNotification = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [TeamManagementComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: EquipeService, useValue: mockEquipeService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TeamManagementComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load equipes on init', () => {
    const fixture = TestBed.createComponent(TeamManagementComponent);
    fixture.detectChanges();

    expect(mockEquipeService.getEquipes).toHaveBeenCalledWith(0, 100);
    expect(fixture.componentInstance.equipes().length).toBe(2);
  });

  it('should create equipe and update list on submit', () => {
    const fixture = TestBed.createComponent(TeamManagementComponent);
    fixture.detectChanges();

    fixture.componentInstance.teamForm.patchValue({ nome: 'Nova Equipe' });
    fixture.componentInstance.onSubmit();

    expect(mockEquipeService.criarEquipe).toHaveBeenCalledWith({ nome: 'Nova Equipe', ativo: true });
    expect(mockNotification.success).toHaveBeenCalledWith('Equipe criada com sucesso!');
    expect(fixture.componentInstance.equipes().length).toBe(3);
  });

  it('should not submit invalid form', () => {
    const fixture = TestBed.createComponent(TeamManagementComponent);
    fixture.detectChanges();

    fixture.componentInstance.teamForm.patchValue({ nome: '' });
    fixture.componentInstance.onSubmit();

    expect(mockEquipeService.criarEquipe).not.toHaveBeenCalled();
  });

  it('should navigate back', () => {
    const fixture = TestBed.createComponent(TeamManagementComponent);
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.back();
    expect(spy).toHaveBeenCalledWith(['/admin']);
  });
});
