import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EquipeService } from './equipe.service';
import { environment } from '../../../environments/environment';
const API_URL = `${environment.apiUrl}/equipes`;
describe('EquipeService', () => {
  let service: EquipeService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), EquipeService],
    });
    service = TestBed.inject(EquipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('getEquipes', () => {
    it('should GET equipes with pagination', () => {
      service.getEquipes(0, 20).subscribe();
      const req = httpMock.expectOne(`${API_URL}?page=0&size=20`);
      expect(req.request.method).toBe('GET');
      req.flush({ content: [] });
    });
  });
  describe('getEquipesAtivas', () => {
    it('should GET ativas with pagination', () => {
      service.getEquipesAtivas(1, 10).subscribe();
      const req = httpMock.expectOne(`${API_URL}/ativas?page=1&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush({ content: [] });
    });
  });
  describe('criarEquipe', () => {
    it('should POST new equipe', () => {
      const equipe = { nome: 'Nova Equipe', ativo: true };
      service.criarEquipe(equipe).subscribe();
      const req = httpMock.expectOne(API_URL);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(equipe);
      req.flush({ id: '1', ...equipe });
    });
  });
});
