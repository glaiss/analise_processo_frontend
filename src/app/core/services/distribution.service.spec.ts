import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DistributionService } from './distribution.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/distribuicao`;

describe('DistributionService', () => {
  let service: DistributionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), DistributionService],
    });
    service = TestBed.inject(DistributionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getMeusProcessos', () => {
    it('should GET meus-processos with pagination', () => {
      service.getMeusProcessos(0, 20).subscribe();
      const req = httpMock.expectOne(`${API_URL}/meus-processos?page=0&size=20`);
      expect(req.request.method).toBe('GET');
      req.flush({ content: [] });
    });
  });

  describe('getProcessosEquipe', () => {
    it('should GET equipe with pagination', () => {
      service.getProcessosEquipe(1, 10).subscribe();
      const req = httpMock.expectOne(`${API_URL}/equipe?page=1&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush({ content: [] });
    });
  });

  describe('executarDistribuicao', () => {
    it('should POST executar', () => {
      service.executarDistribuicao().subscribe();
      const req = httpMock.expectOne(`${API_URL}/executar`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('executarDistribuicaoPorEquipe', () => {
    it('should POST distribuir for equipe', () => {
      service.executarDistribuicaoPorEquipe('equipe-1').subscribe();
      const req = httpMock.expectOne(`${API_URL}/equipe-1/distribuir`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });

  describe('redirecionarProcessos', () => {
    it('should POST redirecionar with request body', () => {
      const request = { tipo: 'EQUIPE' as const, equipeId: 'equipe-1' };
      service.redirecionarProcessos(request).subscribe();
      const req = httpMock.expectOne(`${API_URL}/redirecionar`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(null);
    });
  });
});
