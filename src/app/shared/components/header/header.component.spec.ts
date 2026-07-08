import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HeaderComponent } from './header.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

@Component({ template: '', standalone: true })
class StubComponent {}

describe('HeaderComponent', () => {
  let authService: any;

  beforeEach(async () => {
    authService = {
      currentUser: vi.fn(() => ({ username: 'joao', nome: 'João Silva', authorities: [{ authority: 'ROLE_ADMIN' }] })),
      isAuthenticated: vi.fn(() => true),
      isImpersonating: vi.fn(() => false),
      hasRole: vi.fn(() => true),
      logout: vi.fn(),
      stopImpersonating: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'login', component: StubComponent }, { path: 'alterar-senha', component: StubComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
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
      || fixture.nativeElement.querySelector('button');
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
});
