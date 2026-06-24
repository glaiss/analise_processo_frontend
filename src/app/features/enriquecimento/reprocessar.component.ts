import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EnriquecimentoService } from '../../core/services/enriquecimento.service';
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
  private service = inject(EnriquecimentoService);
  private snackBar = inject(MatSnackBar);
  
  loading = signal(false);

  executarProcessamento() {
    this.loading.set(true);
    (this.service.processar() as any).subscribe({
      next: () => {
        this.snackBar.open('Processamento iniciado com sucesso', 'Fechar', { duration: 3000 });
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao iniciar processamento', 'Fechar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  executarReprocessamento() {
    this.loading.set(true);
    (this.service.reprocessar() as any).subscribe({
      next: () => {
        this.snackBar.open('Reprocessamento iniciado com sucesso', 'Fechar', { duration: 3000 });
        this.loading.set(false);
      },
      error: () => {
        this.snackBar.open('Erro ao iniciar reprocessamento', 'Fechar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }
}
