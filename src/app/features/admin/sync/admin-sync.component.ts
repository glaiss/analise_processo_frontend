import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { AdminSyncService } from '../../../core/services/admin-sync.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-admin-sync',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    PageHeaderComponent
  ],
  templateUrl: './admin-sync.component.html',
  styleUrl: './admin-sync.component.scss'
})
export class AdminSyncComponent {
  private readonly syncService = inject(AdminSyncService);
  private readonly notification = inject(NotificationService);

  readonly loadingMovimentos = signal(false);
  readonly loadingClasses = signal(false);
  readonly loadingAssuntos = signal(false);
  readonly loadingTudo = signal(false);
  readonly loadingIngestao = signal(false);

  ingestaoForm = {
    tribunal: 'TJSP',
    total: 100,
    size: 100
  };

  tribunais = ['TJSP', 'TRT2', 'TRT15'];

  syncMovimentos() {
    this.loadingMovimentos.set(true);
    this.syncService.syncMovimentos().subscribe({
      next: (res) => { this.notification.success(res.mensagem); this.loadingMovimentos.set(false); },
      error: () => this.loadingMovimentos.set(false)
    });
  }

  syncClasses() {
    this.loadingClasses.set(true);
    this.syncService.syncClasses().subscribe({
      next: (res) => { this.notification.success(res.mensagem); this.loadingClasses.set(false); },
      error: () => this.loadingClasses.set(false)
    });
  }

  syncAssuntos() {
    this.loadingAssuntos.set(true);
    this.syncService.syncAssuntos().subscribe({
      next: (res) => { this.notification.success(res.mensagem); this.loadingAssuntos.set(false); },
      error: () => this.loadingAssuntos.set(false)
    });
  }

  syncTudo() {
    this.loadingTudo.set(true);
    this.syncService.syncTudo().subscribe({
      next: (res) => { this.notification.success(res.mensagem); this.loadingTudo.set(false); },
      error: () => this.loadingTudo.set(false)
    });
  }

  syncIngestao() {
    this.loadingIngestao.set(true);
    this.syncService.syncIngestao(this.ingestaoForm.tribunal, this.ingestaoForm.total, this.ingestaoForm.size)
      .subscribe({
        next: (res) => { this.notification.success(res.mensagem); this.loadingIngestao.set(false); },
        error: () => this.loadingIngestao.set(false)
      });
  }
}
