import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/processo/pagination.model';
import { AtribuicaoProcessoResumoDTO } from '../models/processo/atribuicao-processo-resumo.model';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  private http = inject(HttpClient);

  getMeusProcessos(): Observable<Page<AtribuicaoProcessoResumoDTO>> {
    return this.http.get<Page<AtribuicaoProcessoResumoDTO>>('/distribuicao/meus-processos');
  }

  getProcessosEquipe(): Observable<Page<AtribuicaoProcessoResumoDTO>> {
    return this.http.get<Page<AtribuicaoProcessoResumoDTO>>('/distribuicao/equipe');
  }

  executarDistribuicao(): Observable<void> {
    return this.http.post<void>('/distribuicao/executar', {});
  }
}
