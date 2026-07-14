import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';
import { InfiniteScrollComponent } from '../../../shared/components/infinite-scroll/infinite-scroll.component';
import { CacheEstatisticas, CacheMap, CacheService } from '../../../core/services/cache.service';

interface CacheItem {
  nome: string;
  size: number;
  chaves: string[];
  estatisticas: CacheEstatisticas;
}

@Component({
  selector: 'app-cache-monitor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    PageHeaderComponent,
    LoadingOverlayComponent,
    InfiniteScrollComponent,
  ],
  templateUrl: './cache-monitor.component.html',
  styleUrl: './cache-monitor.component.scss'
})
export class CacheMonitorComponent implements OnInit {
  private readonly cacheService = inject(CacheService);

  readonly todosCaches = signal<CacheItem[]>([]);
  readonly cachesVisiveis = signal(2);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly totalEntradas = signal(0);
  readonly ultimaAtualizacao = signal<Date | null>(null);

  readonly tamanhoPagina = 2;

  autoRefreshHandle: ReturnType<typeof setInterval> | null = null;

  readonly ordemRegioes = ['processos', 'usuarios', 'equipes', 'documentos', 'auditoriaScore'];

  ngOnInit() {
    this.carregar();
    this.autoRefreshHandle = setInterval(() => this.carregar(), 10000);
  }

  carregar() {
    this.loading.set(true);
    this.error.set(null);

    this.cacheService.listarCaches().subscribe({
      next: (map: CacheMap) => {
        const itens = this.ordenarCaches(map);
        this.todosCaches.set(itens);
        this.cachesVisiveis.set(this.tamanhoPagina);
        this.totalEntradas.set(itens.reduce((soma, c) => soma + c.size, 0));
        this.ultimaAtualizacao.set(new Date());
        this.loading.set(false);
        this.carregarMaisSeCouber();
      },
      error: (err) => {
        this.error.set('Não foi possível carregar os caches. Verifique se o usuário possui perfil ADMIN.');
        this.loading.set(false);
        console.error('Erro ao carregar caches', err);
      }
    });
  }

  onScroll() {
    if (this.cachesVisiveis() >= this.todosCaches().length) return;
    this.cachesVisiveis.set(Math.min(this.cachesVisiveis() + this.tamanhoPagina, this.todosCaches().length));
    this.carregarMaisSeCouber();
  }

  cachesVisiveisLista(): CacheItem[] {
    return this.todosCaches().slice(0, this.cachesVisiveis());
  }

  temMais(): boolean {
    return this.cachesVisiveis() < this.todosCaches().length;
  }

  private carregarMaisSeCouber() {
    setTimeout(() => {
      const doc = document.documentElement;
      if (this.temMais() && doc.scrollHeight <= doc.clientHeight + 80) {
        this.cachesVisiveis.set(Math.min(this.cachesVisiveis() + this.tamanhoPagina, this.todosCaches().length));
        this.carregarMaisSeCouber();
      }
    }, 0);
  }

  private ordenarCaches(map: CacheMap): CacheItem[] {
    const nomes = Object.keys(map);
    nomes.sort((a, b) => {
      const ia = this.ordemRegioes.indexOf(a);
      const ib = this.ordemRegioes.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    return nomes.map(nome => ({
      nome,
      size: map[nome].size ?? 0,
      chaves: map[nome].chaves ?? [],
      estatisticas: map[nome].estatisticas ?? {
        hitCount: 0, missCount: 0, loadSuccessCount: 0, evictionCount: 0, hitRate: 0
      }
    }));
  }

  formatPercent(value: number): string {
    if (value === undefined || value === null || isNaN(value)) return '0%';
    return `${(value * 100).toFixed(1)  }%`;
  }

  trackByNome(_index: number, item: CacheItem): string {
    return item.nome;
  }
}
