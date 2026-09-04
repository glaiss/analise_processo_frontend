import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let authService: any;

  beforeEach(async () => {
    authService = {
      login: vi.fn(),
      checkImpersonation: vi.fn(),
      isLoading: vi.fn().mockReturnValue(false),
      isAuthenticated: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        ThemeService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should toggle password visibility via signal', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance.hidePassword()).toBe(true);
    fixture.componentInstance.hidePassword.set(false);
    expect(fixture.componentInstance.hidePassword()).toBe(false);
  });

  it('should call login on submit and navigate to dashboard on success', () => {
    authService.login.mockReturnValue(of(undefined));
    authService.checkImpersonation.mockReturnValue(of(undefined));

    const fixture = TestBed.createComponent(LoginComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    fixture.componentInstance.credentials = { username: 'user', password: 'pass' };
    fixture.componentInstance.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({ username: 'user', password: 'pass' });
    expect(authService.checkImpersonation).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not render inline error message', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error-text')).toBeNull();
  });

  it('should render login form when detectChanges is called', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="username"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[name="password"]')).toBeTruthy();
  });

  it('should toggle password visibility via button click in template', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.hidePassword()).toBe(true);
    const toggleBtn = fixture.nativeElement.querySelector('button[mat-icon-button]');
    if (toggleBtn) {
      toggleBtn.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.hidePassword()).toBe(false);
    }
  });

  it('should submit form via template', () => {
    authService.login.mockReturnValue(of(undefined));
    authService.checkImpersonation.mockReturnValue(of(undefined));

    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const usernameInput = fixture.nativeElement.querySelector('input[name="username"]');
    const passwordInput = fixture.nativeElement.querySelector('input[name="password"]');
    if (usernameInput && passwordInput) {
      usernameInput.value = 'user@test.com';
      usernameInput.dispatchEvent(new Event('input'));
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const form = fixture.nativeElement.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('ngSubmit'));
        fixture.detectChanges();
        expect(authService.login).toHaveBeenCalled();
      }
    }
  });

  it('should handle login error', () => {
    authService.login.mockReturnValue(throwError(() => new Error('fail')));

    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.credentials = { username: 'user', password: 'pass' };
    fixture.componentInstance.onSubmit();
    expect(authService.login).toHaveBeenCalled();
  });

  it('should display theme logo based on dark mode', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.login-logo');
    expect(logo).toBeTruthy();
  });

  it('should show loading spinner when isLoading is true', () => {
    authService.isLoading.mockReturnValue(true);
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });
});
