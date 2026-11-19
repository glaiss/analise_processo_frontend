import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AcompanhamentoService } from '../../../core/services/acompanhamento.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ProcessoAcompanhadoDetalheDTO } from '../../../core/models/acompanhamento/acompanhamento.model';
import { fonteLabel } from '../../../core/models/acompanhamento/fonte-acompanhamento';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { pendenciaLabel, statusColor, statusLabel } from '../../../core/utils/acompanhamento-status.util';

@Component({
  selector: 'app-acompanhamento-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './acompanhamento-details.component.html',
  styleUrl: './acompanhamento-details.component.scss',
})
export class AcompanhamentoDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly acompanhamentoService = inject(AcompanhamentoService);
  private readonly notification = inject(NotificationService);

  readonly numero = signal('');
  readonly processo = signal<ProcessoAcompanhadoDetalheDTO | null>(null);
  readonly carregando = signal(true);
  readonly sincronizando = signal(false);
  readonly erro = signal('');

  readonly statusLabel = statusLabel;
  readonly statusColor = statusColor;
  readonly fonteLabel = fonteLabel;
  readonly pendenciaLabel = pendenciaLabel;

  ngOnInit() {
    const numero = this.route.snapshot.paramMap.get('numero');
    if (!numero) {
      this.erro.set('Número do processo não informado.');
      this.carregando.set(false);
      return;
    }
    this.numero.set(numero);
    this.carregar(numero);
  }

  carregar(numero: string) {
    this.carregando.set(true);
    this.erro.set('');
    this.acompanhamentoService.obterDetalhe(numero).subscribe({
      next: (processo) => {
        this.processo.set(processo);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os detalhes do processo.');
        this.carregando.set(false);
      },
    });
  }

  sincronizarProcesso() {
    const numero = this.numero();
    if (!numero || this.sincronizando()) return;

    this.sincronizando.set(true);
    this.acompanhamentoService.sincronizarProcesso(numero).subscribe({
      next: (resultado) => {
        this.sincronizando.set(false);
        if (!resultado.encontrado) {
          this.notification.error('Processo não encontrado nas fontes consultadas');
        } else if (resultado.completo) {
          this.notification.success('Processo reconsultado com dados completos');
        } else {
          this.notification.info('Processo reconsultado, mas há pendências nos dados');
        }
        this.carregar(numero);
      },
      error: () => {
        this.sincronizando.set(false);
        this.notification.error('Erro ao reconsultar o processo');
      },
    });
  }

  voltar() {
    void this.router.navigate(['/acompanhamento']);
  }

  copiarNumero() {
    const numero = this.numero();
    if (!numero) return;
    navigator.clipboard.writeText(numero).then(
      () => this.notification.info('Número do processo copiado'),
      () => this.notification.error('Não foi possível copiar o número'),
    );
  }
}
