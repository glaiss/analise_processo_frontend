import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { IngestionService } from './ingestion.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/ingestao`;

describe('IngestionService', () => {
  let service: IngestionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), IngestionService],
    });
    service = TestBed.inject(IngestionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sincronizar', () => {
    it('should POST sync with tribunal, total and size', () => {
      const mockResponse = { status: 'OK', mensagem: 'Sincronizado' };

      service.sincronizar('TJSP', 100, 10).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${API_URL}/sync/TJSP?total=100&size=10`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
