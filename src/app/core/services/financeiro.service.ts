import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/processo/pagination.model';
import { Cliente, ClienteRequest } from '../models/financeiro/cliente.model';
import { ContratoRequest } from '../models/financeiro/contrato.model';
import { Contrato, SituacaoFinanceira } from '../models/financeiro/parcela.model';
import { Recebimento, RecebimentoRequest } from '../models/financeiro/recebimento.model';
import { IndicadoresFinanceiros } from '../models/financeiro/indicadores.model';

@Injectable({ providedIn: 'root' })
export class FinanceiroService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/financeiro`;

  // Clientes
  listarClientes(page: number = 0, size: number = 100): Observable<Page<Cliente>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<Cliente>>(`${this.baseUrl}/clientes`, { params });
  }
  buscarCliente(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/clientes/${id}`);
  }
  criarCliente(dto: ClienteRequest): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/clientes`, dto);
  }
  atualizarCliente(id: string, dto: ClienteRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/clientes/${id}`, dto);
  }

  // Contratos
  listarContratos(page: number = 0, size: number = 20): Observable<Page<Contrato>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<Contrato>>(`${this.baseUrl}/contratos`, { params });
  }
  buscarContrato(id: string): Observable<Contrato> {
    return this.http.get<Contrato>(`${this.baseUrl}/contratos/${id}`);
  }
  fecharContrato(dto: ContratoRequest): Observable<Contrato> {
    return this.http.post<Contrato>(`${this.baseUrl}/contratos`, dto);
  }
  fecharContratoParaProcesso(numeroProcesso: string, dto: ContratoRequest): Observable<Contrato> {
    return this.http.post<Contrato>(`${this.baseUrl}/contratos/processo/${numeroProcesso}`, dto);
  }

  // Situação financeira e recebimentos
  situacaoFinanceira(contratoId: string): Observable<SituacaoFinanceira> {
    return this.http.get<SituacaoFinanceira>(`${this.baseUrl}/contratos/${contratoId}/situacao`);
  }
  registrarRecebimento(dto: RecebimentoRequest): Observable<Recebimento> {
    return this.http.post<Recebimento>(`${this.baseUrl}/recebimentos`, dto);
  }

  // Indicadores
  indicadores(inicio: string, fim?: string): Observable<IndicadoresFinanceiros> {
    let params = new HttpParams().set('inicio', inicio);
    if (fim) {
      params = params.set('fim', fim);
    }
    return this.http.get<IndicadoresFinanceiros>(`${this.baseUrl}/indicadores`, { params });
  }
}