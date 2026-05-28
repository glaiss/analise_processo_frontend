import { Component, inject, OnInit, Input, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DistributionService } from '../../../core/services/distribution.service';
import { InfiniteScrollComponent } from '../infinite-scroll/infinite-scroll.component';
import { AssignedProcessCardComponent } from '../assigned-process-card/assigned-process-card.component';
import { AtribuicaoProcessoResumoDTO } from '../../../core/models/processo/atribuicao-processo-resumo.model';

@Component({
  selector: 'app-assigned-processes-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, InfiniteScrollComponent, AssignedProcessCardComponent],
  templateUrl: './assigned-processes-list.component.html',
  styleUrl: './assigned-processes-list.component.scss'
})
export class AssignedProcessesListComponent implements OnInit, OnChanges {
  @Input({ required: true }) mode!: 'meus' | 'equipe';
  @Input() title: string = 'Processos Atribuídos';

  private distService = inject(DistributionService);
  atribuicoes: AtribuicaoProcessoResumoDTO[] = [];
  isLoading = signal(false);
  currentPage = 0;
  isLastPage = false;
  totalElements = 0;
  
  ngOnInit() {
    this.title = this.mode === 'meus' ? 'Meus Processos' : 'Processos da Equipe';
    this.loadProcesses();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['mode'] && !changes['mode'].firstChange) {
      this.resetList();
    }
  }

  resetList() {
    this.atribuicoes = [];
    this.currentPage = 0;
    this.isLastPage = false;
    this.totalElements = 0;
    this.loadProcesses();
  }

  loadProcesses() {
    if (this.isLoading() || this.isLastPage) return;
    this.isLoading.set(true);
    
    const request = this.mode === 'meus' 
      ? this.distService.getMeusProcessos(this.currentPage)
      : this.distService.getProcessosEquipe(this.currentPage);

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
}
