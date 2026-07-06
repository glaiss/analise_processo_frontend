import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { AlterarSenhaComponent } from './alterar-senha.component';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({ template: '', standalone: true })
class StubComponent {}

describe('AlterarSenhaComponent', () => {
  let authService: any;
  let notificationService: any;

  beforeEach(async () => {
    authService = {
      alterarSenha: vi.fn(),
    };

    notificationService = {
      success: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AlterarSenhaComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'dashboard', component: StubComponent }]),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AlterarSenhaComponent);
    expect(fixture.componentInstance).toBeTruthy();
  }, 15000);

  it('should show error when fields are empty', () => {
    const fixture = TestBed.createComponent(AlterarSenhaComponent);
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.error()).toBe('Preencha todos os campos.');
  });

  it('should show error when new password is too short', () => {
    const fixture = TestBed.createComponent(AlterarSenhaComponent);
    fixture.componentInstance.senhaAtual = '123';
    fixture.componentInstance.senhaNova = 'ab';
    fixture.componentInstance.senhaConfirmacao = 'ab';
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.error()).toBe('Nova senha deve ter no mínimo 4 caracteres.');
  });

  it('should show error when passwords do not match', () => {
    const fixture = TestBed.createComponent(AlterarSenhaComponent);
    fixture.componentInstance.senhaAtual = '123';
    fixture.componentInstance.senhaNova = 'abcde';
    fixture.componentInstance.senhaConfirmacao = 'abcdef';
    fixture.componentInstance.onSubmit();
    expect(fixture.componentInstance.error()).toBe('Confirmação de senha não confere.');
  });

  it('should call auth.alterarSenha on valid form', () => {
    authService.alterarSenha.mockReturnValue(of(undefined));
    const fixture = TestBed.createComponent(AlterarSenhaComponent);
    fixture.componentInstance.senhaAtual = 'senhaAntiga';
    fixture.componentInstance.senhaNova = 'senhaNova123';
    fixture.componentInstance.senhaConfirmacao = 'senhaNova123';
    fixture.componentInstance.onSubmit();
    expect(authService.alterarSenha).toHaveBeenCalledWith('senhaAntiga', 'senhaNova123');
  });

  describe('onSubmit - error handling', () => {
    it('should show error for status 400 (senha atual incorreta)', () => {
      authService.alterarSenha.mockReturnValue(throwError(() => new HttpErrorResponse({
        status: 400,
        error: { detail: 'Senha atual incorreta.' }
      })));

      const fixture = TestBed.createComponent(AlterarSenhaComponent);
      fixture.componentInstance.senhaAtual = 'antiga';
      fixture.componentInstance.senhaNova = 'nova1234';
      fixture.componentInstance.senhaConfirmacao = 'nova1234';
      fixture.componentInstance.onSubmit();

      expect(fixture.componentInstance.loading()).toBe(false);
      expect(fixture.componentInstance.error()).toBe('Senha atual incorreta.');
    });

    it('should show fallback message for status 400 without detail', () => {
      authService.alterarSenha.mockReturnValue(throwError(() => new HttpErrorResponse({
        status: 400,
        error: {}
      })));

      const fixture = TestBed.createComponent(AlterarSenhaComponent);
      fixture.componentInstance.senhaAtual = 'antiga';
      fixture.componentInstance.senhaNova = 'nova1234';
      fixture.componentInstance.senhaConfirmacao = 'nova1234';
      fixture.componentInstance.onSubmit();

      expect(fixture.componentInstance.error()).toBe('Senha atual incorreta.');
    });

    it('should show network error for status 0', () => {
      authService.alterarSenha.mockReturnValue(throwError(() => new HttpErrorResponse({
        status: 0
      })));

      const fixture = TestBed.createComponent(AlterarSenhaComponent);
      fixture.componentInstance.senhaAtual = 'antiga';
      fixture.componentInstance.senhaNova = 'nova1234';
      fixture.componentInstance.senhaConfirmacao = 'nova1234';
      fixture.componentInstance.onSubmit();

      expect(fixture.componentInstance.error()).toBe('Sistema indisponível. Verifique sua conexão.');
    });

    it('should show generic error for other status codes', () => {
      authService.alterarSenha.mockReturnValue(throwError(() => new HttpErrorResponse({
        status: 500
      })));

      const fixture = TestBed.createComponent(AlterarSenhaComponent);
      fixture.componentInstance.senhaAtual = 'antiga';
      fixture.componentInstance.senhaNova = 'nova1234';
      fixture.componentInstance.senhaConfirmacao = 'nova1234';
      fixture.componentInstance.onSubmit();

      expect(fixture.componentInstance.error()).toBe('Erro ao alterar senha. Tente novamente.');
    });
  });

  describe('onSubmit - success behavior', () => {
    it('should show success notification and navigate to dashboard', () => {
      authService.alterarSenha.mockReturnValue(of(undefined));
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      const fixture = TestBed.createComponent(AlterarSenhaComponent);
      fixture.componentInstance.senhaAtual = 'antiga';
      fixture.componentInstance.senhaNova = 'nova1234';
      fixture.componentInstance.senhaConfirmacao = 'nova1234';
      fixture.componentInstance.onSubmit();

      expect(notificationService.success).toHaveBeenCalledWith('Senha alterada com sucesso.');
      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
      expect(fixture.componentInstance.loading()).toBe(false);
    });
  });
});
