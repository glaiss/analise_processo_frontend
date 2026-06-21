import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/processo/pagination.model';
import { AtribuicaoProcessoResumoDTO } from '../models/processo/atribuicao-processo-resumo.model';

@Injectable({
  providedIn: 'root'
})
export class DistributionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/distribuicao`;

  getMeusProcessos(page: number = 0, size: number = 20): Observable<Page<AtribuicaoProcessoResumoDTO>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<AtribuicaoProcessoResumoDTO>>(`${this.apiUrl}/meus-processos`, { params });
  }

  getProcessosEquipe(page: number = 0, size: number = 20): Observable<Page<AtribuicaoProcessoResumoDTO>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<AtribuicaoProcessoResumoDTO>>(`${this.apiUrl}/equipe`, { params });
  }

  executarDistribuicao(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/executar`, {});
  }

  executarDistribuicaoPorEquipe(equipeId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${equipeId}/distribuir`, {});
  }
}
