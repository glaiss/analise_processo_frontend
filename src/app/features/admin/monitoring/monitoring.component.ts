import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActuatorService, Health, Metric } from '../../../core/services/actuator.service';

interface MetricValue {
  label: string;
  used: number;
  max: number;
  unit: string;
  percent: number;
}

interface GcPause {
  count: number;
  totalTime: number;
  maxTime: number;
}

@Component({
  selector: 'app-monitoring',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss'
})
export class MonitoringComponent implements OnInit {
  private actuator = inject(ActuatorService);

  health = signal<Health | null>(null);
  heap = signal<MetricValue | null>(null);
  nonHeap = signal<MetricValue | null>(null);
  cpu = signal<{ system: number; process: number } | null>(null);
  threads = signal<{ live: number; peak: number } | null>(null);
  dbPool = signal<MetricValue | null>(null);
  uptime = signal<number | null>(null);
  classes = signal<number | null>(null);

  gcPause = signal<GcPause | null>(null);
  gcAllocated = signal<number | null>(null);
  gcLiveData = signal<number | null>(null);
  bufferDirect = signal<number | null>(null);
  bufferMapped = signal<number | null>(null);
  daemonThreads = signal<number | null>(null);
  fileOpen = signal<number | null>(null);
  fileMax = signal<number | null>(null);
  loadAverage = signal<number | null>(null);
  dbPending = signal<number | null>(null);
  dbTimeout = signal<number | null>(null);

  diskFree = signal<number | null>(null);
  diskTotal = signal<number | null>(null);
  cpuCount = signal<number | null>(null);
  activeSessions = signal<number | null>(null);
  unloadedClasses = signal<number | null>(null);
  hikariAcquire = signal<number | null>(null);

  loading = signal(true);
  error = signal<string | null>(null);
  autoRefreshHandle: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.loadAll();
    this.autoRefreshHandle = setInterval(() => this.loadAll(), 15000);
  }

  loadAll() {
    this.loading.set(true);
    this.error.set(null);

    this.actuator.getHealth().subscribe({
      next: h => {
        this.health.set(h);
        const disk = h.components?.diskSpace?.details;
        if (disk) {
          this.diskFree.set(disk.free ?? null);
          this.diskTotal.set(disk.total ?? null);
        }
      },
      error: () => {}
    });

    this.actuator.getMetric('jvm.memory.used').subscribe({
      next: m => this.updateHeap(m),
      error: () => {}
    });

    this.actuator.getMetric('jvm.memory.max').subscribe({
      next: m => this.updateMax(m),
      error: () => {}
    });

    this.actuator.getMetric('jvm.memory.committed').subscribe({
      next: m => this.updateCommitted(m),
      error: () => {}
    });

    this.actuator.getMetric('jvm.memory.used', 'area:nonheap').subscribe({
      next: m => this.updateNonHeap(m),
      error: () => {}
    });

    this.actuator.getMetric('system.cpu.usage').subscribe({
      next: m => this.updateCpu(m, 'system'),
      error: () => {}
    });

    this.actuator.getMetric('process.cpu.usage').subscribe({
      next: m => this.updateCpu(m, 'process'),
      error: () => {}
    });

    this.actuator.getMetric('jvm.threads.live').subscribe({
      next: m => this.updateThreads(m, 'live'),
      error: () => {}
    });

    this.actuator.getMetric('jvm.threads.peak').subscribe({
      next: m => this.updateThreads(m, 'peak'),
      error: () => {}
    });

    this.actuator.getMetric('hikaricp.connections.active').subscribe({
      next: m => this.updateDbPool(m, 'active'),
      error: () => {}
    });

    this.actuator.getMetric('hikaricp.connections.idle').subscribe({
      next: m => this.updateDbPool(m, 'idle'),
      error: () => {}
    });

    this.actuator.getMetric('hikaricp.connections.max').subscribe({
      next: m => this.updateDbPool(m, 'max'),
      error: () => {}
    });

    this.actuator.getMetric('jvm.classes.loaded').subscribe({
      next: m => this.classes.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('process.uptime').subscribe({
      next: m => this.uptime.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('jvm.gc.pause').subscribe({
      next: m => this.updateGcPause(m),
      error: () => {}
    });

    this.actuator.getMetric('jvm.gc.memory.allocated').subscribe({
      next: m => this.gcAllocated.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('jvm.gc.live.data.size').subscribe({
      next: m => this.gcLiveData.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('jvm.buffer.memory.used', 'id:direct').subscribe({
      next: m => this.bufferDirect.set(m.measurements.reduce((s, sm) => s + sm.value, 0)),
      error: () => {}
    });

    this.actuator.getMetric('jvm.buffer.memory.used', 'id:mapped').subscribe({
      next: m => this.bufferMapped.set(m.measurements.reduce((s, sm) => s + sm.value, 0)),
      error: () => {}
    });

    this.actuator.getMetric('jvm.threads.daemon').subscribe({
      next: m => this.daemonThreads.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('process.files.open').subscribe({
      next: m => this.fileOpen.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('process.files.max').subscribe({
      next: m => this.fileMax.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('system.load.average.1m').subscribe({
      next: m => this.loadAverage.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('hikaricp.connections.pending').subscribe({
      next: m => this.dbPending.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('hikaricp.connections.timeout').subscribe({
      next: m => this.dbTimeout.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('system.cpu.count').subscribe({
      next: m => this.cpuCount.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('jvm.classes.unloaded').subscribe({
      next: m => this.unloadedClasses.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('tomcat.sessions.active.current').subscribe({
      next: m => this.activeSessions.set(m.measurements[0]?.value ?? 0),
      error: () => {}
    });

    this.actuator.getMetric('hikaricp.connections.acquire').subscribe({
      next: m => {
        const maxSample = m.measurements.reduce((best, s) => Math.max(best, s.value), 0);
        this.hikariAcquire.set(maxSample);
      },
      error: () => {}
    });

    this.loading.set(false);
  }

  private heapUsed = 0;
  private heapMax = 0;
  private heapCommitted = 0;

  private updateHeap(m: Metric) {
    this.heapUsed = m.measurements[0]?.value ?? 0;
    this.emitHeap();
  }

  private updateMax(m: Metric) {
    this.heapMax = m.measurements[0]?.value ?? 0;
    this.emitHeap();
  }

  private updateCommitted(m: Metric) {
    this.heapCommitted = m.measurements[0]?.value ?? 0;
    this.emitHeap();
  }

  private emitHeap() {
    const max = this.heapMax || this.heapCommitted || 1;
    this.heap.set({
      label: 'Heap',
      used: this.heapUsed,
      max,
      unit: 'bytes',
      percent: (this.heapUsed / max) * 100,
    });
  }

  private updateNonHeap(m: Metric) {
    const value = m.measurements.reduce((sum, sample) => sum + sample.value, 0);
    this.nonHeap.set({
      label: 'Non-Heap',
      used: value,
      max: value,
      unit: 'bytes',
      percent: 0,
    });
  }

  private updateGcPause(m: Metric) {
    let count = 0, totalTime = 0, maxTime = 0;
    for (const sample of m.measurements) {
      switch (sample.statistic) {
        case 'COUNT': count = sample.value; break;
        case 'TOTAL_TIME': totalTime = sample.value; break;
        case 'MAX': maxTime = sample.value; break;
      }
    }
    this.gcPause.set({ count, totalTime, maxTime });
  }

  private cpuSystem = 0;
  private cpuProcess = 0;

  private updateCpu(m: Metric, type: 'system' | 'process') {
    const value = m.measurements[0]?.value ?? 0;
    if (type === 'system') this.cpuSystem = value;
    else this.cpuProcess = value;
    this.cpu.set({ system: this.cpuSystem, process: this.cpuProcess });
  }

  private threadLive = 0;
  private threadPeak = 0;

  private updateThreads(m: Metric, type: 'live' | 'peak') {
    const value = m.measurements[0]?.value ?? 0;
    if (type === 'live') this.threadLive = value;
    else this.threadPeak = value;
    this.threads.set({ live: this.threadLive, peak: this.threadPeak });
  }

  private dbActive = 0;
  private dbIdle = 0;
  private dbMax = 0;

  private updateDbPool(m: Metric, type: 'active' | 'idle' | 'max') {
    const value = m.measurements[0]?.value ?? 0;
    if (type === 'active') this.dbActive = value;
    else if (type === 'idle') this.dbIdle = value;
    else this.dbMax = value;

    const max = this.dbMax || 1;
    this.dbPool.set({
      label: 'Conexões',
      used: this.dbActive,
      max,
      unit: 'conn',
      percent: (this.dbActive / max) * 100,
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }

  formatMs(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  }

  refresh() {
    this.loadAll();
  }

  getStatusColor(status: string | undefined): string {
    switch (status?.toUpperCase()) {
      case 'UP': return 'primary';
      case 'DOWN': return 'warn';
      case 'OUT_OF_SERVICE': return 'warn';
      case 'UNKNOWN': return 'accent';
      default: return '';
    }
  }
}
