import { TestBed } from '@angular/core/testing';
import { UserManagementComponent } from './user-management.component';
import { Role, UserService } from '../../../core/services/user.service';
import { EquipeDto, EquipeService } from '../../../core/services/equipe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('UserManagementComponent', () => {
  let mockUserService: Partial<UserService>;
  let mockEquipeService: Partial<EquipeService>;
  let mockNotification: Partial<NotificationService>;

  beforeEach(async () => {
    mockUserService = {
      criarUsuario: vi.fn().mockReturnValue(of({ id: '1', username: 'test@test.com', nome: 'Teste', role: Role.ANALISTA })),
    };

    mockEquipeService = {
      getEquipes: vi.fn().mockReturnValue(of({
        content: [{ id: '1', nome: 'Equipe A', ativo: true }] as EquipeDto[],
        totalElements: 1, totalPages: 1, size: 20, number: 0, last: true, first: true, empty: false
      })),
    };

    mockNotification = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: mockUserService },
        { provide: EquipeService, useValue: mockEquipeService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should load equipes on construction', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    expect(mockEquipeService.getEquipes).toHaveBeenCalled();
  });

  it('should have available roles', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    expect(fixture.componentInstance.roles).toContain(Role.ANALISTA);
    expect(fixture.componentInstance.roles).toContain(Role.ADMIN);
  });

  it('should submit form and create user', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.userForm.patchValue({
      username: 'test@test.com',
      nome: 'Teste',
      password: '123456',
      role: Role.ANALISTA,
    });
    fixture.componentInstance.onSubmit();

    expect(mockUserService.criarUsuario).toHaveBeenCalled();
    expect(mockNotification.success).toHaveBeenCalledWith('Usuário criado com sucesso!');
    expect(spy).toHaveBeenCalledWith(['/admin']);
  });

  it('should not submit invalid form', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    fixture.componentInstance.onSubmit();
    expect(mockUserService.criarUsuario).not.toHaveBeenCalled();
  });

  it('should navigate back', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    const router = TestBed.inject(Router);
    const spy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.back();
    expect(spy).toHaveBeenCalledWith(['/admin']);
  });

  it('should load more equipes on scroll', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    const spy = vi.spyOn(fixture.componentInstance, 'loadEquipes');

    const mockEvent = { target: { scrollTop: 100, offsetHeight: 200, scrollHeight: 300 } };
    fixture.componentInstance.onEquipesScroll(mockEvent);
    expect(spy).toHaveBeenCalled();
  });

  it('should not load equipes on scroll when not near bottom', () => {
    const fixture = TestBed.createComponent(UserManagementComponent);
    const spy = vi.spyOn(fixture.componentInstance, 'loadEquipes');

    const mockEvent = { target: { scrollTop: 0, offsetHeight: 200, scrollHeight: 1000 } };
    fixture.componentInstance.onEquipesScroll(mockEvent);
    expect(spy).not.toHaveBeenCalled();
  });
});
