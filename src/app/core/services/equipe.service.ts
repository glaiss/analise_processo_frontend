import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Page } from '../models/processo/pagination.model';

export interface EquipeDto {
  id: string;
  nome: string;
  ativo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EquipeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/equipes`;

  getEquipes(page: number = 0, size: number = 20): Observable<Page<EquipeDto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<Page<EquipeDto>>(this.apiUrl, { params });
  }

  getEquipesAtivas(page: number = 0, size: number = 20): Observable<Page<EquipeDto>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<EquipeDto>>(`${this.apiUrl}/ativas`, { params });
  }
}
