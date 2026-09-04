import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProcessoResumoDTO } from '../../../core/models/processo/processo-resumo.model';
import { EtiquetaBadgeComponent } from '../etiqueta-badge/etiqueta-badge.component';

@Component({
  selector: 'app-process-card-compact',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    EtiquetaBadgeComponent,
  ],
  templateUrl: './process-card-compact.component.html',
  styleUrl: './process-card-compact.component.scss',
})
export class ProcessCardCompactComponent {
  @Input({ required: true }) processo!: ProcessoResumoDTO;
  @Output() monitorToggle = new EventEmitter<string>();
  @Output() cardClick = new EventEmitter<string>();

  onToggleMonitoramento(event: MouseEvent) {
    event.stopPropagation();
    this.monitorToggle.emit(this.processo.numero);
  }

  onCardClick() {
    this.cardClick.emit(this.processo.numero);
  }

  get scoreColor(): string {
    const score = this.processo.scoreFinal;
    if (score >= 80) return 'low';
    if (score >= 50) return 'medium';
    return 'high';
  }
}
