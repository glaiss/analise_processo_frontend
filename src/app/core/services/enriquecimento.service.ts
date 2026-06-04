import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnriquecimentoService {
  private http = inject(HttpClient);
  private apiUrl = '/enriquecimento';

  reprocessar(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reprocessar`, {});
  }

  processar(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/processar`, {});
  }
}
