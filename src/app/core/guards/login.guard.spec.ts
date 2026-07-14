import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { loginGuard } from './login.guard';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/usuarios`;

describe('loginGuard', () => {
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

  it('should redirect to dashboard when already authenticated', async () => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(true);

    const result = await TestBed.runInInjectionContext(async () => loginGuard({} as any, {} as any));
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should check session and redirect to dashboard if valid', async () => new Promise<void>(done => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);

    const result$ = TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any) as any);
    result$.subscribe((result: boolean) => {
      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      done();
    });

    httpMock.expectOne(`${API_URL}/me`).flush({
      username: 'joao', authorities: [{ authority: 'ROLE_ADMIN' }]
    });
  }));

  it('should allow access to login when session check fails', async () => new Promise<void>(done => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);

    const result$ = TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any) as any);
    result$.subscribe((result: boolean) => {
      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });

    httpMock.expectOne(`${API_URL}/me`).error(new ProgressEvent('error'));
  }));

  it('should allow access to login when session returns null', async () => new Promise<void>(done => {
    vi.spyOn(authService, 'isAuthenticated').mockReturnValue(false);

    const result$ = TestBed.runInInjectionContext(() => loginGuard({} as any, {} as any) as any);
    result$.subscribe((result: boolean) => {
      expect(result).toBe(true);
      done();
    });

    httpMock.expectOne(`${API_URL}/me`).flush(null);
  }));
});
