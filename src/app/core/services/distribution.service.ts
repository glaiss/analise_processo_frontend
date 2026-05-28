import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/processo/pagination.model';
import { AtribuicaoProcessoResumoDTO } from '../models/processo/atribuicao-processo-resumo.model';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  private http = inject(HttpClient);

  getMeusProcessos(page: number = 0, size: number = 20): Observable<Page<AtribuicaoProcessoResumoDTO>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<AtribuicaoProcessoResumoDTO>>('/distribuicao/meus-processos', { params });
  }

  getProcessosEquipe(page: number = 0, size: number = 20): Observable<Page<AtribuicaoProcessoResumoDTO>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<AtribuicaoProcessoResumoDTO>>('/distribuicao/equipe', { params });
  }

  executarDistribuicao(): Observable<void> {
    return this.http.post<void>('/distribuicao/executar', {});
  }
}
