import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/processo/pagination.model';
import { AtribuicaoProcessoResumoDTO } from '../models/processo/atribuicao-processo-resumo.model';
import { StatusAtribuicao } from '../models/processo/enums.model';
export interface ProcessoFilterParams {
  numero?: string;
  niveis?: string[];
  status?: StatusAtribuicao[];
  tribunal?: string;
  assunto?: string;
  situacao?: string[];
}
export interface RedirecionarProcessoRequest {
  tipo: 'PESSOA' | 'EQUIPE';
  origemUsuarioId?: string;
  usuarioId?: string;
  equipeId?: string;
}
@Injectable({ providedIn: 'root' })
export class DistributionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/distribuicao`;
  getMeusProcessos(
    page: number = 0,
    size: number = 20,
    filter?: ProcessoFilterParams,
  ): Observable<Page<AtribuicaoProcessoResumoDTO>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    params = this.appendFilterParams(params, filter);
    return this.http.get<Page<AtribuicaoProcessoResumoDTO>>(`${this.apiUrl}/meus-processos`, {
      params,
    });
  }
  getProcessosEquipe(
    page: number = 0,
    size: number = 20,
    filter?: ProcessoFilterParams,
  ): Observable<Page<AtribuicaoProcessoResumoDTO>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    params = this.appendFilterParams(params, filter);
    return this.http.get<Page<AtribuicaoProcessoResumoDTO>>(`${this.apiUrl}/equipe`, { params });
  }
  private appendFilterParams(params: HttpParams, filter?: ProcessoFilterParams): HttpParams {
    if (!filter) return params;
    if (filter.numero) {
      params = params.set('numero', filter.numero);
    }
    if (filter.niveis) {
      filter.niveis.forEach((n) => {
        params = params.append('niveis', n);
      });
    }
    if (filter.status) {
      filter.status.forEach((s) => {
        params = params.append('status', s);
      });
    }
    if (filter.tribunal) {
      params = params.set('tribunal', filter.tribunal);
    }
    if (filter.assunto) {
      params = params.set('assunto', filter.assunto);
    }
    if (filter.situacao) {
      filter.situacao.forEach((s) => {
        params = params.append('situacao', s);
      });
    }
    return params;
  }
  executarDistribuicao(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/executar`, {});
  }
  executarDistribuicaoPorEquipe(equipeId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${equipeId}/distribuir`, {});
  }
  redirecionarProcessos(request: RedirecionarProcessoRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/redirecionar`, request);
  }
}
