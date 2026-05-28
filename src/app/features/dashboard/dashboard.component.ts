import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProcessCardComponent } from '../../shared/components/process-card/process-card.component';
import { DistributionService } from '../../core/services/distribution.service';
import { AtribuicaoProcessoResumoDTO } from '../../core/models/processo/atribuicao-processo-resumo.model';
import { ProcessoResumoDTO } from '../../core/models/processo/processo-resumo.model'; // Added missing import

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProcessCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private distributionService = inject(DistributionService);
  processes = signal<AtribuicaoProcessoResumoDTO[]>([]);
  loading = signal(false);
  viewMode = signal<'meus' | 'equipe'>('meus');

  ngOnInit() {
    this.loadProcesses();
  }

  loadProcesses() {
    this.loading.set(true);
    const request = this.viewMode() === 'meus' 
      ? this.distributionService.getMeusProcessos()
      : this.distributionService.getProcessosEquipe();

    request.subscribe({
      next: (page) => {
        this.processes.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onViewModeChange(event: any) {
    this.viewMode.set(event.value);
    this.loadProcesses();
  }
}
