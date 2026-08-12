import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FinanceiroService } from './financeiro.service';
import { environment } from '../../../environments/environment';

const API_URL = `${environment.apiUrl}/financeiro`;

describe('FinanceiroService', () => {
  let service: FinanceiroService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), FinanceiroService],
    });
    service = TestBed.inject(FinanceiroService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should GET indicadores', () => {
    service.indicadores('2026-01-01', '2026-01-31').subscribe();
    const req = httpMock.expectOne(`${API_URL}/indicadores?inicio=2026-01-01&fim=2026-01-31`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should GET situacao financeira', () => {
    service.situacaoFinanceira('abc-123').subscribe();
    const req = httpMock.expectOne(`${API_URL}/contratos/abc-123/situacao`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should POST fechar contrato', () => {
    const dto = { numeroContrato: 'C-1', modalidade: 'FIXA', valorTotal: 100, parcelas: [] };
    service.fecharContrato(dto as any).subscribe();
    const req = httpMock.expectOne(API_URL + '/contratos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });

  it('should POST fechar contrato para processo', () => {
    const dto = { numeroContrato: 'C-1', modalidade: 'FIXA', valorTotal: 100, parcelas: [] };
    service.fecharContratoParaProcesso('123', dto as any).subscribe();
    const req = httpMock.expectOne(`${API_URL}/contratos/processo/123`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should POST registrar recebimento', () => {
    const dto = { parcelaId: 'p1', valorRecebido: 50, formaPagamento: 'PIX' };
    service.registrarRecebimento(dto as any).subscribe();
    const req = httpMock.expectOne(`${API_URL}/recebimentos`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should GET clientes', () => {
    service.listarClientes(0, 100).subscribe();
    const req = httpMock.expectOne(`${API_URL}/clientes?page=0&size=100`);
    expect(req.request.method).toBe('GET');
    req.flush({ content: [] });
  });

  it('should POST criar cliente', () => {
    const dto = { nome: 'Empresa X' };
    service.criarCliente(dto as any).subscribe();
    const req = httpMock.expectOne(`${API_URL}/clientes`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should GET cliente by id', () => {
    service.buscarCliente('cliente-1').subscribe();
    const req = httpMock.expectOne(`${API_URL}/clientes/cliente-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'cliente-1' });
  });

  it('should PUT atualizar cliente', () => {
    const dto = { nome: 'Empresa Atualizada' };
    service.atualizarCliente('cliente-1', dto as any).subscribe();
    const req = httpMock.expectOne(`${API_URL}/clientes/cliente-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);
    req.flush({});
  });

  it('should GET contratos', () => {
    service.listarContratos(1, 50).subscribe();
    const req = httpMock.expectOne(`${API_URL}/contratos?page=1&size=50`);
    expect(req.request.method).toBe('GET');
    req.flush({ content: [] });
  });

  it('should GET contrato by id', () => {
    service.buscarContrato('contrato-1').subscribe();
    const req = httpMock.expectOne(`${API_URL}/contratos/contrato-1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'contrato-1' });
  });

  it('should GET indicadores without fim', () => {
    service.indicadores('2026-01-01').subscribe();
    const req = httpMock.expectOne(`${API_URL}/indicadores?inicio=2026-01-01`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('fim')).toBe(false);
    req.flush({});
  });

  it('should GET relatorio financeiro without fim', () => {
    service.relatorioFinanceiro('2026-01-01').subscribe();
    const req = httpMock.expectOne(`${API_URL}/relatorios?inicio=2026-01-01`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('fim')).toBe(false);
    req.flush({});
  });

  it('should GET relatorio financeiro with fim', () => {
    service.relatorioFinanceiro('2026-01-01', '2026-01-31').subscribe();
    const req = httpMock.expectOne(`${API_URL}/relatorios?inicio=2026-01-01&fim=2026-01-31`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});