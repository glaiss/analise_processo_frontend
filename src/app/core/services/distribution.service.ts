import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/processo.model';

export interface AtribuicaoProcesso {
  id: string;
  processo: {
    numero: string;
    classeJudicial: string;
    assuntoJudicial: string;
    scoreFinal: number;
    nivel: string;
  };
  equipe: { id: string; nome: string };
  usuario: { id: string; nome: string } | null;
  status: string;
  prazoFinal: string;
  statusPrazo: string;
}

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  private http = inject(HttpClient);

  getMeusProcessos(): Observable<Page<AtribuicaoProcesso>> {
    return this.http.get<Page<AtribuicaoProcesso>>('/distribuicao/meus-processos');
  }

  getProcessosEquipe(): Observable<Page<AtribuicaoProcesso>> {
    return this.http.get<Page<AtribuicaoProcesso>>('/distribuicao/equipe');
  }
}
