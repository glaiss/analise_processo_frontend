import { Injectable, signal, computed } from '@angular/core';
import { ProcessoResumoDTO, StatusAtribuicao } from '../models/processo.model';

@Injectable({
  providedIn: 'root'
})
export class ProcessStateService {
  // State
  private processes = signal<ProcessoResumoDTO[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);

  // Filters
  private filterNivel = signal<string[]>(['ALTO', 'INTERMEDIARIO_ALTO']);
  private filterStatus = signal<StatusAtribuicao[]>([]);
  private groupBy = signal<'equipeNome' | 'usuarioResponsavel'>('equipeNome');

  // Computed
  readonly allProcesses = computed(() => this.processes());
  readonly isLoading = computed(() => this.loading());
  readonly errorMessage = computed(() => this.error());

  readonly filteredProcesses = computed(() => {
    return this.processes().filter(p => {
      const matchNivel = this.filterNivel().length === 0 || this.filterNivel().includes(p.nivel);
      const matchStatus = this.filterStatus().length === 0 || this.filterStatus().includes(p.statusAtribuicao);
      return matchNivel && matchStatus;
    });
  });

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
