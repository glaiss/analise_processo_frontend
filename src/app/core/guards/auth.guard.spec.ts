import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/usuarios`;

describe('authGuard', () => {
  let router: any;
  let authService: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        { provide: Router, useValue: router },
      ],
    });

    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should allow activation when user is already authenticated', () => {
    const user = { username: 'joao', authorities: [{ authority: 'ROLE_ADMIN' }] };
    (authService as any).user.set(user);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(true);
  });

  it('should check session when not authenticated', () => new Promise<void>(done => {
    (authService as any).user.set(null);

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as any;
    result$.subscribe((result: boolean) => {
      expect(result).toBe(true);
      expect(authService.isAuthenticated()).toBe(true);
      done();
    });

    httpMock.expectOne(`${API_URL}/me`).flush({
      username: 'joao', authorities: [{ authority: 'ROLE_ADMIN' }]
    });
  }));

  it('should redirect to login when session check fails', () => new Promise<void>(done => {
    (authService as any).user.set(null);

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as any;
    result$.subscribe((result: boolean) => {
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });

    httpMock.expectOne(`${API_URL}/me`).error(new ProgressEvent('error'));
  }));

  it('should redirect to login when session returns null', () => new Promise<void>(done => {
    (authService as any).user.set(null);

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as any;
    result$.subscribe((result: boolean) => {
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });

    httpMock.expectOne(`${API_URL}/me`).flush(null);
  }));
});
