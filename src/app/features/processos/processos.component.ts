import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { ProcessStateService } from '../../core/services/process-state.service';
import { InfiniteScrollComponent } from '../../shared/components/infinite-scroll/infinite-scroll.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { ContentLoaderComponent } from '../../shared/components/content-loader/content-loader.component';
import { SituacaoDisplayPipe } from '../../shared/pipes/situacao-display.pipe';
import { StatusDisplayPipe } from '../../shared/pipes/status-display.pipe';
import { ScoreDisplayPipe } from '../../shared/pipes/score-display.pipe';
import { TipologiaProcesso } from '../../core/models/processo/enums.model';

@Component({
  selector: 'app-processos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    InfiniteScrollComponent,
    PageHeaderComponent,
    FilterBarComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ContentLoaderComponent,
    SituacaoDisplayPipe,
    StatusDisplayPipe,
    ScoreDisplayPipe,
  ],
  templateUrl: './processos.component.html',
  styleUrl: './processos.component.scss',
})
export class ProcessosComponent implements OnInit {
  processState = inject(ProcessStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly searchQuery = signal<string>('');
  readonly selectedNiveis = signal<string[]>([]);
  readonly selectedStatus = signal<string[]>([]);
  readonly selectedSituacao = signal<string[]>([]);
  readonly selectedAssunto = signal<string>('');
  readonly selectedTipologia = signal<TipologiaProcesso[]>([]);

  readonly hasActiveFilters = computed(() =>
    this.selectedNiveis().length > 0 ||
    this.selectedStatus().length > 0 ||
    this.selectedSituacao().length > 0 ||
    this.selectedAssunto().length > 0 ||
    this.selectedTipologia().length > 0 ||
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
  }

  onFilterChange(filters: {
    searchQuery: string;
    selectedNiveis: string[];
    selectedStatus: string[];
    selectedSituacao: string[];
    selectedAssunto: string;
    selectedTipologia: TipologiaProcesso[];
  }) {
    this.searchQuery.set(filters.searchQuery);
    this.selectedNiveis.set(filters.selectedNiveis);
    this.selectedStatus.set(filters.selectedStatus);
    this.selectedSituacao.set(filters.selectedSituacao);
    this.selectedAssunto.set(filters.selectedAssunto);
    this.selectedTipologia.set(filters.selectedTipologia);
    this.processState.setAllFilters({
      searchQuery: filters.searchQuery,
      niveis: filters.selectedNiveis,
      status: filters.selectedStatus as any,
      situacao: filters.selectedSituacao,
      assunto: filters.selectedAssunto,
      processosTipologia: filters.selectedTipologia,
    });
  }

  onClearFilters() {
    this.searchQuery.set('');
    this.selectedNiveis.set([]);
    this.selectedStatus.set([]);
    this.selectedSituacao.set([]);
    this.selectedAssunto.set('');
    this.selectedTipologia.set([]);
    this.processState.setAllFilters({
      searchQuery: '',
      niveis: [],
      status: [],
      situacao: [],
      assunto: '',
      processosTipologia: [],
    });
  }

  toggleMonitoramento(numero: string, event: MouseEvent) {
    event.stopPropagation();
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