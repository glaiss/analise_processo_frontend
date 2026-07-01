import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let authService: any;

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
      checkImpersonation: vi.fn(),
      isLoading: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.hidePassword()).toBe(true);
    fixture.componentInstance.hidePassword.set(false);
    expect(fixture.componentInstance.hidePassword()).toBe(false);
  });

  it('should call login on submit and navigate to dashboard on success', () => {
    authService.login.mockReturnValue(of(undefined));
    authService.checkImpersonation.mockReturnValue(of(undefined));

    const fixture = TestBed.createComponent(LoginComponent);
    const router = fixture.componentInstance['router'];
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.credentials = { username: 'user', password: 'pass' };
    fixture.componentInstance.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
    expect(authService.checkImpersonation).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set network error when status is 0', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 0 })));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.error()).toBe('Sistema indisponível. Verifique sua conexão e tente novamente.');
  });

  it('should set server error when status >= 500', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 500 })));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.error()).toBe('Erro interno do servidor. Tente novamente mais tarde.');
  });

  it('should set invalid credentials error for other status codes', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 401 })));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.error()).toBe('Usuário ou senha inválidos.');
  });
});
