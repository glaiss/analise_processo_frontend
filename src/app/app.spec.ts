import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { of, Subject } from 'rxjs';

@Component({ template: '', standalone: true })
class StubComponent {}

describe('App', () => {
  let authService: any;

  beforeEach(async () => {
    authService = {
      checkSession: vi.fn(() => of(null)),
      checkImpersonation: vi.fn(() => of(null)),
      isAuthenticated: vi.fn(() => true),
      hasRole: vi.fn(() => false),
      isImpersonating: vi.fn(() => false),
      impersonatingAdmin: vi.fn(() => null),
      currentUser: vi.fn(() => ({ nome: 'Test', username: 'test', equipe: 'Test Team' })),
      logout: vi.fn(() => of(null)),
      stopImpersonating: vi.fn(() => of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [App, NoopAnimationsModule],
      providers: [
        provideRouter([{ path: 'login', component: StubComponent }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should show menu by default when not on login route', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    expect(component.showMenu).toBe(true);
  });

  it('should call checkSession and checkImpersonation on init', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.ngOnInit();
    expect(authService.checkSession).toHaveBeenCalled();
  });

  it('should hide menu when navigating to login route', () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const events$ = of(new NavigationEnd(1, '/login', '/login'));
    Object.defineProperty(router, 'events', { get: () => events$ });
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.showMenu).toBe(false);
  });

  it('should show menu when navigating away from login route', () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const events$ = of(new NavigationEnd(1, '/dashboard', '/dashboard'));
    Object.defineProperty(router, 'events', { get: () => events$ });
    fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.showMenu).toBe(true);
  });

  it('should call checkImpersonation after navigation', () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const events$ = of(new NavigationEnd(1, '/login', '/login'));
    Object.defineProperty(router, 'events', { get: () => events$ });
    authService.checkImpersonation.mockClear();
    fixture.componentInstance.ngOnInit();
    expect(authService.checkImpersonation).toHaveBeenCalled();
  });

  it('should call toggleSidenav when toggled', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    const sidenavSpy = { toggle: vi.fn() };
    component.sidenav = sidenavSpy as any;
    component.toggleSidenav();
    expect(sidenavSpy.toggle).toHaveBeenCalled();
  });

  it('should not throw when toggleSidenav is called without sidenav', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    component.sidenav = undefined as any;
    expect(() => component.toggleSidenav()).not.toThrow();
  });

  it('should render sidenav and header when authenticated and menu is shown', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.showMenu = true;
    authService.isAuthenticated.mockReturnValue(true);
    fixture.detectChanges();
    const sidenav = fixture.nativeElement.querySelector('mat-sidenav');
    const header = fixture.nativeElement.querySelector('app-header');
    expect(sidenav).toBeTruthy();
    expect(header).toBeTruthy();
  });

  it('should not render sidenav and header when showMenu is false', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.showMenu = false;
    authService.isAuthenticated.mockReturnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-sidenav')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('app-header')).toBeFalsy();
  });

  it('should not render sidenav and header when not authenticated', () => {
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.showMenu = true;
    authService.isAuthenticated.mockReturnValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-sidenav')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('app-header')).toBeFalsy();
  });
});
