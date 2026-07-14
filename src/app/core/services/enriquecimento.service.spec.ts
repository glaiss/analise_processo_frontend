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
});
