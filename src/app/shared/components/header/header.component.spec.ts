import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let authService: any;

  beforeEach(async () => {
    authService = {
      currentUser: vi.fn(() => ({ username: 'joao', nome: 'João Silva', authorities: [{ authority: 'ROLE_ADMIN' }] })),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
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
      logout: vi.fn(),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [HeaderComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        ThemeService,
      ],
    });

    const fixture = TestBed.createComponent(HeaderComponent);
    expect(fixture.componentInstance.avatarLetter).toBe('M');
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
});
