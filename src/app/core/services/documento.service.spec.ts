import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DocumentoService } from './documento.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/v1/analise/processos`;

describe('DocumentoService', () => {
  let service: DocumentoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), DocumentoService],
    });
    service = TestBed.inject(DocumentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.limparCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('upload', () => {
    it('should POST file as FormData', () => {
      const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

      service.upload('123', file).subscribe();

      const req = httpMock.expectOne(`${API_URL}/123/documentos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({ id: 'doc1', nomeArquivo: 'doc.pdf' });
    });

    it('should include isContrato query param when true', () => {
      const file = new File(['content'], 'contrato.pdf', { type: 'application/pdf' });

      service.upload('123', file, true).subscribe();

      const req = httpMock.expectOne(`${API_URL}/123/documentos?isContrato=true`);
      expect(req.request.method).toBe('POST');
      req.flush({ id: 'doc1', nomeArquivo: 'contrato.pdf' });
    });
  });

  describe('listar', () => {
    it('should GET documentos for processo', () => {
      service.listar('123').subscribe();
      const req = httpMock.expectOne(`${API_URL}/123/documentos`);
      expect(req.request.method).toBe('GET');
      req.flush({ content: [] });
    });
  });

  describe('download', () => {
    it('should GET blob with responseType blob', () => {
      const blob = new Blob(['pdf content'], { type: 'application/pdf' });

      service.download('123', 'doc1').subscribe(result => {
        expect(result).toEqual(blob);
      });

      const req = httpMock.expectOne(`${API_URL}/123/documentos/doc1/download`);
      expect(req.request.method).toBe('GET');
      req.flush(blob);
    });

    it('should cache blob and return cached on second call', () => {
      const blob = new Blob(['pdf content'], { type: 'application/pdf' });

      service.download('123', 'doc1').subscribe();
      httpMock.expectOne(`${API_URL}/123/documentos/doc1/download`).flush(blob);

      service.download('123', 'doc1').subscribe(result => {
        expect(result).toEqual(blob);
      });
      httpMock.expectNone(`${API_URL}/123/documentos/doc1/download`);
    });

    it('should clear cache', () => {
      const blob = new Blob(['pdf content'], { type: 'application/pdf' });

      service.download('123', 'doc1').subscribe();
      httpMock.expectOne(`${API_URL}/123/documentos/doc1/download`).flush(blob);

      service.limparCache();

      service.download('123', 'doc1').subscribe();
      httpMock.expectOne(`${API_URL}/123/documentos/doc1/download`).flush(blob);
    });
  });

  describe('getDownloadUrl', () => {
    it('should return the download URL string', () => {
      const url = service.getDownloadUrl('123', 'doc1');
      expect(url).toBe(`${API_URL}/123/documentos/doc1/download`);
    });
  });

  describe('deletar', () => {
    it('should DELETE documento', () => {
      service.deletar('123', 'doc1').subscribe();
      const req = httpMock.expectOne(`${API_URL}/123/documentos/doc1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
