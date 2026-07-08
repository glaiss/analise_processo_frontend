import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CacheEstatisticas {
  hitCount: number;
  missCount: number;
  loadSuccessCount: number;
  evictionCount: number;
  hitRate: number;
}

export interface CacheInfo {
  size: number;
  chaves: string[];
  estatisticas: CacheEstatisticas;
}

export type CacheMap = Record<string, CacheInfo>;

@Injectable({ providedIn: 'root' })
export class CacheService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/administracao/cache`;

  listarCaches(): Observable<CacheMap> {
    return this.http.get<CacheMap>(this.apiUrl);
  }
}
