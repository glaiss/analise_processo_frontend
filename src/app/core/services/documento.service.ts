import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Page } from '../models/processo';

export interface Documento {
  id: string;
  nomeArquivo: string;
  contentType: string;
  tamanho: number;
  createdDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private http = inject(HttpClient);
  private apiUrl = '/v1/analise/processos';
  private blobCache = new Map<string, Blob>();

  upload(numero: string, file: File): Observable<Documento> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Documento>(`${this.apiUrl}/${numero}/documentos`, formData);
  }

  listar(numero: string): Observable<Page<Documento>> {
    return this.http.get<Page<Documento>>(`${this.apiUrl}/${numero}/documentos`);
  }

  download(numero: string, documentoId: string): Observable<Blob> {
    const cacheKey = `${numero}_${documentoId}`;
    if (this.blobCache.has(cacheKey)) {
      return of(this.blobCache.get(cacheKey)!);
    }

    return this.http.get(`${this.apiUrl}/${numero}/documentos/${documentoId}/download`, {
      responseType: 'blob'
    }).pipe(
      tap(blob => this.blobCache.set(cacheKey, blob))
    );
  }

  getDownloadUrl(numero: string, documentoId: string): string {
    return `${this.apiUrl}/${numero}/documentos/${documentoId}/download`;
  }

  limparCache() {
    this.blobCache.clear();
  }
}
