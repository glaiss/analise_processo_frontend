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
  templateUrl: './etiqueta-dialog.component.html',
  styleUrl: './etiqueta-dialog.component.scss',
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
