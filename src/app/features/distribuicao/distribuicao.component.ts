import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DistributionService } from '../../core/services/distribution.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-distribuicao',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './distribuicao.component.html',
  styleUrl: './distribuicao.component.scss'
})
export class DistribuicaoComponent {
  private distService = inject(DistributionService);
  private notification = inject(NotificationService);
  loading = signal(false);

  executar() {
    this.loading.set(true);
    this.distService.executarDistribuicao().subscribe({
      next: () => {
        this.notification.success('Distribuição executada com sucesso!');
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Erro ao executar distribuição.');
        this.loading.set(false);
      }
    });
  }
}
