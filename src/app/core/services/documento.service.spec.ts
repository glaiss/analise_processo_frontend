import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
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
  describe('getPreviewUrl', () => {
    it('should GET preview url for documento', () => {
      service.getPreviewUrl('123', 'doc1').subscribe((result) => {
        expect(result).toEqual({ url: 'https://d123.cloudfront.net/processos/x.pdf?Expires=123&Signature=abc&Key-Pair-Id=K1' });
      });
      const req = httpMock.expectOne(`${API_URL}/123/documentos/doc1/preview-url`);
      expect(req.request.method).toBe('GET');
      req.flush({ url: 'https://d123.cloudfront.net/processos/x.pdf?Expires=123&Signature=abc&Key-Pair-Id=K1' });
    });
    it('should reuse cached preview url while valid', () => {
      const url = `https://d123.cloudfront.net/processos/x.pdf?Expires=${Math.floor(Date.now() / 1000) + 600}&Signature=abc&Key-Pair-Id=K1`;
      service.getPreviewUrl('123', 'doc1').subscribe();
      httpMock.expectOne(`${API_URL}/123/documentos/doc1/preview-url`).flush({ url });
      service.getPreviewUrl('123', 'doc1').subscribe((result) => {
        expect(result).toEqual({ url });
      });
      httpMock.expectNone(`${API_URL}/123/documentos/doc1/preview-url`);
    });
    it('should refetch preview url after expiry', () => {
      const url = `https://d123.cloudfront.net/processos/x.pdf?Expires=${Math.floor(Date.now() / 1000) + 60}&Signature=abc&Key-Pair-Id=K1`;
      service.getPreviewUrl('123', 'doc1').subscribe();
      httpMock.expectOne(`${API_URL}/123/documentos/doc1/preview-url`).flush({ url });
      service.getPreviewUrl('123', 'doc1').subscribe();
      httpMock.expectOne(`${API_URL}/123/documentos/doc1/preview-url`).flush({ url });
    });
    it('should refetch preview url after invalidatePreviewUrl', () => {
      const url = `https://d123.cloudfront.net/processos/x.pdf?Expires=${Math.floor(Date.now() / 1000) + 600}&Signature=abc&Key-Pair-Id=K1`;
      service.getPreviewUrl('123', 'doc1').subscribe();
      httpMock.expectOne(`${API_URL}/123/documentos/doc1/preview-url`).flush({ url });
      service.invalidatePreviewUrl('123', 'doc1');
      service.getPreviewUrl('123', 'doc1').subscribe();
      httpMock.expectOne(`${API_URL}/123/documentos/doc1/preview-url`).flush({ url });
    });
  });
  describe('getDownloadUrl', () => {
    it('should GET signed download url for documento', () => {
      service.getDownloadUrl('123', 'doc1').subscribe((result) => {
        expect(result).toEqual({ url: 'https://d123.cloudfront.net/processos/x.pdf?Expires=123&Signature=abc&Key-Pair-Id=K1' });
      });
      const req = httpMock.expectOne(`${API_URL}/123/documentos/doc1/download-url`);
      expect(req.request.method).toBe('GET');
      req.flush({ url: 'https://d123.cloudfront.net/processos/x.pdf?Expires=123&Signature=abc&Key-Pair-Id=K1' });
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
