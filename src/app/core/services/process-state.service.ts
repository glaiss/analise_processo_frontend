import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProcessoResumoDTO } from '../models/processo/processo-resumo.model';
import { StatusAtribuicao } from '../models/processo/enums.model';
import { Page } from '../models/processo/pagination.model';
import { tap, catchError, of, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessStateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/v1/analise/processos`;

  // State
  private processes = signal<ProcessoResumoDTO[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private currentPage = signal<number>(0);
  private totalPages = signal<number>(0);
  private totalElements = signal<number>(0);
  private mode = signal<'all' | 'monitorados'>('all');

  // Filters
  private filterNivel = signal<string[]>([]);
  private filterStatus = signal<StatusAtribuicao[]>([]);
  private filterSituacao = signal<string[]>([]);
  private filterAssunto = signal<string>('');
  private searchQuery = signal<string>('');
  private groupBy = signal<'equipeNome' | 'usuarioResponsavel'>('equipeNome');

  // Computed
  readonly allProcesses = computed(() => this.processes());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());
  readonly isLastPage = computed(() => this.currentPage() >= this.totalPages() - 1);
  readonly currentMode = computed(() => this.mode());
  readonly totalElementCount = computed(() => this.totalElements());

  // Actions
  setMode(mode: 'all' | 'monitorados') {
    this.mode.set(mode);
    this.loadProcesses();
  }

  loadProcesses(append: boolean = false) {
    if (this.loading()) return;

    if (!append) {
      this.currentPage.set(0);
      this.processes.set([]);
    }

    this.loading.set(true);
    let params = new HttpParams()
      .set('page', this.currentPage().toString())
      .set('size', '20');

    if (this.searchQuery()) {
      params = params.set('numero', this.searchQuery());
    }

    if (this.filterAssunto()) {
      params = params.set('assunto', this.filterAssunto());
    }

    this.filterNivel().forEach(nivel => {
      params = params.append('niveis', nivel);
    });

    this.filterStatus().forEach(status => {
      params = params.append('status', status);
    });

    this.filterSituacao().forEach(situacao => {
      params = params.append('situacao', situacao);
    });

    const endpoint = this.mode() === 'monitorados' ? `${this.apiUrl}/monitorados` : this.apiUrl;

    this.http.get<Page<ProcessoResumoDTO>>(endpoint, { params }).pipe(
      tap({
        next: (pageData) => {
          if (append) {
            this.processes.update(procs => [...procs, ...pageData.content]);
          } else {
            this.processes.set(pageData.content);
          }
          this.totalPages.set(pageData.totalPages);
          this.totalElements.set(pageData.totalElements);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erro ao carregar processos');
          this.loading.set(false);
        }
      })
    ).subscribe({ error: () => {} });
  }

  loadNextPage() {
    if (this.isLastPage()) return;
    this.currentPage.update(p => p + 1);
    this.loadProcesses(true);
  }

  setFilterNivel(niveis: string[]) {
    this.filterNivel.set(niveis);
    this.loadProcesses();
  }

  setFilterStatus(status: StatusAtribuicao[]) {
    this.filterStatus.set(status);
    this.loadProcesses();
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
    this.loadProcesses();
  }

  setFilterSituacao(situacoes: string[]) {
    this.filterSituacao.set(situacoes);
    this.loadProcesses();
  }

  setFilterAssunto(assunto: string) {
    this.filterAssunto.set(assunto);
    this.loadProcesses();
  }

  readonly filteredProcesses = computed(() => this.processes());

  getProcessoDetalhe(numero: string) {
    return this.http.get<any>(`${this.apiUrl}/${numero}`);
  }

  getAuditoriaScore(numero: string) {
    return this.http.get<any[]>(`${this.apiUrl}/${numero}/auditoria-score`);
  }

  adicionarAnotacao(numero: string, texto: string) {
    return this.http.post<void>(`${this.apiUrl}/${numero}/anotacoes`, texto);
  }

  deletarAnotacao(numero: string, anotacaoId: string) {
    return this.http.delete<void>(`${this.apiUrl}/${numero}/anotacoes/${anotacaoId}`);
  }

  alternarMonitoramento(numero: string) {
    const previous = this.processes();
    this.processes.update(list =>
      list.map(p =>
        p.numero === numero ? { ...p, monitorado: !p.monitorado } : p
      )
    );
    return this.http.post<void>(`${this.apiUrl}/${numero}/monitorar`, {}).pipe(
      catchError(() => {
        this.processes.set(previous);
        return of(void 0);
      })
    );
  }

  readonly groupedProcesses = computed(() => {
    const key = this.groupBy();
    const filtered = this.allProcesses();
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

  setGroupBy(key: 'equipeNome' | 'usuarioResponsavel') {
    this.groupBy.set(key);
  }

  discardProcess(numero: string) {
    return this.http.delete<void>(`${this.apiUrl}/${numero}/descartar`);
  }
}
