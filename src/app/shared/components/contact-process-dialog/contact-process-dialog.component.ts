import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface ContactProcessDialogData {
  numero: string;
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
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Registrar Contato</h2>
    <mat-dialog-content>
      <p class="dialog-subtitle">Registre um meio de contato para avançar para <strong>Em Negociação</strong></p>

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

        <mat-checkbox [(ngModel)]="principal">Contato principal</mat-checkbox>
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
  styles: `
    mat-dialog-content { overflow: hidden; max-height: none; padding: 0 24px; }
    .dialog-subtitle { margin: 0 0 12px; color: var(--text-secondary); font-size: 14px; }
    .section-label { display: block; font-weight: 600; font-size: 13px; color: var(--text-tertiary); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .new-contact-form { display: flex; flex-direction: column; gap: 8px; }
    .full-width { width: 100%; }
    .contact-row { display: flex; gap: 12px; }
    .type-field { flex: 0 0 140px; }
    .value-field { flex: 1; }
  `
})
export class ContactProcessDialogComponent {
  tipo: string = 'WHATSAPP';
  valor: string = '';
  nome: string = '';
  principal: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ContactProcessDialogComponent, { tipo: string; valor: string; nome: string; principal: boolean } | null>,
    @Inject(MAT_DIALOG_DATA) public data: ContactProcessDialogData,
  ) {}

  podeSalvar(): boolean {
    return this.valor.trim().length > 0 && this.tipo.length > 0;
  }

  onConfirm() {
    if (!this.podeSalvar()) return;
    this.dialogRef.close({ tipo: this.tipo, valor: this.valor.trim(), nome: this.nome.trim(), principal: this.principal });
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
