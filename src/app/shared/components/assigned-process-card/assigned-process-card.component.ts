import { Component, Input, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AtribuicaoProcessoResumoDTO,
  ProcessoSituacao,
  StatusAtribuicao,
  TipologiaProcesso,
} from '../../../core/models/processo/index';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { ProcessStateService } from '../../../core/services/process-state.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-assigned-process-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './assigned-process-card.component.html',
  styleUrl: './assigned-process-card.component.scss',
})
export class AssignedProcessCardComponent {
  private readonly router = inject(Router);
  private readonly processState = inject(ProcessStateService);
  private readonly notification = inject(NotificationService);

  @Input({ required: true }) atribuicao!: AtribuicaoProcessoResumoDTO;
  @Input() selected: boolean = false;
  @Input() showUsuario: boolean = false;

  readonly selectedChange = output<boolean>();
  readonly viewDetails = output<string>();

  toggleSelection(event: Event) {
    event.stopPropagation();
    this.selected = !this.selected;
    this.selectedChange.emit(this.selected);
  }

  toggleMonitoramento(event: Event) {
    event.stopPropagation();
    const previous = this.atribuicao.monitorado;
    this.atribuicao.monitorado = !this.atribuicao.monitorado;
    this.processState.alternarMonitoramento(this.atribuicao.processoNumero).subscribe({
      error: () => {
        this.atribuicao.monitorado = previous;
      },
    });
  }

  copyProcessNumber(event: Event) {
    event.stopPropagation();
    void navigator.clipboard.writeText(this.atribuicao.processoNumero).then(() => {
      this.notification.success('Número do processo copiado!', 2000);
    });
  }

  get statusColor(): string {
    switch (this.atribuicao.status) {
      case StatusAtribuicao.NAO_DISPONIVEL:
        return 'basic';
      case StatusAtribuicao.DISPONIVEL:
        return 'primary';
      case StatusAtribuicao.ATRIBUIDO:
        return 'accent';
      case StatusAtribuicao.EM_CONVERSA:
        return 'accent';
      case StatusAtribuicao.EM_NEGOCIACAO:
        return 'accent';
      case StatusAtribuicao.CONCLUIDO_SUCESSO:
        return 'success';
      case StatusAtribuicao.CONCLUIDO_RECUSADO:
        return 'warn';
      default:
        return 'basic';
    }
  }

  get statusPrazoColor(): string {
    if (this.atribuicao.statusPrazo === 'URGENTE') return 'warn';
    return 'primary';
  }

  get scoreColor(): string {
    if (this.atribuicao.processoScoreFinal >= 80) return '';
    if (this.atribuicao.processoScoreFinal >= 50) return 'primary';
    return 'accent';
  }

  get situationColorClass(): string {
    switch (this.atribuicao.processoSituacao) {
      case ProcessoSituacao.AGUARDANDO_DISTRIBUICAO:
      case ProcessoSituacao.PENDENTE_ENRIQUECIMENTO:
        return 'situation-pending';
      case ProcessoSituacao.EM_ENRIQUECIMENTO:
        return 'situation-processing';
      case ProcessoSituacao.ENRIQUECIDO:
        return 'situation-ready';
      case ProcessoSituacao.DESCARTADO_SCORE_BAIXO:
        return 'situation-discarded';
      case ProcessoSituacao.DESCARTADO_POR_USUARIO:
        return 'situation-discarded';
      case ProcessoSituacao.PROPOSTA_APRESENTADA:
        return 'situation-proposal';
      case ProcessoSituacao.FINALIZADO:
        return 'situation-finished';
      case ProcessoSituacao.ERRO_PROCESSAMENTO:
        return 'situation-error';
      default:
        return '';
    }
  }

  async openDetails(event: Event) {
    event.stopPropagation();
    void this.router.navigate(['/processos', this.atribuicao.processoNumero]);
    if(!this.atribuicao.isLido){
      await this.markAsRead();
    }
  }

  async markAsRead() {
    this.processState.marcarComoLido(this.atribuicao.processoNumero).subscribe({
      next: () => {},
      error: () => {
        this.notification.error('Erro ao atualizar processo', 3000);
      },
    });
  }
}
