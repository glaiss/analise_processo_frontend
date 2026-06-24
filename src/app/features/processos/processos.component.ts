import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule, MatChipListboxChange } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { ProcessStateService } from '../../core/services/process-state.service';
import { InfiniteScrollComponent } from '../../shared/components/infinite-scroll/infinite-scroll.component';
import { StatusAtribuicao, ProcessoSituacao } from '../../core/models/processo/enums.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    InfiniteScrollComponent,
    PageHeaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    ContentLoaderComponent
  ],
  templateUrl: './processos.component.html',
  styleUrl: './processos.component.scss'
})
export class ProcessosComponent implements OnInit {
  processState = inject(ProcessStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  searchQuery = signal<string>('');
  showAdvanced = signal(false);

  statusOptions = Object.values(StatusAtribuicao);
  selectedNiveis = signal<string[]>([]);
  selectedStatus = signal<StatusAtribuicao[]>([]);
  selectedSituacao = signal<string[]>([]);
  selectedAssunto = signal<string>('');

  situacaoOptions = Object.values(ProcessoSituacao);

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
      : 'Gerenciamento e análise de processos judiciais'
  );

  ngOnInit() {
    this.route.data.subscribe(data => {
      const isMonitorados = data['monitorados'] === true;
      this.processState.setMode(isMonitorados ? 'monitorados' : 'all');
    });
  }

  onSearch() {
    this.processState.setSearchQuery(this.searchQuery());
  }

  onNivelChange(values: string[]) {
    this.selectedNiveis.set(values);
    this.processState.setFilterNivel(values);
  }

  onChipNivelChange(event: MatChipListboxChange) {
    this.onNivelChange(event.value as string[]);
  }

  onStatusChange(values: StatusAtribuicao[]) {
    this.selectedStatus.set(values);
    this.processState.setFilterStatus(values);
  }

  onSituacaoChange(values: string[]) {
    this.selectedSituacao.set(values);
    this.processState.setFilterSituacao(values);
  }

  onAssuntoSearch() {
    this.processState.setFilterAssunto(this.selectedAssunto());
  }

  toggleMonitoramento(numero: string, event: MouseEvent) {
    event.stopPropagation();
    this.processState.alternarMonitoramento(numero).subscribe();
  }
  
  onScroll() {
    this.processState.loadNextPage();
  }

  toggleAdvanced() {
    this.showAdvanced.update(v => !v);
  }

  onRetry() {
    this.processState.loadProcesses();
  }

  openProcess(numero: string) {
    this.router.navigate(['/processos', numero]);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedNiveis.set([]);
    this.selectedStatus.set([]);
    this.selectedSituacao.set([]);
    this.selectedAssunto.set('');
    this.processState.setFilterNivel([]);
    this.processState.setFilterStatus([]);
    this.processState.setFilterSituacao([]);
    this.processState.setFilterAssunto('');
    this.processState.setSearchQuery('');
    this.processState.loadProcesses();
  }

  getScoreColor(score: number): string {
    if (score > 100) return 'high';
    if (score > 50) return 'medium';
    return 'low';
  }
}
