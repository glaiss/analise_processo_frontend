import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { DistributionService } from '../../core/services/distribution.service';
import { NotificationService } from '../../core/services/notification.service';
import { EquipeService, EquipeDto } from '../../core/services/equipe.service';
import { Page } from '../../core/models/processo/pagination.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingOverlayComponent } from '../../shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-distribuicao',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    FormsModule,
    PageHeaderComponent,
    LoadingOverlayComponent
  ],
  templateUrl: './distribuicao.component.html',
  styleUrl: './distribuicao.component.scss'
})
export class DistribuicaoComponent implements OnInit {
  private distService = inject(DistributionService);
  private equipeService = inject(EquipeService);
  private notification = inject(NotificationService);
  
  loading = signal(false);
  loadingEquipes = signal(false);
  equipes = signal<EquipeDto[]>([]);
  selectedEquipeId = signal<string>('todos');

  ngOnInit() {
    this.loadEquipes();
  }

  loadEquipes() {
    this.loadingEquipes.set(true);
    this.equipeService.getEquipes(0, 100).subscribe({
      next: (page: Page<EquipeDto>) => {
        this.equipes.set(page.content.filter(e => e.ativo));
        this.loadingEquipes.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar equipes');
        this.loadingEquipes.set(false);
      }
    });
  }

  executar() {
    this.loading.set(true);
    const equipeId = this.selectedEquipeId();

    const request$ = (equipeId === 'todos')
      ? this.distService.executarDistribuicao()
      : this.distService.executarDistribuicaoPorEquipe(equipeId);

    request$.subscribe({
      next: () => {
        this.notification.success('Distribuição executada com sucesso!');
        this.loading.set(false);
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Erro ao executar distribuição.';
        this.notification.error(msg);
        this.loading.set(false);
      }
    });
  }
}
