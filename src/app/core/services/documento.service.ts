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
  private readonly previewCache = new Map<string, { url: string; expiresAt: number }>();
  private readonly PREVIEW_CACHE_MARGIN_MS = 60_000;
  upload(numero: string, file: File, isContrato: boolean = false): Observable<Documento> {
    const formData = new FormData();
    formData.append('file', file);
    const url = `${this.apiUrl}/${numero}/documentos${isContrato ? `?isContrato=${isContrato}` : ''}`;
    return this.http.post<Documento>(url, formData);
  }
  listar(numero: string): Observable<Page<Documento>> {
    return this.http.get<Page<Documento>>(`${this.apiUrl}/${numero}/documentos`);
  }
  getPreviewUrl(numero: string, documentoId: string): Observable<{ url: string }> {
    const key = `${numero}/${documentoId}`;
    const cached = this.previewCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return of({ url: cached.url });
    }
    return this.http.get<{ url: string }>(`${this.apiUrl}/${numero}/documentos/${documentoId}/preview-url`).pipe(
      tap(({ url }) => this.previewCache.set(key, { url, expiresAt: this.extractExpiry(url) }))
    );
  }
  getDownloadUrl(numero: string, documentoId: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/${numero}/documentos/${documentoId}/download-url`);
  }
  invalidatePreviewUrl(numero: string, documentoId: string): void {
    this.previewCache.delete(`${numero}/${documentoId}`);
  }
  deletar(numero: string, documentoId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${numero}/documentos/${documentoId}`);
  }
  private extractExpiry(url: string): number {
    const match = /[?&]Expires=(\d+)/u.exec(url);
    if (match) {
      return Number(match[1]) * 1000 - this.PREVIEW_CACHE_MARGIN_MS;
    }
    return Date.now() + 10 * 60 * 1000;
  }
}
