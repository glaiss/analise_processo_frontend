import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class IngestionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ingestao`;

  sincronizar(tribunal: string, total: number, size: number): Observable<{ status: string, mensagem: string }> {
    return this.http.post<{ status: string, mensagem: string }>(
      `${this.apiUrl}/sync/${tribunal}?total=${total}&size=${size}`, 
      {}
    );
  }
}
