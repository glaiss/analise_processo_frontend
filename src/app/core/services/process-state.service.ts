import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProcessoResumoDTO } from '../models/processo/processo-resumo.model';
import { StatusAtribuicao } from '../models/processo/enums.model';
import { Page } from '../models/processo/pagination.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessStateService {
  private http = inject(HttpClient);
  private apiUrl = '/v1/analise/processos';

  // State
  private processes = signal<ProcessoResumoDTO[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private currentPage = signal<number>(0);
  private totalPages = signal<number>(0);

  // Filters
  private filterNivel = signal<string[]>([]);
  private filterStatus = signal<StatusAtribuicao[]>([]);
  private groupBy = signal<'equipeNome' | 'usuarioResponsavel'>('equipeNome');

  // Computed
  readonly allProcesses = computed(() => this.processes());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages() - 1);

  readonly filteredProcesses = computed(() => {
    return this.processes().filter(p => {
      const matchNivel = this.filterNivel().length === 0 || this.filterNivel().includes(p.nivel);
      const matchStatus = this.filterStatus().length === 0 || this.filterStatus().includes(p.statusAtribuicao);

      return matchNivel && matchStatus;
    });
  });

  // Actions
  loadProcesses(append: boolean = false) {
    if (this.loading()) return;

    if (!append) {
      this.currentPage.set(0);
      this.processes.set([]);
    }

    this.loading.set(true);
    let params = new HttpParams()
      .set('page', this.currentPage().toString())
      .set('size', '20')

    this.http.get<Page<ProcessoResumoDTO>>(`${this.apiUrl}`, { params }).pipe(
      tap({
        next: (pageData) => {
          if (append) {
            this.processes.update(procs => [...procs, ...pageData.content]);
          } else {
            this.processes.set(pageData.content);
          }
          this.totalPages.set(pageData.totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erro ao carregar processos');
          this.loading.set(false);
        }
      })
    ).subscribe();
  }

  loadNextPage() {
    if (this.isLastPage()) return;
    this.currentPage.update(p => p + 1);
    this.loadProcesses(true);
  }

  getProcessoDetalhe(numero: string) {
    return this.http.get<any>(`${this.apiUrl}/${numero}`);
  }

  getAuditoriaScore(numero: string) {
    return this.http.get<any[]>(`${this.apiUrl}/${numero}/auditoria-score`);
  }

  adicionarAnotacao(numero: string, texto: string) {
    return this.http.post<void>(`${this.apiUrl}/${numero}/anotacoes`, texto);
  }

  readonly groupedProcesses = computed(() => {
    const key = this.groupBy();
    const filtered = this.filteredProcesses();
    const groups: Record<string, ProcessoResumoDTO[]> = {};

    filtered.forEach(p => {
      const groupKey = p[key] || 'Não Atribuído';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(p);
    });

    return Object.entries(groups).map(([name, items]) => ({
      name,
      items,
      totalScore: items.reduce((acc, curr) => acc + curr.scoreFinal, 0),
      count: items.length
    }));
  });

  // Actions
  setProcesses(data: ProcessoResumoDTO[]) {
    this.processes.set(data);
  }

  setLoading(val: boolean) {
    this.loading.set(val);
  }

  setError(err: string | null) {
    this.error.set(err);
  }

  setFilterNivel(niveis: string[]) {
    this.filterNivel.set(niveis);
  }

  setGroupBy(key: 'equipeNome' | 'usuarioResponsavel') {
    this.groupBy.set(key);
  }
}
