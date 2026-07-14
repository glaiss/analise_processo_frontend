import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface DiskSpaceDetails {
  total?: number;
  free?: number;
  threshold?: number;
  exists?: boolean;
}
export interface Health {
  status: string;
  components?: {
    db?: { status: string; details?: { database?: string } };
    diskSpace?: { status: string; details?: DiskSpaceDetails };
    ping?: { status: string };
  };
}
export interface MetricSample {
  statistic?: string;
  value: number;
}
export interface Metric {
  name: string;
  measurements: MetricSample[];
  availableTags: Array<{ tag: string; values: string[] }>;
}
export interface HeapMemory {
  used: number;
  max: number;
  committed: number;
  usagePercent: number;
}
export interface AppInfo {
  app?: { name?: string; version?: string };
  build?: { version?: string; name?: string; group?: string; artifact?: string; time?: string };
}
export interface CpuInfo {
  system: number;
  process: number;
  loadAverage: number;
}
export interface DbPoolInfo {
  active: number;
  idle: number;
  max: number;
  usagePercent: number;
}
@Injectable({ providedIn: 'root' })
export class ActuatorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/actuator`;
  getHealth(): Observable<Health> {
    return this.http.get<Health>(`${this.baseUrl}/health`);
  }
  getInfo(): Observable<AppInfo> {
    return this.http.get<AppInfo>(`${this.baseUrl}/info`);
  }
  getMetric(name: string, tag?: string): Observable<Metric> {
    const params = tag ? { tag } : undefined;
    return this.http.get<Metric>(`${this.baseUrl}/metrics/${name}`, { params });
  }
}
