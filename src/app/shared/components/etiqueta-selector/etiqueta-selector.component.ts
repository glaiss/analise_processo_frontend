import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EtiquetaService } from '../../../core/services/etiqueta.service';
import { EtiquetaDTO } from '../../../core/models/processo/etiqueta.model';
import { EtiquetaBadgeComponent } from '../etiqueta-badge/etiqueta-badge.component';
import { EtiquetaDialogComponent } from '../etiqueta-dialog/etiqueta-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-etiqueta-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    EtiquetaBadgeComponent,
  ],
  templateUrl: './etiqueta-selector.component.html',
  styleUrl: './etiqueta-selector.component.scss',
})
export class EtiquetaSelectorComponent implements OnInit {
  @Input({ required: true }) processoNumero!: string;
  @Output() etiquetasChanged = new EventEmitter<void>();

  private readonly etiquetaService = inject(EtiquetaService);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);

  readonly etiquetasVinculadas = signal<EtiquetaDTO[]>([]);
  readonly todasEtiquetas = signal<EtiquetaDTO[]>([]);
  readonly mostrarSelector = signal(false);

  readonly etiquetasDisponiveis = signal<EtiquetaDTO[]>([]);

  ngOnInit() {
    this.carregarEtiquetas();
  }

  carregarEtiquetas() {
    this.etiquetaService.listar().subscribe({
      next: (etiquetas) => this.todasEtiquetas.set(etiquetas),
      error: () => {}
    });
    this.etiquetaService.listarPorProcesso(this.processoNumero).subscribe({
      next: (vinculadas) => {
        this.etiquetasVinculadas.set(vinculadas);
        this.atualizarDisponiveis();
      },
      error: () => {}
    });
  }

  private atualizarDisponiveis() {
    const vinculadaIds = new Set(this.etiquetasVinculadas().map(e => e.id));
    this.etiquetasDisponiveis.set(
      this.todasEtiquetas().filter(e => !vinculadaIds.has(e.id))
    );
  }

  abrirSelector() {
    this.atualizarDisponiveis();
    this.mostrarSelector.set(!this.mostrarSelector());
  }

  fecharSelector() {
    this.mostrarSelector.set(false);
  }

  abrirGerenciador() {
    const dialogRef = this.dialog.open(EtiquetaDialogComponent, {
      width: '480px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe({
      next: () => {
        this.carregarEtiquetas();
      }
    });
  }

  vincular(etiqueta: EtiquetaDTO) {
    this.etiquetaService.vincularProcesso(this.processoNumero, [etiqueta.id]).subscribe({
      next: () => {
        this.etiquetasVinculadas.update(list => [...list, etiqueta]);
        this.atualizarDisponiveis();
        this.mostrarSelector.set(false);
        this.etiquetasChanged.emit();
      },
      error: () => this.notification.error('Erro ao vincular etiqueta', 3000)
    });
  }

  desvincular(etiqueta: EtiquetaDTO) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desvincular etiqueta',
        message: `Deseja desvincular a etiqueta "${etiqueta.nome}" deste processo?`
      }
    });

    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.etiquetaService.desvincularProcesso(this.processoNumero, etiqueta.id).subscribe({
            next: () => {
              this.etiquetasVinculadas.update(list => list.filter(e => e.id !== etiqueta.id));
              this.atualizarDisponiveis();
              this.etiquetasChanged.emit();
            },
            error: () => this.notification.error('Erro ao desvincular etiqueta', 3000)
          });
        }
      }
    });
  }
}
