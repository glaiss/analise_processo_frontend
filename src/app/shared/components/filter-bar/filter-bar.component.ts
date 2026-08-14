import { Component, input, model, OnDestroy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProcessoSituacao, SCORE_DISPLAY, SCORE_OPTIONS, SITUACAO_DISPLAY, STATUS_DISPLAY, StatusAtribuicao, TIPOLOGIA_DISPLAY, TipologiaProcesso } from '../../../core/models/processo/enums.model';

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
    MatTooltipModule,
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
})
export class FilterBarComponent implements OnDestroy {
  readonly searchQuery = model<string>('');
  readonly selectedNiveis = model<string[]>([]);
  readonly selectedStatus = model<(string)[]>([]);
  readonly selectedSituacao = model<string[]>([]);
  readonly selectedAssunto = model<string>('');
  readonly selectedTipologia = model<TipologiaProcesso[]>([]);

  readonly showAdvanced = model(false);

  readonly statusOptions = Object.values(StatusAtribuicao);
  readonly situacaoOptions = Object.values(ProcessoSituacao);
  readonly tipologiaOptions = Object.values(TipologiaProcesso);
  readonly situacaoDisplay = SITUACAO_DISPLAY;
  readonly statusDisplay = STATUS_DISPLAY;
  readonly tipologiaDisplay = TIPOLOGIA_DISPLAY;
  readonly scoreOptions = [...SCORE_OPTIONS];
  readonly scoreDisplay = SCORE_DISPLAY;

  readonly hasActiveFilters = input(false);

  readonly filterChange = output<{
    searchQuery: string;
    selectedNiveis: string[];
    selectedStatus: string[];
    selectedSituacao: string[];
    selectedAssunto: string;
    selectedTipologia: TipologiaProcesso[];
  }>();
  readonly clearFilters = output<void>();

  private emitSearch() {
    this.filterChange.emit({
      searchQuery: this.searchQuery(),
      selectedNiveis: this.selectedNiveis(),
      selectedStatus: this.selectedStatus(),
      selectedSituacao: this.selectedSituacao(),
      selectedAssunto: this.selectedAssunto(),
      selectedTipologia: this.selectedTipologia(),
    });
  }

  private readonly assuntoDebounceMs = 3000;
  private assuntoDebounceTimer: ReturnType<typeof setTimeout> | undefined;

  onSearch() {
    this.emitSearch();
  }

  onClear() {
    if (this.assuntoDebounceTimer) {
      clearTimeout(this.assuntoDebounceTimer);
      this.assuntoDebounceTimer = undefined;
    }
    this.searchQuery.set('');
    this.selectedNiveis.set([]);
    this.selectedStatus.set([]);
    this.selectedSituacao.set([]);
    this.selectedAssunto.set('');
    this.selectedTipologia.set([]);
    this.showAdvanced.set(false);
    this.clearFilters.emit();
  }

  onStatusChange(values: string[]) {
    this.selectedStatus.set(values);
    this.emitSearch();
  }

  onSituacaoChange(values: string[]) {
    this.selectedSituacao.set(values);
    this.emitSearch();
  }

  onTipologiaChange(values: TipologiaProcesso[]) {
    this.selectedTipologia.set(values);
    this.emitSearch();
  }

  onScoreChange(values: string[]) {
    this.selectedNiveis.set(values);
    this.emitSearch();
  }

  onAssuntoInput(value: string) {
    this.selectedAssunto.set(value);
    if (this.assuntoDebounceTimer) {
      clearTimeout(this.assuntoDebounceTimer);
    }
    this.assuntoDebounceTimer = setTimeout(() => {
      this.assuntoDebounceTimer = undefined;
      this.emitSearch();
    }, this.assuntoDebounceMs);
  }

  onAssuntoSearch() {
    if (this.assuntoDebounceTimer) {
      clearTimeout(this.assuntoDebounceTimer);
      this.assuntoDebounceTimer = undefined;
    }
    this.emitSearch();
  }

  ngOnDestroy() {
    if (this.assuntoDebounceTimer) {
      clearTimeout(this.assuntoDebounceTimer);
    }
  }

  toggleAdvanced() {
    this.showAdvanced.update((v) => !v);
  }
}