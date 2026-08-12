import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Contrato } from '../../../core/models/financeiro/parcela.model';

export interface DadosCliente {
  nome: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
}

export interface ContratoConcluidoData {
  contrato: Contrato;
  cliente?: DadosCliente;
}

@Component({
  selector: 'app-contrato-concluido-dialog',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">check_circle</mat-icon>
      <span class="dialog-title-text">Contrato fechado com sucesso!</span>
    </h2>

    <mat-dialog-content>
      <p class="cliente-section">Dados do Cliente</p>
      <mat-card class="info-card">
        <mat-card-content>
          <div class="info-row">
            <span class="info-label">Nome</span>
            <span class="info-value">{{ data.cliente?.nome || data.contrato.clienteNome || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">CPF/CNPJ</span>
            <span class="info-value">{{ data.cliente?.cpfCnpj || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">E-mail</span>
            <span class="info-value">{{ data.cliente?.email || '—' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Telefone</span>
            <span class="info-value">{{ data.cliente?.telefone || '—' }}</span>
          </div>
        </mat-card-content>
      </mat-card>

      <p class="cliente">Contrato Definido</p>
      <mat-card class="info-card">
        <mat-card-content>
          <div class="info-row">
            <span class="info-label">Número</span>
            <span class="info-value">{{ data.contrato.numeroContrato }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Modalidade</span>
            <span class="info-value">{{ data.contrato.modalidade }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Valor total</span>
            <span class="info-value">{{ formatCurrency(data.contrato.valorTotal) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Valor líquido</span>
            <span class="info-value">{{ formatCurrency(data.contrato.valorTotal - (data.contrato.valorDesconto || 0)) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Parcelas</span>
            <span class="info-value">{{ data.contrato.parcelas.length }}x</span>
          </div>
          @if (data.contrato.documentoNomeArquivo) {
            <div class="info-row">
              <span class="info-label">Documento</span>
              <span class="info-value">{{ data.contrato.documentoNomeArquivo }}</span>
            </div>
          }
        </mat-card-content>
      </mat-card>

      <div class="parcelas-resumo">
        <span class="info-label">Vencimentos</span>
        @for (parcela of data.contrato.parcelas; track parcela.id) {
          <div class="parcela-resumo-item">
            <span>{{ parcela.numero }}) {{ formatCurrency(parcela.valorPrevisto) }}</span>
            <span>{{ formatDate(parcela.dataVencimento) }}</span>
          </div>
        }
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="verContrato()">
        <mat-icon>account_balance_wallet</mat-icon>
        Ver contrato
      </button>
      <button mat-raised-button color="primary" (click)="fechar()">
        <mat-icon>done</mat-icon>
        Concluir
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .dialog-title { display: flex; align-items: center; gap: 8px; }
    .cliente { font-weight: 600; font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 4px; }
    .info-card { margin-bottom: 8px; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .info-label { color: var(--text-secondary); }
    .info-value { font-weight: 500; }
    .parcelas-resumo { margin-top: 8px; display: flex; flex-direction: column; gap: 4px; }
    .parcela-resumo-item { display: flex; justify-content: space-between; }
  `
})
export class ContratoConcluidoDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ContratoConcluidoDialogComponent>);
  readonly data: ContratoConcluidoData = inject(MAT_DIALOG_DATA);
  readonly router: Router = inject(Router);

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const [y, m, d] = value.substring(0, 10).split('-');
    return `${d}/${m}/${y}`;
  }

  verContrato() {
    this.dialogRef.close('verContrato');
  }

  fechar() {
    this.dialogRef.close();
  }
}