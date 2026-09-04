import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, User } from './auth.service';
import { environment } from '../../../environments/environment';
const USER_KEY = 'auth_user';
const API_URL = `${environment.apiUrl}/usuarios`;
function createMockUser(overrides?: Partial<User>): User {
  return {
    username: 'joao',
    nome: 'João Silva',
    equipe: 'Equipe A',
    roles: ['ROLE_ADMIN'],
    ...overrides,
  };
}
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('initial state', () => {
    it('should have null user when no session stored', () => {
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
    it('should restore user from sessionStorage on init', () => {
      TestBed.resetTestingModule();
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
      });
      const newService = TestBed.inject(AuthService);
      expect(newService.currentUser()?.username).toBe('joao');
      expect(newService.isAuthenticated()).toBe(true);
    });
  });
  describe('hasRole', () => {
    it('should return false when no user is logged in', () => {
      expect(service.hasRole('ADMIN')).toBe(false);
    });
    it('should return true when user has matching authority', () => {
      TestBed.resetTestingModule();
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
      });
      const svc = TestBed.inject(AuthService);
      expect(svc.hasRole('ADMIN')).toBe(true);
      expect(svc.hasRole('ROLE_ADMIN')).toBe(true);
    });
    it('should return false when user does not have the role', () => {
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      const svc = TestBed.inject(AuthService);
      expect(svc.hasRole('GESTOR')).toBe(false);
    });
  });
  describe('login', () => {
    it('should POST credentials and save user on success', () => {
      const credentials = { username: 'joao', password: '123' };
      const mockUser = createMockUser();
      service.login(credentials).subscribe((user) => {
        expect(user).toEqual(mockUser);
      });
      const req = httpMock.expectOne(`${API_URL}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
      req.flush(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBe(true);
      expect(JSON.parse(sessionStorage.getItem(USER_KEY)!)).toEqual(mockUser);
    });
    it('should set loading state during login', () => {
      const credentials = { username: 'joao', password: '123' };
      service.login(credentials).subscribe();
      expect(service.isLoading()).toBe(true);
      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush(createMockUser());
      expect(service.isLoading()).toBe(false);
    });
    it('should rethrow error on login failure', () => {
      const credentials = { username: 'joao', password: 'wrong' };
      service.login(credentials).subscribe({
        error: (err) => {
          expect(err.status).toBe(401);
        },
      });
      const req = httpMock.expectOne(`${API_URL}/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      expect(service.isLoading()).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
    });
  });
  describe('logout', () => {
    it('should POST logout and clear session', () => {
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      const svc = TestBed.inject(AuthService);
      svc.logout().subscribe(() => {
        expect(svc.currentUser()).toBeNull();
        expect(svc.isAuthenticated()).toBe(false);
      });
      const req = httpMock.expectOne(`${API_URL}/logout`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
    it('should clear session even if logout request fails', () => {
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      const svc = TestBed.inject(AuthService);
      svc.logout().subscribe(() => {
        expect(svc.currentUser()).toBeNull();
      });
      httpMock.expectOne(`${API_URL}/logout`).error(new ProgressEvent('error'));
    });
  });
  describe('checkSession', () => {
    it('should GET /me and save user when session is valid', () => {
      const user = createMockUser();
      service.checkSession().subscribe((result) => {
        expect(result).toEqual(user);
      });
      const req = httpMock.expectOne(`${API_URL}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(user);
      expect(service.currentUser()).toEqual(user);
      expect(service.isAuthenticated()).toBe(true);
    });
    it('should return null and clear session when /me fails', () => {
      service.checkSession().subscribe((result) => {
        expect(result).toBeNull();
      });
      httpMock.expectOne(`${API_URL}/me`).error(new ProgressEvent('error'));
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });
  describe('getFromSession (SSR)', () => {
    it('should return null when not in browser', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          AuthService,
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });
      const svc = TestBed.inject(AuthService);
      const user = (svc as any).getFromSession('auth_user');
      expect(user).toBeNull();
    });
  });
  describe('clearLocalSession', () => {
    it('should clear user signal and remove from storage', () => {
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      localStorage.setItem('XSRF-TOKEN', 'token123');
      service.clearLocalSession();
      expect(service.currentUser()).toBeNull();
      expect(sessionStorage.getItem(USER_KEY)).toBeNull();
      expect(localStorage.getItem('XSRF-TOKEN')).toBeNull();
    });
  });
  describe('checkImpersonation', () => {
    it('should set origin when result has origin', () => {
      service.checkImpersonation().subscribe();
      const req = httpMock.expectOne(`${API_URL}/impersonating-origin`);
      expect(req.request.method).toBe('GET');
      req.flush({ origin: 'admin_user' });
      expect(service.isImpersonating()).toBe(true);
      expect(service.impersonatingAdmin()).toBe('admin_user');
    });
    it('should clear origin when result has no origin', () => {
      service.checkImpersonation().subscribe();
      httpMock.expectOne(`${API_URL}/impersonating-origin`).flush({ origin: null });
      expect(service.isImpersonating()).toBe(false);
      expect(service.impersonatingAdmin()).toBeNull();
    });
    it('should gracefully handle error on checkImpersonation', () => {
      service.checkImpersonation().subscribe({
        next: (result) => {
          expect(result).toBeNull();
        },
      });
      httpMock.expectOne(`${API_URL}/impersonating-origin`).error(new ProgressEvent('error'));
      expect(service.isImpersonating()).toBe(false);
    });
  });
  describe('stopImpersonating', () => {
    it('should POST stop-impersonating and clear session', () => {
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      sessionStorage.setItem('impersonating_origin', 'admin_user');
      service.stopImpersonating().subscribe(() => {
        expect(service.currentUser()).toBeNull();
        expect(service.isImpersonating()).toBe(false);
      });
      const req = httpMock.expectOne(`${API_URL}/stop-impersonating`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });
  describe('alterarSenha', () => {
    it('should PUT new password', () => {
      service.alterarSenha('senhaAtual', 'senhaNova').subscribe();
      const req = httpMock.expectOne(`${API_URL}/senha`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ senhaAtual: 'senhaAtual', senhaNova: 'senhaNova' });
      req.flush(null);
    });
  });
  describe('impersonate', () => {
    it('should POST impersonate and save user + checkImpersonation', () => {
      const mockUser = createMockUser();
      service.impersonate('target@email.com').subscribe((user) => {
        expect(user).toEqual(mockUser);
      });
      const req = httpMock.expectOne(`${API_URL}/impersonate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ targetEmail: 'target@email.com' });
      req.flush(mockUser);
      expect(service.currentUser()).toEqual(mockUser);
      const impReq = httpMock.expectOne(`${API_URL}/impersonating-origin`);
      impReq.flush({ origin: 'target@email.com' });
      expect(service.isImpersonating()).toBe(true);
    });
  });
  describe('alterarNome', () => {
    it('should PUT new name and update session', () => {
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      const updatedUser = createMockUser({ nome: 'Novo Nome' });
      service.alterarNome('Novo Nome').subscribe((user) => {
        expect(user.nome).toBe('Novo Nome');
      });
      const req = httpMock.expectOne(`${API_URL}/nome`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ nome: 'Novo Nome' });
      req.flush(updatedUser);
      expect(service.currentUser()?.nome).toBe('Novo Nome');
    });
  });
  describe('alterarEmail', () => {
    it('should PUT new email and update session', () => {
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      const updatedUser = createMockUser({ username: 'novo@email.com' });
      service.alterarEmail('novo@email.com').subscribe((user) => {
        expect(user.username).toBe('novo@email.com');
      });
      const req = httpMock.expectOne(`${API_URL}/email`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ email: 'novo@email.com' });
      req.flush(updatedUser);
      expect(service.currentUser()?.username).toBe('novo@email.com');
    });
  });
  describe('stopImpersonating (with user returned)', () => {
    it('should save user and clear impersonation when user is returned', () => {
      sessionStorage.setItem(USER_KEY, JSON.stringify(createMockUser()));
      sessionStorage.setItem('impersonating_origin', 'admin_user');
      service.stopImpersonating().subscribe(() => {
        expect(service.isImpersonating()).toBe(false);
      });
      const req = httpMock.expectOne(`${API_URL}/stop-impersonating`);
      req.flush(createMockUser({ username: 'restored' }));
      expect(service.currentUser()?.username).toBe('restored');
      expect(service.isImpersonating()).toBe(false);
    });
  });
  describe('setInSession (SSR)', () => {
    it('should not write to sessionStorage when not in browser', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          AuthService,
          { provide: PLATFORM_ID, useValue: 'server' },
        ],
      });
      const svc = TestBed.inject(AuthService);
      (svc as any).setInSession('test_key', 'test_value');
      expect(sessionStorage.getItem('test_key')).toBeNull();
    });
  });
});
