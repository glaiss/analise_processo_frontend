import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/services/auth.service';
import { of } from 'rxjs';

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
});
