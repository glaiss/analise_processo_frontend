import { TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('SidebarComponent', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        ThemeService,
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have a version string', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance.version).toBeDefined();
  });

  it('should navigate when navigate is called', () => {
    const spy = vi.spyOn(router, 'navigate');
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.componentInstance.navigate('/dashboard');
    expect(spy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should render sidebar links', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a[mat-list-item]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render logo', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const logo = fixture.nativeElement.querySelector('.sidebar-logo');
    expect(logo).toBeTruthy();
  });

  it('should render version', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const versionEl = fixture.nativeElement.querySelector('.sidebar-version');
    expect(versionEl).toBeTruthy();
  });

  it('should navigate to dashboard on click', () => {
    const spy = vi.spyOn(router, 'navigate');
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a[mat-list-item]');
    if (links.length > 0) {
      links[0].click();
      expect(spy).toHaveBeenCalled();
    }
  });

  it('should have auth and theme services', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance.auth).toBeTruthy();
    expect(fixture.componentInstance.theme).toBeTruthy();
  });
});
