import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EnriquecimentoService } from '../../core/services/enriquecimento.service';
import { NotificationService } from '../../core/services/notification.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-reprocessar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  templateUrl: './reprocessar.component.html',
  styleUrl: './reprocessar.component.scss'
})
export class ReprocessarComponent {
  private readonly service = inject(EnriquecimentoService);
  private readonly notification = inject(NotificationService);
  
  readonly loading = signal(false);

  executarProcessamento() {
    this.loading.set(true);
    (this.service.processar() as any).subscribe({
      next: () => {
        this.notification.success('Processamento iniciado com sucesso', 3000);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Erro ao iniciar processamento', 3000);
        this.loading.set(false);
      }
    });
  }

  executarReprocessamento() {
    this.loading.set(true);
    (this.service.reprocessar() as any).subscribe({
      next: () => {
        this.notification.success('Reprocessamento iniciado com sucesso', 3000);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Erro ao iniciar reprocessamento', 3000);
        this.loading.set(false);
      }
    });
  }
}
