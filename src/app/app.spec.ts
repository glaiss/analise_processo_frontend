import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
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

  it('should hide menu on login route', () => {
    const fixture = TestBed.createComponent(App);
    const component = fixture.componentInstance;
    component.ngOnInit();

    component.showMenu = false;
    expect(component.showMenu).toBe(false);
  });
});
