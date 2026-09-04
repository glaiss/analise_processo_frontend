import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EnriquecimentoService } from './enriquecimento.service';
import { environment } from '../../../environments/environment';
const API_URL = `${environment.apiUrl}/enriquecimento`;
describe('EnriquecimentoService', () => {
  let service: EnriquecimentoService;
  let httpMock: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), EnriquecimentoService],
    });
    service = TestBed.inject(EnriquecimentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('processar', () => {
    it('should POST processar', () => {
      service.processar().subscribe();
      const req = httpMock.expectOne(`${API_URL}/processar`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });
  describe('reprocessar', () => {
    it('should POST reprocessar', () => {
      service.reprocessar().subscribe();
      const req = httpMock.expectOne(`${API_URL}/reprocessar`);
      expect(req.request.method).toBe('POST');
      req.flush(null);
    });
  });
  describe('reprocessarPorNumeros', () => {
    it('should POST scraping with numerosProcesso', () => {
      const numeros = ['1234567-89.2024.8.26.0000', '9876543-21.2024.8.26.0001'];
      service.reprocessarPorNumeros(numeros).subscribe((response) => {
        expect(response.resultados.length).toBe(1);
        expect(response.resultados[0].sucesso).toBe(true);
      });
      const req = httpMock.expectOne(`${API_URL}/scraping`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ numerosProcesso: numeros });
      req.flush({ resultados: [{ numeroProcesso: numeros[0], sucesso: true }] });
    });
    it('should handle empty numeros array', () => {
      service.reprocessarPorNumeros([]).subscribe();
      const req = httpMock.expectOne(`${API_URL}/scraping`);
      expect(req.request.body).toEqual({ numerosProcesso: [] });
      req.flush({ resultados: [] });
    });
  });
});
