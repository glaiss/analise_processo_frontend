import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AssignedProcessesListComponent } from '../../shared/components/assigned-processes-list/assigned-processes-list.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { ProcessoFilterParams } from '../../core/services/distribution.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatIconModule,
    AssignedProcessesListComponent,
    PageHeaderComponent,
    FilterBarComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly viewMode = signal<'meus' | 'equipe'>('meus');

  readonly searchQuery = signal<string>('');
  readonly selectedNiveis = signal<string[]>([]);
  readonly selectedStatus = signal<string[]>([]);
  readonly selectedSituacao = signal<string[]>([]);
  readonly selectedAssunto = signal<string>('');

  readonly hasActiveFilters = computed(() =>
    this.selectedNiveis().length > 0 ||
    this.selectedStatus().length > 0 ||
    this.selectedSituacao().length > 0 ||
    this.selectedAssunto().length > 0 ||
    this.searchQuery().length > 0
  );

  readonly filterParams = computed<ProcessoFilterParams | undefined>(() => {
    if (!this.hasActiveFilters()) return undefined;
    return {
      numero: this.searchQuery() || undefined,
      niveis: this.selectedNiveis().length > 0 ? this.selectedNiveis() : undefined,
      status: this.selectedStatus().length > 0 ? this.selectedStatus() as any : undefined,
      situacao: this.selectedSituacao().length > 0 ? this.selectedSituacao() : undefined,
      assunto: this.selectedAssunto() || undefined,
    };
  });

  onViewModeChange(event: any) {
    this.viewMode.set(event.value);
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
  }

  onClearFilters() {
    this.searchQuery.set('');
    this.selectedNiveis.set([]);
    this.selectedStatus.set([]);
    this.selectedSituacao.set([]);
    this.selectedAssunto.set('');
  }
}