import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EtiquetaService } from './etiqueta.service';
import { EtiquetaDTO, EtiquetaRequestDTO } from '../models/processo/etiqueta.model';
import { environment } from '../../../environments/environment';

describe('EtiquetaService', () => {
  let service: EtiquetaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/v1/etiquetas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), EtiquetaService],
    });
    service = TestBed.inject(EtiquetaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listar', () => {
    it('should return a list of etiquetas', () => {
      const mockEtiquetas: EtiquetaDTO[] = [
        { id: '1', nome: 'Alta Prioridade', cor: '#F44336', tipo: 'GLOBAL', apelido: 'AP', usuarioNome: null },
        { id: '2', nome: 'Urgente', cor: '#E91E63', tipo: 'USUARIO', apelido: 'UR', usuarioNome: 'joao' },
      ];

      service.listar().subscribe((etiquetas) => {
        expect(etiquetas.length).toBe(2);
        expect(etiquetas).toEqual(mockEtiquetas);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockEtiquetas);
    });

    it('should handle empty list', () => {
      service.listar().subscribe((etiquetas) => {
        expect(etiquetas.length).toBe(0);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush([]);
    });
  });

  describe('criar', () => {
    it('should create a new etiqueta', () => {
      const request: EtiquetaRequestDTO = { nome: 'Nova Etiqueta', cor: '#2196F3' };
      const mockResponse: EtiquetaDTO = {
        id: '3',
        nome: 'Nova Etiqueta',
        cor: '#2196F3',
        tipo: 'GLOBAL',
        apelido: 'NE',
        usuarioNome: null,
      };

      service.criar(request).subscribe((etiqueta) => {
        expect(etiqueta).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('atualizar', () => {
    it('should update an existing etiqueta', () => {
      const id = '1';
      const request: EtiquetaRequestDTO = { nome: 'Etiqueta Atualizada', cor: '#4CAF50' };
      const mockResponse: EtiquetaDTO = {
        id: '1',
        nome: 'Etiqueta Atualizada',
        cor: '#4CAF50',
        tipo: 'GLOBAL',
        apelido: 'EA',
        usuarioNome: null,
      };

      service.atualizar(id, request).subscribe((etiqueta) => {
        expect(etiqueta).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush(mockResponse);
    });
  });

  describe('deletar', () => {
    it('should delete an etiqueta', () => {
      const id = '1';

      service.deletar(id).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('listarPorProcesso', () => {
    it('should return etiquetas for a specific process', () => {
      const processoNumero = '1234567-89.2024.8.26.0000';
      const mockEtiquetas: EtiquetaDTO[] = [
        { id: '1', nome: 'Alta Prioridade', cor: '#F44336', tipo: 'GLOBAL', apelido: 'AP', usuarioNome: null },
      ];

      service.listarPorProcesso(processoNumero).subscribe((etiquetas) => {
        expect(etiquetas.length).toBe(1);
        expect(etiquetas).toEqual(mockEtiquetas);
      });

      const req = httpMock.expectOne(`${apiUrl}/processo/${processoNumero}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEtiquetas);
    });

    it('should handle empty list for process', () => {
      const processoNumero = '1234567-89.2024.8.26.0000';

      service.listarPorProcesso(processoNumero).subscribe((etiquetas) => {
        expect(etiquetas.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/processo/${processoNumero}`);
      req.flush([]);
    });
  });

  describe('vincularProcesso', () => {
    it('should link etiquetas to a process', () => {
      const processoNumero = '1234567-89.2024.8.26.0000';
      const etiquetaIds = ['1', '2'];

      service.vincularProcesso(processoNumero, etiquetaIds).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/processo/${processoNumero}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(etiquetaIds);
      req.flush(null);
    });
  });

  describe('desvincularProcesso', () => {
    it('should unlink an etiqueta from a process', () => {
      const processoNumero = '1234567-89.2024.8.26.0000';
      const etiquetaId = '1';

      service.desvincularProcesso(processoNumero, etiquetaId).subscribe((response) => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/processo/${processoNumero}/${etiquetaId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
