import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
  ],
  templateUrl: './processos.component.html',
  styleUrl: './processos.component.scss',
})
export class ProcessosComponent implements OnInit {
  processState = inject(ProcessStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchQuery = signal<string>('');
  selectedNiveis = signal<string[]>([]);
  selectedStatus = signal<string[]>([]);
  selectedSituacao = signal<string[]>([]);
  selectedAssunto = signal<string>('');

  hasActiveFilters = computed(() =>
    this.selectedNiveis().length > 0 ||
    this.selectedStatus().length > 0 ||
    this.selectedSituacao().length > 0 ||
    this.selectedAssunto().length > 0 ||
    this.searchQuery().length > 0
  );

  totalProcessos = computed(() => this.processState.totalElementCount());

  title = computed(() =>
    this.processState.currentMode() === 'monitorados'
      ? 'Processos Monitorados'
      : 'Processos'
  );

  subtitle = computed(() =>
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
    selectedStatus: any[];
    selectedSituacao: string[];
    selectedAssunto: string;
  }) {
    this.searchQuery.set(filters.searchQuery);
    this.selectedNiveis.set(filters.selectedNiveis);
    this.selectedStatus.set(filters.selectedStatus);
    this.selectedSituacao.set(filters.selectedSituacao);
    this.selectedAssunto.set(filters.selectedAssunto);
    this.processState.setSearchQuery(filters.searchQuery);
    this.processState.setFilterNivel(filters.selectedNiveis);
    this.processState.setFilterStatus(filters.selectedStatus);
    this.processState.setFilterSituacao(filters.selectedSituacao);
    this.processState.setFilterAssunto(filters.selectedAssunto);
  }

  onClearFilters() {
    this.searchQuery.set('');
    this.selectedNiveis.set([]);
    this.selectedStatus.set([]);
    this.selectedSituacao.set([]);
    this.selectedAssunto.set('');
    this.processState.setSearchQuery('');
    this.processState.setFilterNivel([]);
    this.processState.setFilterStatus([]);
    this.processState.setFilterSituacao([]);
    this.processState.setFilterAssunto('');
    this.processState.loadProcesses();
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
    this.router.navigate(['/processos', numero]);
  }

  getScoreColor(score: number): string {
    if (score > 100) return 'high';
    if (score > 50) return 'medium';
    return 'low';
  }
}