import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProcessoContatoDTO } from '../../../core/models/processo/processo-contato.model';

export interface ContactProcessDialogData {
  numero: string;
  contatos: ProcessoContatoDTO[];
}

@Component({
  selector: 'app-contact-process-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <h2 mat-dialog-title>Registrar Contato</h2>
    <mat-dialog-content>
      <p class="dialog-subtitle">Registre um meio de contato para avançar para <strong>Em Negociação</strong></p>

      @if (data.contatos.length > 0) {
        <div class="existing-contacts">
          <span class="section-label">Contatos existentes:</span>
          @for (c of data.contatos; track c.id) {
            <div class="contact-item">
              <mat-icon>{{ c.tipo === 'WHATSAPP' ? 'chat' : 'email' }}</mat-icon>
              <span class="contact-name">{{ c.nome }}</span>
              <span class="contact-value">{{ c.valor }}</span>
              <button mat-icon-button (click)="selecionar(c)" matTooltip="Usar este contato">
                <mat-icon>check_circle</mat-icon>
              </button>
            </div>
          }
          <mat-divider class="my-12"></mat-divider>
        </div>
      }

      <div class="new-contact-form">
        <span class="section-label">Novo contato:</span>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome</mat-label>
          <input matInput [(ngModel)]="nome" placeholder="Nome da parte">
        </mat-form-field>

        <div class="contact-row">
          <mat-form-field appearance="outline" class="type-field">
            <mat-label>Tipo</mat-label>
            <mat-select [(ngModel)]="tipo">
              <mat-option value="WHATSAPP">WhatsApp</mat-option>
              <mat-option value="EMAIL">E-mail</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="value-field">
            <mat-label>Valor</mat-label>
            <input matInput [(ngModel)]="valor" [placeholder]="tipo === 'WHATSAPP' ? '(11) 99999-9999' : 'email@exemplo.com'">
          </mat-form-field>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="!podeSalvar()">
        <mat-icon>save</mat-icon>
        Salvar e Avançar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-subtitle { margin: 0 0 16px; color: var(--text-secondary); font-size: 14px; }
    .section-label { display: block; font-weight: 600; font-size: 13px; color: var(--text-tertiary); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    .existing-contacts { margin-bottom: 8px; }
    .contact-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; }
    .contact-item mat-icon { color: var(--primary-blue); }
    .contact-name { font-weight: 500; min-width: 100px; }
    .contact-value { color: var(--text-secondary); flex: 1; }
    .new-contact-form { display: flex; flex-direction: column; gap: 12px; }
    .full-width { width: 100%; }
    .contact-row { display: flex; gap: 12px; }
    .type-field { flex: 0 0 140px; }
    .value-field { flex: 1; }
    .my-12 { margin: 12px 0; }
  `]
})
export class ContactProcessDialogComponent {
  tipo: string = 'WHATSAPP';
  valor: string = '';
  nome: string = '';

  constructor(
    public dialogRef: MatDialogRef<ContactProcessDialogComponent, { tipo: string; valor: string; nome: string } | null>,
    @Inject(MAT_DIALOG_DATA) public data: ContactProcessDialogData,
  ) {}

  selecionar(c: ProcessoContatoDTO) {
    this.dialogRef.close({ tipo: c.tipo, valor: c.valor, nome: c.nome });
  }

  podeSalvar(): boolean {
    return this.valor.trim().length > 0 && this.tipo.length > 0;
  }

  onConfirm() {
    if (!this.podeSalvar()) return;
    this.dialogRef.close({ tipo: this.tipo, valor: this.valor.trim(), nome: this.nome.trim() });
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
