import { TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
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
});
