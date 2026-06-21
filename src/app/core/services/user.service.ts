import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Page } from '../models/processo/pagination.model';

export enum Role {
  ADMIN = 'ADMIN',
  GESTOR = 'GESTOR',
  ANALISTA = 'ANALISTA'
}

export interface UsuarioRequest {
  username: string;
  nome?: string;
  password?: string;
  role: Role;
  equipeId?: string;
}

export interface UsuarioResponse {
  id: string;
  username: string;
  nome: string;
  role: Role;
  equipeId?: string;
  equipeNome?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  criarUsuario(usuario: UsuarioRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, usuario);
  }

  getUsuarios(page: number = 0, size: number = 100): Observable<Page<UsuarioResponse>> {
    return this.http.get<Page<UsuarioResponse>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  associarEquipe(usuarioId: string, equipeId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${usuarioId}/equipe/${equipeId}`, {});
  }

  desassociarEquipe(usuarioId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${usuarioId}/equipe`);
  }
}
