import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EtiquetaDTO, EtiquetaRequestDTO } from '../models/processo/etiqueta.model';

@Injectable({ providedIn: 'root' })
export class EtiquetaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/etiquetas`;

  listar(): Observable<EtiquetaDTO[]> {
    return this.http.get<EtiquetaDTO[]>(this.apiUrl);
  }

  criar(request: EtiquetaRequestDTO): Observable<EtiquetaDTO> {
    return this.http.post<EtiquetaDTO>(this.apiUrl, request);
  }

  atualizar(id: string, request: EtiquetaRequestDTO): Observable<EtiquetaDTO> {
    return this.http.put<EtiquetaDTO>(`${this.apiUrl}/${id}`, request);
  }

  deletar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarPorProcesso(processoNumero: string): Observable<EtiquetaDTO[]> {
    return this.http.get<EtiquetaDTO[]>(`${this.apiUrl}/processo/${processoNumero}`);
  }

  vincularProcesso(processoNumero: string, etiquetaIds: string[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/processo/${processoNumero}`, etiquetaIds);
  }

  desvincularProcesso(processoNumero: string, etiquetaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/processo/${processoNumero}/${etiquetaId}`);
  }
}
