import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DistributionService } from './distribution.service';
import { StatusAtribuicao } from '../models/processo/enums.model';
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
    it('should append numero filter', () => {
      service.getMeusProcessos(0, 20, { numero: '123' }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${API_URL}/meus-processos`);
      expect(req.request.params.get('numero')).toBe('123');
      req.flush({ content: [] });
    });
    it('should append niveis filter', () => {
      service.getMeusProcessos(0, 20, { niveis: ['ALTO', 'MEDIO'] }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${API_URL}/meus-processos`);
      expect(req.request.params.getAll('niveis')).toEqual(['ALTO', 'MEDIO']);
      req.flush({ content: [] });
    });
    it('should append status filter', () => {
      service.getMeusProcessos(0, 20, {
        status: [StatusAtribuicao.ATRIBUIDO, StatusAtribuicao.EM_CONVERSA],
      }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${API_URL}/meus-processos`);
      expect(req.request.params.getAll('status')).toEqual(['ATRIBUIDO', 'EM_CONVERSA']);
      req.flush({ content: [] });
    });
    it('should append tribunal filter', () => {
      service.getMeusProcessos(0, 20, { tribunal: 'TJSP' }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${API_URL}/meus-processos`);
      expect(req.request.params.get('tribunal')).toBe('TJSP');
      req.flush({ content: [] });
    });
    it('should append assunto filter', () => {
      service.getMeusProcessos(0, 20, { assunto: 'Direito Civil' }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${API_URL}/meus-processos`);
      expect(req.request.params.get('assunto')).toBe('Direito Civil');
      req.flush({ content: [] });
    });
    it('should append situacao filter', () => {
      service.getMeusProcessos(0, 20, {
        situacao: ['EM_ENRIQUECIMENTO', 'ENRIQUECIDO'],
      }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${API_URL}/meus-processos`);
      expect(req.request.params.getAll('situacao')).toEqual(['EM_ENRIQUECIMENTO', 'ENRIQUECIDO']);
      req.flush({ content: [] });
    });
    it('should append all filters together', () => {
      service.getMeusProcessos(0, 20, {
        numero: '123',
        niveis: ['ALTO'],
        status: [StatusAtribuicao.ATRIBUIDO],
        tribunal: 'TJSP',
        assunto: 'Civil',
        situacao: ['ENRIQUECIDO'],
      }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${API_URL}/meus-processos`);
      expect(req.request.params.get('numero')).toBe('123');
      expect(req.request.params.getAll('niveis')).toEqual(['ALTO']);
      expect(req.request.params.getAll('status')).toEqual(['ATRIBUIDO']);
      expect(req.request.params.get('tribunal')).toBe('TJSP');
      expect(req.request.params.get('assunto')).toBe('Civil');
      expect(req.request.params.getAll('situacao')).toEqual(['ENRIQUECIDO']);
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
    it('should append filter params', () => {
      service.getProcessosEquipe(0, 5, { niveis: ['BAIXO'] }).subscribe();
      const req = httpMock.expectOne((r) => r.url === `${API_URL}/equipe`);
      expect(req.request.params.getAll('niveis')).toEqual(['BAIXO']);
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
