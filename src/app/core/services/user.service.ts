import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  criarUsuario(usuario: UsuarioRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, usuario);
  }
}
