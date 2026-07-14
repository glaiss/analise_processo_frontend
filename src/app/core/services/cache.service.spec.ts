import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CacheService, CacheMap } from './cache.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/administracao/cache`;

describe('CacheService', () => {
  let service: CacheService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CacheService],
    });
    service = TestBed.inject(CacheService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('listarCaches should GET caches', () => {
    const mockResponse: CacheMap = {
      processos: {
        size: 10,
        chaves: ['key1'],
        estatisticas: { hitCount: 5, missCount: 2, loadSuccessCount: 3, evictionCount: 0, hitRate: 0.7 }
      }
    };

    service.listarCaches().subscribe(result => {
      expect(result).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
