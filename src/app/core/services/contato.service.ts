import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProcessoContatoDTO } from '../models/processo/processo-contato.model';
@Injectable({ providedIn: 'root' })
export class ContatoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/analise/processos`;
  listar(numero: string): Observable<ProcessoContatoDTO[]> {
    return this.http.get<ProcessoContatoDTO[]>(`${this.apiUrl}/${numero}/contatos`);
  }
  salvar(
    numero: string,
    contato: { tipo: string; valor: string; nome?: string; principal?: boolean },
  ): Observable<ProcessoContatoDTO> {
    return this.http.post<ProcessoContatoDTO>(`${this.apiUrl}/${numero}/contatos`, contato);
  }
  atualizar(
    numero: string,
    id: string,
    contato: { tipo: string; valor: string; nome: string; principal?: boolean },
  ): Observable<ProcessoContatoDTO> {
    return this.http.put<ProcessoContatoDTO>(`${this.apiUrl}/${numero}/contatos/${id}`, contato);
  }
  deletar(numero: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numero}/contatos/${id}`);
  }
}
