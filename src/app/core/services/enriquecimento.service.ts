import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ScrapingRequestDTO {
  numerosProcesso: string[];
}

export interface ScrapingResultDTO {
  numeroProcesso: string;
  sucesso: boolean;
  mensagem?: string;
}

export interface ScrapingResponseDTO {
  resultados: ScrapingResultDTO[];
}

@Injectable({
  providedIn: 'root'
})
export class EnriquecimentoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/enriquecimento`;

  reprocessar(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reprocessar`, {});
  }

  processar(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/processar`, {});
  }

  reprocessarPorNumeros(numeros: string[]): Observable<ScrapingResponseDTO> {
    const request: ScrapingRequestDTO = { numerosProcesso: numeros };
    return this.http.post<ScrapingResponseDTO>(`${this.apiUrl}/scraping`, request);
  }
}
