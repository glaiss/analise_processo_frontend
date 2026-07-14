import { Component, Input, OnChanges, OnInit, SimpleChanges, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { DistributionService, ProcessoFilterParams } from '../../../core/services/distribution.service';
import { EnriquecimentoService } from '../../../core/services/enriquecimento.service';
import { NotificationService } from '../../../core/services/notification.service';
import { InfiniteScrollComponent } from '../infinite-scroll/infinite-scroll.component';
import { AssignedProcessCardComponent } from '../assigned-process-card/assigned-process-card.component';
import { AtribuicaoProcessoResumoDTO } from '../../../core/models/processo/atribuicao-processo-resumo.model';
import { LoadingOverlayComponent } from '../loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-assigned-processes-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatBadgeModule, MatProgressSpinnerModule, InfiniteScrollComponent, AssignedProcessCardComponent, LoadingOverlayComponent, EmptyStateComponent],
  templateUrl: './assigned-processes-list.component.html',
  styleUrl: './assigned-processes-list.component.scss'
})
export class AssignedProcessesListComponent implements OnInit, OnChanges {
  @Input({ required: true }) mode!: 'meus' | 'equipe';
  @Input() title: string = 'Processos Atribuídos';
  @Input() filter?: ProcessoFilterParams;

  private readonly distService = inject(DistributionService);
  private readonly enriquecimentoService = inject(EnriquecimentoService);
  private readonly notification = inject(NotificationService);

  atribuicoes: AtribuicaoProcessoResumoDTO[] = [];
  readonly isLoading = signal(false);
  currentPage = 0;
  isLastPage = false;
  totalElements = 0;

  readonly selectedNumeros = signal<Set<string>>(new Set());
  readonly reprocessando = signal(false);

  readonly selectedCount = computed(() => this.selectedNumeros().size);

  ngOnInit() {
    this.title = this.mode === 'meus' ? 'Meus Processos' : 'Processos da Equipe';
    this.loadProcesses();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mode'] && !changes['mode'].firstChange) {
      this.resetList();
    }
    if (changes['filter'] && !changes['filter'].firstChange) {
      this.resetList();
    }
  }

  resetList() {
    this.atribuicoes = [];
    this.currentPage = 0;
    this.isLastPage = false;
    this.totalElements = 0;
    this.selectedNumeros.set(new Set());
    this.loadProcesses();
  }

  loadProcesses() {
    if (this.isLoading() || this.isLastPage) return;
    this.isLoading.set(true);

    const request = this.mode === 'meus'
      ? this.distService.getMeusProcessos(this.currentPage, 20, this.filter)
      : this.distService.getProcessosEquipe(this.currentPage, 20, this.filter);

    request.subscribe({
      next: (page) => {
        this.atribuicoes = [...this.atribuicoes, ...page.content];
        this.currentPage = page.number;
        this.isLastPage = page.last;
        this.totalElements = page.totalElements;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(`Erro ao carregar processos (${this.mode}):`, err);
        this.isLoading.set(false);
      }
    });
  }

  onScroll() {
    if (!this.isLastPage) {
      this.currentPage++;
      this.loadProcesses();
    }
  }

  toggleSelection(numero: string, selected: boolean) {
    this.selectedNumeros.update(set => {
      const newSet = new Set(set);
      if (selected) {
        newSet.add(numero);
      } else {
        newSet.delete(numero);
      }
      return newSet;
    });
  }

  reprocessarSelecionados() {
    const numeros = Array.from(this.selectedNumeros());
    if (numeros.length === 0) return;

    this.reprocessando.set(true);
    this.enriquecimentoService.reprocessarPorNumeros(numeros).subscribe({
      next: (response) => {
        const successes = response.resultados.filter(r => r.sucesso).length;
        const failures = response.resultados.filter(r => !r.sucesso).length;
        if (failures === 0) {
          this.notification.success(`${successes} processo${successes > 1 ? 's' : ''} enviado${successes > 1 ? 's' : ''} para scraping`, 5000);
        } else {
          this.notification.warn(`${successes} enviado${successes > 1 ? 's' : ''}, ${failures} com erro`, 8000);
        }
        this.selectedNumeros.set(new Set());
        this.reprocessando.set(false);
      },
      error: () => {
        this.notification.error('Erro ao enviar processos para scraping', 5000);
        this.reprocessando.set(false);
      }
    });
  }
}
