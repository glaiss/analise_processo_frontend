import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IngestionService } from '../../core/services/ingestion.service';
import { NotificationService } from '../../core/services/notification.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-ingestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageHeaderComponent
  ],
  templateUrl: './ingestion.component.html',
  styleUrl: './ingestion.component.scss'
})
export class IngestionComponent {
  private ingestionService = inject(IngestionService);
  private notification = inject(NotificationService);

  loading = signal<boolean>(false);
  
  formData = {
    tribunal: 'TJSP',
    total: 100,
    size: 100
  };

  tribunais = ['TJSP', 'TRT2', 'TRT15'];

  onSubmit() {
    this.loading.set(true);
    this.ingestionService.sincronizar(this.formData.tribunal, this.formData.total, this.formData.size)
      .subscribe({
        next: (res) => {
          this.notification.success(res.mensagem);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }
}
