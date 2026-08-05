import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { Contrato } from '../../../core/models/financeiro/parcela.model';
import { STATUS_CONTRATO_LABEL, StatusContrato } from '../../../core/models/financeiro/contrato.model';

@Component({
  selector: 'app-contrato-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './contrato-lista.component.html',
  styleUrl: './contrato-lista.component.scss',
})
export class ContratoListaComponent implements OnInit {
  private readonly financeiroService = inject(FinanceiroService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly contratos = signal<Contrato[]>([]);
  readonly loading = signal(false);
  readonly total = signal(0);
  readonly pageSize = signal(20);

  readonly displayedColumns = ['numero', 'cliente', 'modalidade', 'valorTotal', 'valorPendente', 'status', 'acoes'];
  readonly statusLabels = STATUS_CONTRATO_LABEL;

  statusLabel(status: StatusContrato): string {
    return STATUS_CONTRATO_LABEL[status] ?? status;
  }

  ngOnInit() {
    this.carregar(0, this.pageSize());
  }

  carregar(page: number, size: number) {
    this.loading.set(true);
    this.financeiroService.listarContratos(page, size).subscribe({
      next: (p) => {
        this.contratos.set(p.content);
        this.total.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar contratos');
        this.loading.set(false);
      },
    });
  }

  onPage(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.carregar(event.pageIndex, event.pageSize);
  }

  abrirSituacao(id: string) {
    void this.router.navigate(['/financeiro/contratos', id]);
  }

  novoContrato() {
    void this.router.navigate(['/financeiro/contratos/novo']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);
  }
}
