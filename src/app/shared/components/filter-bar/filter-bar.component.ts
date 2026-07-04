import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule, MatChipListboxChange } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StatusAtribuicao, ProcessoSituacao } from '../../../core/models/processo/enums.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
})
export class FilterBarComponent {
  searchQuery = model<string>('');
  selectedNiveis = model<string[]>([]);
  selectedStatus = model<(string)[]>([]);
  selectedSituacao = model<string[]>([]);
  selectedAssunto = model<string>('');

  showAdvanced = model(false);

  readonly statusOptions = Object.values(StatusAtribuicao);
  readonly situacaoOptions = Object.values(ProcessoSituacao);

  hasActiveFilters = input(false);

  search = output<void>();
  clearFilters = output<void>();

  onSearch() {
    this.search.emit();
  }

  onClear() {
    this.searchQuery.set('');
    this.selectedNiveis.set([]);
    this.selectedStatus.set([]);
    this.selectedSituacao.set([]);
    this.selectedAssunto.set('');
    this.showAdvanced.set(false);
    this.clearFilters.emit();
  }

  onStatusChange(values: string[]) {
    this.selectedStatus.set(values);
  }

  onSituacaoChange(values: string[]) {
    this.selectedSituacao.set(values);
  }

  onChipNivelChange(event: MatChipListboxChange) {
    this.selectedNiveis.set(event.value as string[]);
  }

  onAssuntoSearch() {
    this.search.emit();
  }

  toggleAdvanced() {
    this.showAdvanced.update((v) => !v);
  }
}