import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AtribuicaoProcessoResumoDTO, StatusAtribuicao, ProcessoSituacao } from '../../../core/models/processo/index';
import { MatDividerModule } from "@angular/material/divider";
import { Router } from '@angular/router';

@Component({
  selector: 'app-assigned-process-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './assigned-process-card.component.html',
  styleUrl: './assigned-process-card.component.scss'
})
export class AssignedProcessCardComponent {
  @Input({ required: true }) atribuicao!: AtribuicaoProcessoResumoDTO;
  @Output() viewDetails = new EventEmitter<string>();

  private router = inject(Router);

  get statusColor(): string {
    switch (this.atribuicao.status) {
      case StatusAtribuicao.DISPONIVEL: return 'basic';
      case StatusAtribuicao.ATRIBUIDO: return 'accent';
      case StatusAtribuicao.EM_CONVERSA: return 'accent';
      case StatusAtribuicao.NEGOCIACAO: return 'accent';
      case StatusAtribuicao.CONCLUIDO_SUCESSO: return 'success'; // Define 'success' color in styles.scss
      case StatusAtribuicao.CONCLUIDO_RECUSADO: return 'warn';
      default: return 'basic';
    }
  }

  get statusPrazoColor(): string {
    if (this.atribuicao.statusPrazo === 'URGENTE') return 'warn';
    return 'primary';
  }

  get scoreColor(): string {
    if (this.atribuicao.processoScoreFinal > 100) return 'accent';
    if (this.atribuicao.processoScoreFinal > 50) return 'primary';
    return '';
  }

  get situationColorClass(): string {
    switch (this.atribuicao.processoSituacao) {
      case ProcessoSituacao.ATIVO: return 'situation-ativo';
      case ProcessoSituacao.ARQUIVADO: return 'situation-arquivado';
      case ProcessoSituacao.BAIXADO: return 'situation-baixado';
      default: return '';
    }
  }

  openDetails() {
    this.router.navigate(['/processos', this.atribuicao.processoNumero]);
  }
}
