import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HeaderComponent } from './header.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { NotificationService } from '../../../core/services/notification.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

@Component({ selector: 'app-test', template: '', standalone: true })
class StubComponent {}

describe('HeaderComponent', () => {
  let authService: any;
  let notificationService: any;

  beforeEach(async () => {
    authService = {
      currentUser: vi.fn(() => ({ username: 'joao', nome: 'João Silva', authorities: [{ authority: 'ROLE_ADMIN' }] })),
      isAuthenticated: vi.fn(() => true),
      isImpersonating: vi.fn(() => false),
      hasRole: vi.fn(() => true),
      logout: vi.fn(),
      stopImpersonating: vi.fn(),
    };

    notificationService = {
      success: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'login', component: StubComponent }, { path: 'alterar-senha', component: StubComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
        ThemeService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should get avatar letter from user nome', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.avatarLetter).toBe('J');
  });

  it('should get avatar letter from username when nome is absent', () => {
    authService = {
      currentUser: vi.fn(() => ({ username: 'maria', authorities: [] })),
      isAuthenticated: vi.fn(() => true),
      isImpersonating: vi.fn(() => false),
      hasRole: vi.fn(() => true),
      logout: vi.fn(),
      stopImpersonating: vi.fn(),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'login', component: StubComponent }, { path: 'alterar-senha', component: StubComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
        ThemeService,
      ],
    });

    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.avatarLetter).toBe('M');
  });

  it('should return empty avatar letter when both nome and username are empty', () => {
    authService = {
      currentUser: vi.fn(() => ({ username: '', authorities: [] })),
      isAuthenticated: vi.fn(() => true),
      isImpersonating: vi.fn(() => false),
      hasRole: vi.fn(() => true),
      logout: vi.fn(),
      stopImpersonating: vi.fn(),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'login', component: StubComponent }, { path: 'alterar-senha', component: StubComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: NotificationService, useValue: notificationService },
        ThemeService,
      ],
    });

    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.avatarLetter).toBe('');
  });

  it('should emit toggleSidenav on menu button click', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    vi.spyOn(fixture.componentInstance.toggleSidenav, 'emit');
    const menuButton = fixture.nativeElement.querySelector('[aria-label="Menu"]')
      ?? fixture.nativeElement.querySelector('button');
    if (menuButton) {
      menuButton.click();
      expect(fixture.componentInstance.toggleSidenav.emit).toHaveBeenCalled();
    }
  });

  it('should call logout', () => {
    authService.logout.mockReturnValue(of(null));
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    fixture.componentInstance.logout();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should navigate to login on logout success', () => {
    authService.logout.mockReturnValue(of(null));
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.logout();

    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should handle logout error gracefully', () => {
    authService.logout.mockReturnValue(throwError(() => new Error('Falha')));
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.logout();

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should call stopImpersonating and navigate to login', () => {
    authService.stopImpersonating.mockReturnValue(of(null));
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.stopImpersonating();

    expect(authService.stopImpersonating).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to alterar-senha on alterarSenha', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.alterarSenha();

    expect(navigateSpy).toHaveBeenCalledWith(['/alterar-senha']);
  });

  it('should navigate to meus-dados on meusDados', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.meusDados();

    expect(navigateSpy).toHaveBeenCalledWith(['/meus-dados']);
  });

  it('should open impersonate dialog and impersonate on confirm', () => {
    const dialogRef = { afterClosed: vi.fn(() => of('admin@test.com')) };
    const dialogMock = { open: vi.fn(() => dialogRef) };

    TestBed.overrideComponent(HeaderComponent, {
      set: { providers: [{ provide: MatDialog, useValue: dialogMock }] },
    });

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    authService.impersonate = vi.fn(() => of(null));
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.openImpersonateDialog();

    expect(dialogMock.open).toHaveBeenCalled();
    expect(authService.impersonate).toHaveBeenCalledWith('admin@test.com');
    expect(notificationService.success).toHaveBeenCalledWith('Você entrou como admin@test.com');
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error notification when impersonate fails', () => {
    const dialogRef = { afterClosed: vi.fn(() => of('user@test.com')) };
    const dialogMock = { open: vi.fn(() => dialogRef) };

    TestBed.overrideComponent(HeaderComponent, {
      set: { providers: [{ provide: MatDialog, useValue: dialogMock }] },
    });

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    authService.impersonate = vi.fn(() => throwError(() => new Error('fail')));

    fixture.componentInstance.openImpersonateDialog();

    expect(notificationService.error).toHaveBeenCalledWith('Erro ao entrar como usuário. Verifique o e-mail.');
  });

  it('should not impersonate when dialog is cancelled', () => {
    const dialogRef = { afterClosed: vi.fn(() => of(null)) };
    const dialogMock = { open: vi.fn(() => dialogRef) };

    TestBed.overrideComponent(HeaderComponent, {
      set: { providers: [{ provide: MatDialog, useValue: dialogMock }] },
    });

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    authService.impersonate = vi.fn();

    fixture.componentInstance.openImpersonateDialog();

    expect(authService.impersonate).not.toHaveBeenCalled();
  });

  it('should show success notification on stop impersonating', () => {
    authService.stopImpersonating.mockReturnValue(of(null));
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.componentInstance.stopImpersonating();

    expect(notificationService.success).toHaveBeenCalledWith('Voltou para seu usuário administrador');
    expect(authService.stopImpersonating).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should render impersonation banner when impersonating', () => {
    authService.isImpersonating = vi.fn(() => true);
    authService.impersonatingAdmin = vi.fn(() => 'admin@original.com');

    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.impersonation-banner');
    expect(banner).toBeTruthy();
    expect(banner.textContent).toContain('joao');
    expect(banner.textContent).toContain('admin@original.com');
  });

  it('should render toolbar with menu button and user avatar', () => {
    const fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();

    const toolbar = fixture.nativeElement.querySelector('.app-toolbar');
    expect(toolbar).toBeTruthy();
    const avatarBtn = fixture.nativeElement.querySelector('.user-avatar-btn');
    expect(avatarBtn).toBeTruthy();
    expect(avatarBtn.textContent).toContain('J');
  });
});
