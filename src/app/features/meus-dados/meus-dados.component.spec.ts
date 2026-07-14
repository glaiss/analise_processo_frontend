import { TestBed } from '@angular/core/testing';
import { MeusDadosComponent } from './meus-dados.component';
import { AuthService, User } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

function createMockUser(overrides?: Partial<User>): User {
  return {
    username: 'joao@test.com',
    nome: 'João Silva',
    equipe: 'Equipe A',
    authorities: [{ authority: 'ROLE_ADMIN' }],
    ...overrides
  };
}

class MockAuthService {
  private readonly _user = createMockUser();
  currentUser = () => this._user;
  alterarNome = vi.fn().mockReturnValue(of(undefined));
  alterarEmail = vi.fn().mockReturnValue(of(undefined));
}

describe('MeusDadosComponent', () => {
  let mockAuth: MockAuthService;
  let mockNotification: Partial<NotificationService>;

  beforeEach(async () => {
    mockAuth = new MockAuthService();

    mockNotification = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MeusDadosComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth as unknown as AuthService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MeusDadosComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should populate nome and email from currentUser', () => {
    const fixture = TestBed.createComponent(MeusDadosComponent);
    expect(fixture.componentInstance.nome()).toBe('João Silva');
    expect(fixture.componentInstance.email()).toBe('joao@test.com');
  });

  it('should show error when nome is empty on salvarNome', () => {
    const fixture = TestBed.createComponent(MeusDadosComponent);
    fixture.componentInstance.nome.set('');
    fixture.componentInstance.salvarNome();

    expect(fixture.componentInstance.errorNome()).toBe('O nome não pode ficar vazio.');
    expect(mockAuth.alterarNome).not.toHaveBeenCalled();
  });

  it('should call alterarNome on salvarNome', () => {
    const fixture = TestBed.createComponent(MeusDadosComponent);
    fixture.componentInstance.nome.set('Novo Nome');
    fixture.componentInstance.salvarNome();

    expect(mockAuth.alterarNome).toHaveBeenCalledWith('Novo Nome');
    expect(mockNotification.success).toHaveBeenCalledWith('Nome alterado com sucesso.');
  });

  it('should show error when email is empty on salvarEmail', () => {
    const fixture = TestBed.createComponent(MeusDadosComponent);
    fixture.componentInstance.email.set('');
    fixture.componentInstance.salvarEmail();

    expect(fixture.componentInstance.errorEmail()).toBe('O email não pode ficar vazio.');
    expect(mockAuth.alterarEmail).not.toHaveBeenCalled();
  });

  it('should show error when email is invalid on salvarEmail', () => {
    const fixture = TestBed.createComponent(MeusDadosComponent);
    fixture.componentInstance.email.set('invalid');
    fixture.componentInstance.salvarEmail();

    expect(fixture.componentInstance.errorEmail()).toBe('Informe um email válido.');
    expect(mockAuth.alterarEmail).not.toHaveBeenCalled();
  });

  it('should call alterarEmail on salvarEmail', () => {
    const fixture = TestBed.createComponent(MeusDadosComponent);
    fixture.componentInstance.email.set('novo@test.com');
    fixture.componentInstance.salvarEmail();

    expect(mockAuth.alterarEmail).toHaveBeenCalledWith('novo@test.com');
    expect(mockNotification.success).toHaveBeenCalledWith('Email alterado com sucesso.');
  });

  it('should handle conflict error on salvarEmail', () => {
    mockAuth.alterarEmail = vi.fn().mockReturnValue(throwError(() => ({ status: 409, error: { detail: 'Email já cadastrado' } })));

    const fixture = TestBed.createComponent(MeusDadosComponent);
    fixture.componentInstance.email.set('existente@test.com');
    fixture.componentInstance.salvarEmail();

    expect(fixture.componentInstance.errorEmail()).toBe('Email já cadastrado');
  });

  it('should handle network error on salvarEmail', () => {
    mockAuth.alterarEmail = vi.fn().mockReturnValue(throwError(() => ({ status: 0 })));

    const fixture = TestBed.createComponent(MeusDadosComponent);
    fixture.componentInstance.email.set('test@test.com');
    fixture.componentInstance.salvarEmail();

    expect(fixture.componentInstance.errorEmail()).toBe('Sistema indisponível. Verifique sua conexão.');
  });

  it('should handle generic error on salvarEmail', () => {
    mockAuth.alterarEmail = vi.fn().mockReturnValue(throwError(() => ({ status: 500 })));

    const fixture = TestBed.createComponent(MeusDadosComponent);
    fixture.componentInstance.email.set('test@test.com');
    fixture.componentInstance.salvarEmail();

    expect(fixture.componentInstance.errorEmail()).toBe('Erro ao alterar email.');
  });
});
