import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminSyncService } from './admin-sync.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/sync`;

describe('AdminSyncService', () => {
  let service: AdminSyncService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AdminSyncService],
    });
    service = TestBed.inject(AdminSyncService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('syncMovimentos should POST to /movimentos', () => {
    service.syncMovimentos().subscribe(res => {
      expect(res).toEqual({ status: 'ok', mensagem: 'Movimentos sincronizados' });
    });
    const req = httpMock.expectOne(`${API_URL}/movimentos`);
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'ok', mensagem: 'Movimentos sincronizados' });
  });

  it('syncClasses should POST to /classes', () => {
    service.syncClasses().subscribe(res => {
      expect(res).toEqual({ status: 'ok', mensagem: 'Classes sincronizadas' });
    });
    const req = httpMock.expectOne(`${API_URL}/classes`);
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'ok', mensagem: 'Classes sincronizadas' });
  });

  it('syncAssuntos should POST to /assuntos', () => {
    service.syncAssuntos().subscribe(res => {
      expect(res).toEqual({ status: 'ok', mensagem: 'Assuntos sincronizados' });
    });
    const req = httpMock.expectOne(`${API_URL}/assuntos`);
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'ok', mensagem: 'Assuntos sincronizados' });
  });

  it('syncTudo should POST to /tudo', () => {
    service.syncTudo().subscribe(res => {
      expect(res).toEqual({ status: 'ok', mensagem: 'Tudo sincronizado' });
    });
    const req = httpMock.expectOne(`${API_URL}/tudo`);
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'ok', mensagem: 'Tudo sincronizado' });
  });

  it('syncIngestao should POST to /ingestao/{tribunal} with query params', () => {
    service.syncIngestao('TJSP', 200, 50).subscribe(res => {
      expect(res).toEqual({ status: 'ok', mensagem: 'Ingestão sincronizada' });
    });
    const req = httpMock.expectOne(`${API_URL}/ingestao/TJSP?total=200&size=50`);
    expect(req.request.method).toBe('POST');
    req.flush({ status: 'ok', mensagem: 'Ingestão sincronizada' });
  });
});
