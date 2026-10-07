import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProcessStateService } from '../../core/services/process-state.service';
import { EtiquetaService } from '../../core/services/etiqueta.service';
import { InfiniteScrollComponent } from '../../shared/components/infinite-scroll/infinite-scroll.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { ContentLoaderComponent } from '../../shared/components/content-loader/content-loader.component';
import { TipologiaProcesso } from '../../core/models/processo/enums.model';
import { EtiquetaDTO } from '../../core/models/processo/etiqueta.model';
import { ProcessCardCompactComponent } from '../../shared/components/process-card-compact/process-card-compact.component';

@Component({
  selector: 'app-processos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    InfiniteScrollComponent,
    PageHeaderComponent,
    FilterBarComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ContentLoaderComponent,
    ProcessCardCompactComponent,
  ],
  templateUrl: './processos.component.html',
  styleUrl: './processos.component.scss',
})
export class ProcessosComponent implements OnInit {
  processState = inject(ProcessStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly etiquetaService = inject(EtiquetaService);

  readonly searchQuery = signal<string>('');
  readonly selectedNiveis = signal<string[]>([]);
  readonly selectedStatus = signal<string[]>([]);
  readonly selectedSituacao = signal<string[]>([]);
  readonly selectedAssunto = signal<string>('');
  readonly selectedTipologia = signal<TipologiaProcesso[]>([]);
  readonly selectedEtiquetas = signal<string[]>([]);
  readonly autorComAdvogado = signal(false);
  readonly autorSemAdvogado = signal(false);
  readonly partesComAdvogado = signal(false);
  readonly partesSemAdvogado = signal(false);
  readonly semAdvogado = signal(false);
  readonly etiquetaOptions = signal<EtiquetaDTO[]>([]);

  readonly hasActiveFilters = computed(() =>
    this.selectedNiveis().length > 0 ||
    this.selectedStatus().length > 0 ||
    this.selectedSituacao().length > 0 ||
    this.selectedAssunto().length > 0 ||
    this.selectedTipologia().length > 0 ||
    this.selectedEtiquetas().length > 0 ||
    this.autorComAdvogado() ||
    this.autorSemAdvogado() ||
    this.partesComAdvogado() ||
    this.partesSemAdvogado() ||
    this.semAdvogado() ||
    this.searchQuery().length > 0
  );

  readonly totalProcessos = computed(() => this.processState.totalElementCount());

  readonly title = computed(() =>
    this.processState.currentMode() === 'monitorados'
      ? 'Processos Monitorados'
      : 'Processos'
  );

  readonly subtitle = computed(() =>
    this.processState.currentMode() === 'monitorados'
      ? 'Lista de processos que você está acompanhando'
      : 'Sherlock Laws - Gerenciamento e análise de processos judiciais'
  );

  ngOnInit() {
    this.route.data.subscribe(data => {
      const isMonitorados = data['monitorados'] === true;
      this.processState.setMode(isMonitorados ? 'monitorados' : 'all');
    });

    this.etiquetaService.listar().subscribe({
      next: (etiquetas) => this.etiquetaOptions.set(etiquetas),
      error: () => this.etiquetaOptions.set([]),
    });
  }

  onFilterChange(filters: {
    searchQuery: string;
    selectedNiveis: string[];
    selectedStatus: string[];
    selectedSituacao: string[];
    selectedAssunto: string;
    selectedTipologia: TipologiaProcesso[];
    selectedEtiquetas: string[];
    autorComAdvogado: boolean;
    autorSemAdvogado: boolean;
    partesComAdvogado: boolean;
    partesSemAdvogado: boolean;
    semAdvogado: boolean;
  }) {
    this.searchQuery.set(filters.searchQuery);
    this.selectedNiveis.set(filters.selectedNiveis);
    this.selectedStatus.set(filters.selectedStatus);
    this.selectedSituacao.set(filters.selectedSituacao);
    this.selectedAssunto.set(filters.selectedAssunto);
    this.selectedTipologia.set(filters.selectedTipologia);
    this.selectedEtiquetas.set(filters.selectedEtiquetas);
    this.autorComAdvogado.set(filters.autorComAdvogado);
    this.autorSemAdvogado.set(filters.autorSemAdvogado);
    this.partesComAdvogado.set(filters.partesComAdvogado);
    this.partesSemAdvogado.set(filters.partesSemAdvogado);
    this.semAdvogado.set(filters.semAdvogado);
    this.processState.setAllFilters({
      searchQuery: filters.searchQuery,
      niveis: filters.selectedNiveis,
      status: filters.selectedStatus as any,
      situacao: filters.selectedSituacao,
      assunto: filters.selectedAssunto,
      processosTipologia: filters.selectedTipologia,
      etiquetas: filters.selectedEtiquetas,
      autorComAdvogado: filters.autorComAdvogado,
      autorSemAdvogado: filters.autorSemAdvogado,
      partesComAdvogado: filters.partesComAdvogado,
      partesSemAdvogado: filters.partesSemAdvogado,
      semAdvogado: filters.semAdvogado,
    });
  }

  onClearFilters() {
    this.searchQuery.set('');
    this.selectedNiveis.set([]);
    this.selectedStatus.set([]);
    this.selectedSituacao.set([]);
    this.selectedAssunto.set('');
    this.selectedTipologia.set([]);
    this.selectedEtiquetas.set([]);
    this.autorComAdvogado.set(false);
    this.autorSemAdvogado.set(false);
    this.partesComAdvogado.set(false);
    this.partesSemAdvogado.set(false);
    this.semAdvogado.set(false);
    this.processState.setAllFilters({
      searchQuery: '',
      niveis: [],
      status: [],
      situacao: [],
      assunto: '',
      processosTipologia: [],
      etiquetas: [],
      autorComAdvogado: false,
      autorSemAdvogado: false,
      partesComAdvogado: false,
      partesSemAdvogado: false,
      semAdvogado: false,
    });
  }

  toggleMonitoramento(numero: string) {
    this.processState.alternarMonitoramento(numero).subscribe();
  }

  onScroll() {
    this.processState.loadNextPage();
  }

  onRetry() {
    this.processState.loadProcesses();
  }

  openProcess(numero: string) {
    void this.router.navigate(['/processos', numero]);
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  }
}