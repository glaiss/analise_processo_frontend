import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, MatChipListboxChange } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssignedProcessesListComponent } from '../../shared/components/assigned-processes-list/assigned-processes-list.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusAtribuicao, ProcessoSituacao } from '../../core/models/processo/enums.model';
import { ProcessoFilterParams } from '../../core/services/distribution.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    AssignedProcessesListComponent,
    PageHeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  viewMode = signal<'meus' | 'equipe'>('meus');

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

  filterParams = computed<ProcessoFilterParams | undefined>(() => {
    if (!this.hasActiveFilters()) return undefined;
    return {
      numero: this.searchQuery() || undefined,
      niveis: this.selectedNiveis().length > 0 ? this.selectedNiveis() : undefined,
      status: this.selectedStatus().length > 0 ? this.selectedStatus() : undefined,
      situacao: this.selectedSituacao().length > 0 ? this.selectedSituacao() : undefined,
      assunto: this.selectedAssunto() || undefined
    };
  });

  onViewModeChange(event: any) {
    this.viewMode.set(event.value);
  }

  onSearch() {
    this.filterParams();
  }

  onNivelChange(values: string[]) {
    this.selectedNiveis.set(values);
  }

  onChipNivelChange(event: MatChipListboxChange) {
    this.onNivelChange(event.value as string[]);
  }

  onStatusChange(values: StatusAtribuicao[]) {
    this.selectedStatus.set(values);
  }

  onSituacaoChange(values: string[]) {
    this.selectedSituacao.set(values);
  }

  onAssuntoSearch() {
    this.selectedAssunto.set(this.selectedAssunto());
  }

  toggleAdvanced() {
    this.showAdvanced.update(v => !v);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedNiveis.set([]);
    this.selectedStatus.set([]);
    this.selectedSituacao.set([]);
    this.selectedAssunto.set('');
  }
}
