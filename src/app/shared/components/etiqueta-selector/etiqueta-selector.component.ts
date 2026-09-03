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
  template: `
    <div class="etiqueta-section">
      <div class="etiqueta-header">
        <span class="section-title">Etiquetas</span>
        <div class="header-actions">
          <button type="button" mat-icon-button matTooltip="Gerenciar etiquetas" (click)="abrirGerenciador()">
            <mat-icon>settings</mat-icon>
          </button>
          <button type="button" mat-icon-button matTooltip="Vincular etiqueta" (click)="abrirSelector()">
            <mat-icon>sell</mat-icon>
          </button>
        </div>
      </div>

      <div class="etiquetas-list">
        @if (etiquetasVinculadas().length > 0) {
          @for (etiqueta of etiquetasVinculadas(); track etiqueta.id) {
            <div class="etiqueta-item">
              <app-etiqueta-badge
                [nome]="etiqueta.nome"
                [cor]="etiqueta.cor"
                [apelido]="etiqueta.apelido"
                [compact]="false"
              />
              <button
                type="button"
                mat-icon-button
                class="remove-btn"
                matTooltip="Desvincular"
                (click)="desvincular(etiqueta)"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        } @else {
          <span class="no-tags">Nenhuma etiqueta vinculada</span>
        }
      </div>

      @if (mostrarSelector()) {
        <div class="selector-panel">
          <div class="selector-header">
            <span>Vincular etiqueta</span>
            <button type="button" mat-icon-button (click)="fecharSelector()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="selector-options">
            @for (etiqueta of etiquetasDisponiveis(); track etiqueta.id) {
              <button
                type="button"
                class="selector-option"
                (click)="vincular(etiqueta)"
              >
                <app-etiqueta-badge
                  [nome]="etiqueta.nome"
                  [cor]="etiqueta.cor"
                  [apelido]="etiqueta.apelido"
                  [compact]="true"
                />
                <span class="option-name">{{ etiqueta.nome }}</span>
              </button>
            } @empty {
              <span class="no-tags">Nenhuma etiqueta disponivel</span>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .etiqueta-section {
      position: relative;
    }

    .etiqueta-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
    }

    .header-actions {
      display: flex;
      gap: 2px;
    }

    .etiquetas-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    .etiqueta-item {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .remove-btn {
      width: 20px;
      height: 20px;
      line-height: 20px;
    }

    .remove-btn mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .no-tags {
      font-size: 13px;
      color: var(--text-tertiary);
      font-style: italic;
    }

    .selector-panel {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border-strong);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10;
      margin-top: 4px;
    }

    .selector-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid var(--border-strong);
      font-size: 13px;
      font-weight: 500;
    }

    .selector-options {
      max-height: 200px;
      overflow-y: auto;
      padding: 4px;
    }

    .selector-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 6px 8px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      text-align: left;
      font-size: 13px;
    }

    .selector-option:hover {
      background: var(--bg-hover);
    }

    .option-name {
      color: var(--text-primary);
    }
  `]
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
