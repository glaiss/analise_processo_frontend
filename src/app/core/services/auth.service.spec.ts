import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, User } from './auth.service';
import { environment } from '../../../environments/environment';

const USER_KEY = 'auth_user';
const API_URL = `${environment.apiUrl}/usuarios`;

function createMockUser(overrides?: Partial<User>): User {
  return {
    username: 'joao',
    nome: 'João Silva',
    equipe: 'Equipe A',
    authorities: [{ authority: 'ROLE_ADMIN' }],
    ...overrides
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
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
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          AuthService,
        ],
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
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          AuthService,
        ],
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

      service.login(credentials).subscribe(user => {
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
        }
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

      service.checkSession().subscribe(result => {
        expect(result).toEqual(user);
      });

      const req = httpMock.expectOne(`${API_URL}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(user);

      expect(service.currentUser()).toEqual(user);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return null and clear session when /me fails', () => {
      service.checkSession().subscribe(result => {
        expect(result).toBeNull();
      });

      httpMock.expectOne(`${API_URL}/me`).error(new ProgressEvent('error'));
      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
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
});
