import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserService, Role, UsuarioResponse } from './user.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/usuarios`;

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('criarUsuario', () => {
    it('should POST new user', () => {
      const req = { username: 'novo', nome: 'Novo User', password: '123', role: Role.ANALISTA };

      service.criarUsuario(req).subscribe();

      const httpReq = httpMock.expectOne(API_URL);
      expect(httpReq.request.method).toBe('POST');
      expect(httpReq.request.body).toEqual(req);
      httpReq.flush(null);
    });
  });

  describe('getUsuarios', () => {
    it('should GET paginated users', () => {
      const mockPage = {
        content: [{ id: '1', username: 'joao', nome: 'João', role: Role.ADMIN } as UsuarioResponse],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 100,
        first: true,
        last: true,
        empty: false,
      };

      service.getUsuarios().subscribe(page => {
        expect(page).toEqual(mockPage);
      });

      const httpReq = httpMock.expectOne(`${API_URL}?page=0&size=100`);
      expect(httpReq.request.method).toBe('GET');
      httpReq.flush(mockPage);
    });

    it('should use provided page and size', () => {
      service.getUsuarios(2, 50).subscribe();
      httpMock.expectOne(`${API_URL}?page=2&size=50`);
    });
  });

  describe('associarEquipe', () => {
    it('should PUT usuario equipe association', () => {
      service.associarEquipe('user1', 'equipe1').subscribe();
      const req = httpMock.expectOne(`${API_URL}/user1/equipe/equipe1`);
      expect(req.request.method).toBe('PUT');
      req.flush(null);
    });
  });

  describe('desassociarEquipe', () => {
    it('should DELETE usuario equipe association', () => {
      service.desassociarEquipe('user1').subscribe();
      const req = httpMock.expectOne(`${API_URL}/user1/equipe`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
