import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EtiquetaService } from '../../../core/services/etiqueta.service';
import { EtiquetaDTO, EtiquetaRequestDTO } from '../../../core/models/processo/etiqueta.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-etiqueta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data?.etiqueta ? 'Editar Etiqueta' : 'Nova Etiqueta' }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nome</mat-label>
        <input matInput [(ngModel)]="nome" maxlength="50" placeholder="Ex: Alta Prioridade">
        <mat-hint>{{ nome.length }}/50</mat-hint>
      </mat-form-field>

      <div class="color-section">
        <label class="color-label">Cor</label>
        <div class="color-presets">
          @for (cor of coresPredefinidas; track cor) {
            <button
              type="button"
              class="color-dot"
              [style.background-color]="cor"
              [class.selected]="corSelecionada === cor"
              (click)="corSelecionada = cor"
            >
              @if (corSelecionada === cor) {
                <mat-icon class="check-icon">check</mat-icon>
              }
            </button>
          }
        </div>
        <div class="custom-color-row">
          <input
            type="color"
            [(ngModel)]="corSelecionada"
            class="color-picker"
          />
          <span class="color-value">{{ corSelecionada }}</span>
          <span class="apelido-preview" [style.background-color]="corSelecionada" [style.color]="getTextColor()">
            {{ gerarApelido() }}
          </span>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" mat-button mat-dialog-close>Cancelar</button>
      <button
        type="button"
        mat-flat-button
        color="primary"
        [disabled]="!nome.trim() || !corSelecionada || salvando()"
        (click)="salvar()"
      >
        {{ salvando() ? 'Salvando...' : (data?.etiqueta ? 'Salvar' : 'Criar') }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }

    .color-section {
      margin-top: 16px;
    }

    .color-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
      display: block;
    }

    .color-presets {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .color-dot {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      padding: 0;
    }

    .color-dot:hover {
      transform: scale(1.1);
    }

    .color-dot.selected {
      border-color: var(--border-strong);
      box-shadow: 0 0 0 2px var(--border-color);
    }

    .check-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: white;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));
    }

    .custom-color-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .color-picker {
      width: 40px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--border-strong);
      border-radius: 4px;
      cursor: pointer;
      background: none;
    }

    .color-value {
      font-family: monospace;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .apelido-preview {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
  `]
})
export class EtiquetaDialogComponent implements OnInit {
  nome = '';
  corSelecionada = '#3F51B5';
  salvando = signal(false);

  readonly coresPredefinidas = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFC107', '#FF9800', '#FF5722', '#795548',
  ];

  constructor(
    private readonly dialogRef: MatDialogRef<EtiquetaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { etiqueta?: EtiquetaDTO } | null,
    private readonly etiquetaService: EtiquetaService,
    private readonly notification: NotificationService,
  ) {}

  ngOnInit() {
    if (this.data?.etiqueta) {
      this.nome = this.data.etiqueta.nome;
      this.corSelecionada = this.data.etiqueta.cor;
    }
  }

  gerarApelido(): string {
    const nome = this.nome.trim();
    if (!nome) return '';

    const palavras = nome.split(/\s+/);
    if (palavras.length === 1) {
      return palavras[0].length <= 4 ? palavras[0] : palavras[0].substring(0, 4);
    }

    return palavras.map(p => p.charAt(0).toUpperCase()).join('');
  }

  getTextColor(): string {
    const hex = this.corSelecionada.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  salvar() {
    if (!this.nome.trim() || !this.corSelecionada) return;

    this.salvando.set(true);
    const request: EtiquetaRequestDTO = {
      nome: this.nome.trim(),
      cor: this.corSelecionada,
    };

    const obs = this.data?.etiqueta
      ? this.etiquetaService.atualizar(this.data.etiqueta.id, request)
      : this.etiquetaService.criar(request);

    obs.subscribe({
      next: (etiqueta) => {
        this.salvando.set(false);
        this.notification.success(this.data?.etiqueta ? 'Etiqueta atualizada!' : 'Etiqueta criada!', 3000);
        this.dialogRef.close(etiqueta);
      },
      error: (err) => {
        this.salvando.set(false);
        this.notification.error(err.error?.message || 'Erro ao salvar etiqueta', 3000);
      }
    });
  }
}
