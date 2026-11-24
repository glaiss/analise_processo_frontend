import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Page } from '../models/processo/pagination.model';
import { Funcionalidade } from '../models/funcionalidade.model';
export interface EquipeDto {
  id: string;
  nome: string;
  ativo: boolean;
}
@Injectable({ providedIn: 'root' })
export class EquipeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/equipes`;
  getEquipes(page: number = 0, size: number = 50): Observable<Page<EquipeDto>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<EquipeDto>>(this.apiUrl, { params });
  }
  getEquipesAtivas(page: number = 0, size: number = 50): Observable<Page<EquipeDto>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<EquipeDto>>(`${this.apiUrl}/ativas`, { params });
  }
  criarEquipe(equipe: Partial<EquipeDto>): Observable<EquipeDto> {
    return this.http.post<EquipeDto>(this.apiUrl, equipe);
  }
  listarFuncionalidades(equipeId: string): Observable<Funcionalidade[]> {
    return this.http.get<Funcionalidade[]>(`${this.apiUrl}/${equipeId}/funcionalidades`);
  }
  adicionarFuncionalidade(equipeId: string, funcionalidade: Funcionalidade): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${equipeId}/funcionalidades/${funcionalidade}`, {});
  }
  removerFuncionalidade(equipeId: string, funcionalidade: Funcionalidade): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${equipeId}/funcionalidades/${funcionalidade}`);
  }
}
