import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let router: any;
  let authService: AuthService;

  beforeEach(() => {
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MatSnackBarModule],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        AuthService,
        { provide: Router, useValue: router },
        { provide: NotificationService, useValue: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), success: vi.fn() } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => httpMock.verify());

  it('should add withCredentials to all requests', () => {
    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should handle 401 and redirect to login when not login/me endpoint', () => {
    vi.spyOn(authService, 'clearLocalSession');
    http.get('/api/processos').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/processos');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authService.clearLocalSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should show invalid credentials notification on 401 for login endpoint', () => {
    const notification = TestBed.inject(NotificationService);
    http.post('/api/usuarios/login', {}).subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/usuarios/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(notification.error).toHaveBeenCalledWith('Usuário ou senha inválidos.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not redirect on 401 for /me endpoint', () => {
    http.get('/api/usuarios/me').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/usuarios/me');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle status 0 as offline', () => {
    http.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/test');
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
  });

  it('should handle 500 with ProblemDetail body', () => {
    http.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/test');
    req.flush({
      type: 'about:blank',
      title: 'Erro Interno',
      status: 500,
      detail: 'Falha no servidor'
    }, { status: 500, statusText: 'Server Error' });
  });

  it('should handle 500 without ProblemDetail body', () => {
    const notification = TestBed.inject(NotificationService);
    http.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Internal error', { status: 500, statusText: 'Server Error' });

    expect(notification.error).toHaveBeenCalledWith('Sistema indisponível. Por favor, tente novamente mais tarde.');
  });

  it('should handle non-matching status codes', () => {
    const notification = TestBed.inject(NotificationService);
    http.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Redirect', { status: 300, statusText: 'Multiple Choices' });

    expect(notification.error).toHaveBeenCalledWith('Sistema: Http failure response for /api/test: 300 Multiple Choices');
  });

  it('should pass through for logout requests', () => {
    http.post('/api/usuarios/logout', {}).subscribe();
    const req = httpMock.expectOne('/api/usuarios/logout');
    expect(req.request.withCredentials).toBe(true);
    req.flush(null);
  });

  it('should handle 404 for actuator/metrics and rethrow', () => {
    http.get('/api/actuator/metrics/jvm.memory.used').subscribe({
      error: (err) => {
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne('/api/actuator/metrics/jvm.memory.used');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle generic 400 error', () => {
    http.get('/api/test').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });
});
