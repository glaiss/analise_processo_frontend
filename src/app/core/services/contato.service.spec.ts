import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ContatoService } from './contato.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/v1/analise/processos`;

describe('ContatoService', () => {
  let service: ContatoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ContatoService],
    });
    service = TestBed.inject(ContatoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listar', () => {
    it('should GET contatos for processo', () => {
      const mockContatos = [
        { id: '1', tipo: 'WHATSAPP', valor: '11999999999', nome: 'João', principal: true },
      ];

      service.listar('123').subscribe(contatos => {
        expect(contatos).toEqual(mockContatos);
      });

      const req = httpMock.expectOne(`${API_URL}/123/contatos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockContatos);
    });
  });

  it('should handle listar error', () => {
    let error: any;
    service.listar('999').subscribe({
      next: () => { expect(true).toBe(false); },
      error: (err: any) => { error = err; }
    });

    const req = httpMock.expectOne(`${API_URL}/999/contatos`);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    expect(error).toBeTruthy();
  });

  describe('salvar', () => {
    it('should POST contato for processo', () => {
      const payload = { tipo: 'WHATSAPP', valor: '11999999999', nome: 'João', principal: true };

      service.salvar('123', payload).subscribe(contato => {
        expect(contato).toEqual({ id: '1', ...payload });
      });

      const req = httpMock.expectOne(`${API_URL}/123/contatos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ id: '1', ...payload });
    });

    it('should POST contato without optional fields', () => {
      const payload = { tipo: 'EMAIL', valor: 'teste@exemplo.com' };

      service.salvar('123', payload).subscribe();

      const req = httpMock.expectOne(`${API_URL}/123/contatos`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ id: '2', tipo: 'EMAIL', valor: 'teste@exemplo.com' });
    });

    it('should handle salvar error', () => {
      let error: any;
      service.salvar('999', { tipo: 'EMAIL', valor: 'x@y.com' }).subscribe({
        next: () => { expect(true).toBe(false); },
        error: (err: any) => { error = err; }
      });

      const req = httpMock.expectOne(`${API_URL}/999/contatos`);
      req.flush('Bad request', { status: 400, statusText: 'Bad Request' });
      expect(error).toBeTruthy();
    });
  });

  describe('atualizar', () => {
    it('should PUT updated contato for processo', () => {
      const payload = { tipo: 'WHATSAPP' as const, valor: '5511999999999', nome: 'João Atualizado' };

      service.atualizar('123', '1', payload).subscribe(contato => {
        expect(contato).toEqual({ id: '1', ...payload, principal: false });
      });

      const req = httpMock.expectOne(`${API_URL}/123/contatos/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({ id: '1', ...payload, principal: false });
    });

    it('should handle atualizar error', () => {
      let error: any;
      service.atualizar('999', 'x', { tipo: 'EMAIL', valor: 'x@y.com', nome: 'Test' }).subscribe({
        next: () => { expect(true).toBe(false); },
        error: (err: any) => { error = err; }
      });

      const req = httpMock.expectOne(`${API_URL}/999/contatos/x`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
      expect(error).toBeTruthy();
    });
  });

  describe('deletar', () => {
    it('should DELETE contato for processo', () => {
      service.deletar('123', '1').subscribe();

      const req = httpMock.expectOne(`${API_URL}/123/contatos/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle deletar error', () => {
      let error: any;
      service.deletar('999', 'x').subscribe({
        next: () => { expect(true).toBe(false); },
        error: (err: any) => { error = err; }
      });

      const req = httpMock.expectOne(`${API_URL}/999/contatos/x`);
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
      expect(error).toBeTruthy();
    });
  });
});
