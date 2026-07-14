import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Page } from '../models/processo';
import { environment } from '../../../environments/environment';
export interface Documento {
  id: string;
  nomeArquivo: string;
  contentType: string;
  tamanho: number;
  createdDate: string;
  isContrato?: boolean;
}
@Injectable({ providedIn: 'root' })
export class DocumentoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/v1/analise/processos`;
  private readonly blobCache = new Map<string, Blob>();
  upload(numero: string, file: File, isContrato: boolean = false): Observable<Documento> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.apiUrl}/${numero}/documentos${isContrato ? `?isContrato=${isContrato}` : ''}`;
    return this.http.post<Documento>(url, formData);
  }
  listar(numero: string): Observable<Page<Documento>> {
    return this.http.get<Page<Documento>>(`${this.apiUrl}/${numero}/documentos`);
  }
  download(numero: string, documentoId: string): Observable<Blob> {
    const cacheKey = `${numero}_${documentoId}`;
    if (this.blobCache.has(cacheKey)) {
      return of(this.blobCache.get(cacheKey)!);
    }
    return this.http
      .get(`${this.apiUrl}/${numero}/documentos/${documentoId}/download`, { responseType: 'blob' })
      .pipe(tap((blob) => this.blobCache.set(cacheKey, blob)));
  }
  getDownloadUrl(numero: string, documentoId: string): string {
    return `${this.apiUrl}/${numero}/documentos/${documentoId}/download`;
  }
  deletar(numero: string, documentoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numero}/documentos/${documentoId}`);
  }
  limparCache() {
    this.blobCache.clear();
  }
}
