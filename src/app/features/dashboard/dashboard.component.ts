import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AssignedProcessesListComponent } from '../../shared/components/assigned-processes-list/assigned-processes-list.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { ProcessoFilterParams } from '../../core/services/distribution.service';
import { TipologiaProcesso } from '../../core/models/processo/enums.model';
import { EtiquetaDTO } from '../../core/models/processo/etiqueta.model';
import { EtiquetaService } from '../../core/services/etiqueta.service';

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
export class DashboardComponent implements OnInit {
  private readonly etiquetaService = inject(EtiquetaService);

  readonly viewMode = signal<'meus' | 'equipe'>('meus');

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

  readonly filterParams = computed<ProcessoFilterParams | undefined>(() => {
    if (!this.hasActiveFilters()) return undefined;
    return {
      numero: this.searchQuery() || undefined,
      niveis: this.selectedNiveis().length > 0 ? this.selectedNiveis() : undefined,
      status: this.selectedStatus().length > 0 ? this.selectedStatus() as any : undefined,
      situacao: this.selectedSituacao().length > 0 ? this.selectedSituacao() : undefined,
      assunto: this.selectedAssunto() || undefined,
      processosTipologia: this.selectedTipologia().length > 0 ? this.selectedTipologia() : undefined,
      etiquetas: this.selectedEtiquetas().length > 0 ? this.selectedEtiquetas() : undefined,
      autorComAdvogado: this.autorComAdvogado() || undefined,
      autorSemAdvogado: this.autorSemAdvogado() || undefined,
      partesComAdvogado: this.partesComAdvogado() || undefined,
      partesSemAdvogado: this.partesSemAdvogado() || undefined,
      semAdvogado: this.semAdvogado() || undefined,
    };
  });

  ngOnInit() {
    this.etiquetaService.listar().subscribe({
      next: (etiquetas) => this.etiquetaOptions.set(etiquetas),
      error: () => this.etiquetaOptions.set([]),
    });
  }

  onViewModeChange(event: any) {
    this.viewMode.set(event.value);
  }

  onFilterChange(filters: {
    searchQuery: string;
    selectedNiveis: string[];
    selectedStatus: any[];
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
  }
}