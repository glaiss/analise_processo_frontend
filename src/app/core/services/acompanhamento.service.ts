import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/processo/pagination.model';
import {
  OabEquipeResponse,
  OabResponse,
  ProcessoAcompanhadoDetalheDTO,
  ProcessoAcompanhadoResumoDTO,
  ProcessoSincronizacaoResultadoDTO,
  StatusSincronizacaoDTO,
} from '../models/acompanhamento/acompanhamento.model';
import { FonteAcompanhamento } from '../models/acompanhamento/fonte-acompanhamento';

export interface OabRequest {
  numero: string;
  uf: string;
  fontes: FonteAcompanhamento[];
}

export interface ProcessoAcompanhadoFiltros {
  numero?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class AcompanhamentoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/acompanhamento`;

  obterMinhaOab(): Observable<OabResponse | null> {
    return this.http
      .get<OabResponse>(`${this.apiUrl}/oab`)
      .pipe(catchError(() => of(null)));
  }

  obterOabEquipe(): Observable<OabEquipeResponse> {
    return this.http.get<OabEquipeResponse>(`${this.apiUrl}/oab/equipe`);
  }

  salvarOab(request: OabRequest): Observable<OabResponse> {
    return this.http.post<OabResponse>(`${this.apiUrl}/oab`, request);
  }

  desativarOab(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/oab`);
  }

  obterStatus(): Observable<StatusSincronizacaoDTO> {
    return this.http.get<StatusSincronizacaoDTO>(`${this.apiUrl}/oab/status`);
  }

  sincronizar(fontes?: FonteAcompanhamento[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/oab/sincronizar`,
      fontes && fontes.length > 0 ? { fontes } : {});
  }

  sincronizarProcesso(
    numero: string,
    fonte?: FonteAcompanhamento,
  ): Observable<ProcessoSincronizacaoResultadoDTO> {
    return this.http.post<ProcessoSincronizacaoResultadoDTO>(
      `${this.apiUrl}/processos/${numero}/sincronizar`,
      fonte ? { fonte } : {},
    );
  }

  listarProcessos(
    page = 0,
    size = 20,
    filtros?: ProcessoAcompanhadoFiltros,
  ): Observable<Page<ProcessoAcompanhadoResumoDTO>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filtros?.numero) {
      params = params.set('numero', filtros.numero);
    }
    if (filtros?.status) {
      params = params.set('status', filtros.status);
    }
    return this.http.get<Page<ProcessoAcompanhadoResumoDTO>>(`${this.apiUrl}/processos`, { params });
  }

  obterDetalhe(numero: string): Observable<ProcessoAcompanhadoDetalheDTO> {
    return this.http.get<ProcessoAcompanhadoDetalheDTO>(`${this.apiUrl}/processos/${numero}`);
  }
}
