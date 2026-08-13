import { Component, Input, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
import { DistributionService } from '../../../core/services/distribution.service';

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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './assigned-process-card.component.html',
  styleUrl: './assigned-process-card.component.scss',
})
export class AssignedProcessCardComponent {
  private readonly router = inject(Router);
  private readonly processState = inject(ProcessStateService);
  private readonly notification = inject(NotificationService);
  private readonly distributionService = inject(DistributionService);

  @Input({ required: true }) atribuicao!: AtribuicaoProcessoResumoDTO;
  @Input() selected: boolean = false;
  @Input() showUsuario: boolean = false;
  @Input() podeEditarPrazo: boolean = false;

  readonly today = new Date();

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

  get prazoDisplayText(): string {
    if (!this.atribuicao.prazoFinal) return '';
    if (this.atribuicao.statusPrazo === 'CUMPRIDO') return 'Cumprido';
    const dias = this.atribuicao.diasPendentes;
    if (dias === null || dias === undefined) return '';
    if (dias < 0) return `${-dias} dia(s) em atraso`;
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence em 1 dia';
    return `Vence em ${dias} dias`;
  }

  get prazoDaysColor(): string {
    if (this.atribuicao.statusPrazo === 'CUMPRIDO') return 'success';
    const dias = this.atribuicao.diasPendentes;
    if (dias === null || dias === undefined) return 'neutral';
    if (dias <= 1) return 'warn';
    if (dias === 2) return 'accent';
    return 'neutral';
  }

  get prazoFinalLabel(): string {
    if (!this.atribuicao.prazoFinal) return '';
    const datePart = this.atribuicao.prazoFinal.substring(0, 10).split('-');
    if (datePart.length !== 3) return this.atribuicao.prazoFinal;
    return `${datePart[2]}/${datePart[1]}/${datePart[0]}`;
  }

  onPrazoDateChange(value: Date | null) {
    if (!value) return;
    const iso = this.toIso(value);
    this.distributionService.definirPrazo(this.atribuicao.id, iso).subscribe({
      next: () => {
        this.atribuicao.prazoFinal = `${iso}T00:00:00`;
        this.atribuicao.diasPendentes = this.diffDays(value);
        this.atribuicao.statusPrazo = 'PENDENTE';
        this.notification.success('Prazo definido com sucesso!');
      },
      error: () => {
        this.notification.error('Erro ao definir prazo', 3000);
      },
    });
  }

  clearPrazo(event: Event) {
    event.stopPropagation();
    this.distributionService.definirPrazo(this.atribuicao.id, null).subscribe({
      next: () => {
        this.atribuicao.prazoFinal = null;
        this.atribuicao.diasPendentes = null;
        this.atribuicao.statusPrazo = '';
        this.atribuicao.prazoVencendo = false;
        this.notification.success('Prazo removido!');
      },
      error: () => {
        this.notification.error('Erro ao remover prazo', 3000);
      },
    });
  }

  private diffDays(date: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((date.getTime() - today.getTime()) / 86400000);
  }

  private toIso(date: Date): string {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
