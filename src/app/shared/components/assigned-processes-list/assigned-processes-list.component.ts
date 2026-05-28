import { Component, inject, OnInit, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DistributionService } from '../../../core/services/distribution.service';
import { InfiniteScrollComponent } from '../infinite-scroll/infinite-scroll.component';
import { AssignedProcessCardComponent } from '../assigned-process-card/assigned-process-card.component'; // New import
import { AtribuicaoProcessoResumoDTO } from '../../../core/models/processo/atribuicao-processo-resumo.model';
import { Page } from '../../../core/models/processo/pagination.model';

@Component({
  selector: 'app-assigned-processes-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, InfiniteScrollComponent, AssignedProcessCardComponent],
  templateUrl: './assigned-processes-list.component.html', // Point to a new HTML file
  styleUrl: './assigned-processes-list.component.scss'
})
export class AssignedProcessesListComponent implements OnInit {
  @Input({ required: true }) mode!: 'meus' | 'equipe';
  @Input() title: string = 'Processos Atribuídos';

  private distService = inject(DistributionService);
  atribuicoes: AtribuicaoProcessoResumoDTO[] = [];
  isLoading = signal(false);
  currentPage = 0;
  isLastPage = false;
  
  displayedColumns: string[] = [];

  ngOnInit() {
    this.title = this.mode === 'meus' ? 'Meus Processos' : 'Processos da Equipe';
    this.displayedColumns = this.mode === 'meus'
      ? ['processoNumero', 'processoTribunal', 'processoScoreFinal', 'status', 'statusPrazo']
      : ['processoNumero', 'usuarioUsername', 'processoTribunal', 'processoScoreFinal', 'status', 'statusPrazo'];
    this.loadProcesses();
  }

  loadProcesses() {
    if (this.isLoading() || this.isLastPage) return;
    this.isLoading.set(true);
    
    const request = this.mode === 'meus' 
      ? this.distService.getMeusProcessos()
      : this.distService.getProcessosEquipe();

    request.subscribe({
      next: (page) => {
        this.atribuicoes = [...this.atribuicoes, ...page.content];
        this.currentPage = page.number;
        this.isLastPage = page.last;
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
