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
    let result = params;
    if (!filter) return result;
    if (filter.numero) {
      result = result.set('numero', filter.numero);
    }
    if (filter.niveis) {
      filter.niveis.forEach((n) => {
        result = result.append('niveis', n);
      });
    }
    if (filter.status) {
      filter.status.forEach((s) => {
        result = result.append('status', s);
      });
    }
    if (filter.tribunal) {
      result = result.set('tribunal', filter.tribunal);
    }
    if (filter.assunto) {
      result = result.set('assunto', filter.assunto);
    }
    if (filter.situacao) {
      filter.situacao.forEach((s) => {
        result = result.append('situacao', s);
      });
    }
    return result;
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
