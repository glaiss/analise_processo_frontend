import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FinanceiroService } from '../../../core/services/financeiro.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { STATUS_PARCELA_LABEL, SituacaoFinanceira, StatusParcela } from '../../../core/models/financeiro/parcela.model';
import { STATUS_CONTRATO_LABEL } from '../../../core/models/financeiro/contrato.model';
import { RecebimentoDialogComponent } from '../recebimento-dialog/recebimento-dialog.component';

@Component({
  selector: 'app-contrato-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    PageHeaderComponent,
  ],
  templateUrl: './contrato-detalhe.component.html',
  styleUrl: './contrato-detalhe.component.scss',
})
export class ContratoDetalheComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly financeiroService = inject(FinanceiroService);
  private readonly notification = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly situacao = signal<SituacaoFinanceira | null>(null);
  readonly displayedColumns = ['numero', 'vencimento', 'valorPrevisto', 'valorRecebido', 'valorPendente', 'status', 'acoes'];
  readonly statusContratoLabels = STATUS_CONTRATO_LABEL;

  contratoId: string = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigate(['/financeiro/contratos']);
      return;
    }
    this.contratoId = id;
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.financeiroService.situacaoFinanceira(this.contratoId).subscribe({
      next: (s) => {
        this.situacao.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar situação financeira');
        this.loading.set(false);
      },
    });
  }

  registrarRecebimento(parcelaId: string) {
    const dialogRef = this.dialog.open(RecebimentoDialogComponent, {
      width: '480px',
      data: { parcelaId },
    });
    dialogRef.afterClosed().subscribe((registrado: boolean) => {
      if (registrado) {
        this.carregar();
      }
    });
  }

  voltar() {
    void this.router.navigate(['/financeiro/contratos']);
  }

  statusParcelaLabel(status: StatusParcela): string {
    return STATUS_PARCELA_LABEL[status] ?? status;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const [y, m, d] = value.substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }
}
