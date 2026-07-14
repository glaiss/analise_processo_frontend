import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({ providedIn: 'root' })
export class AdminSyncService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sync`;
  syncMovimentos(): Observable<{ status: string; mensagem: string }> {
    return this.http.post<{ status: string; mensagem: string }>(`${this.apiUrl}/movimentos`, {});
  }
  syncClasses(): Observable<{ status: string; mensagem: string }> {
    return this.http.post<{ status: string; mensagem: string }>(`${this.apiUrl}/classes`, {});
  }
  syncAssuntos(): Observable<{ status: string; mensagem: string }> {
    return this.http.post<{ status: string; mensagem: string }>(`${this.apiUrl}/assuntos`, {});
  }
  syncTudo(): Observable<{ status: string; mensagem: string }> {
    return this.http.post<{ status: string; mensagem: string }>(`${this.apiUrl}/tudo`, {});
  }
  syncIngestao(
    tribunal: string,
    total: number,
    size: number,
  ): Observable<{ status: string; mensagem: string }> {
    return this.http.post<{ status: string; mensagem: string }>(
      `${this.apiUrl}/ingestao/${tribunal}?total=${total}&size=${size}`,
      {},
    );
  }
}
