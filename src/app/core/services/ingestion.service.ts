import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngestionService {
  private http = inject(HttpClient);

  sincronizar(tribunal: string, total: number, size: number): Observable<{ status: string, mensagem: string }> {
    return this.http.post<{ status: string, mensagem: string }>(
      `/ingestao/sync/${tribunal}?total=${total}&size=${size}`, 
      {}
    );
  }
}
