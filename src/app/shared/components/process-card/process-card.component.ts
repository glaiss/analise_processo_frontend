import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ProcessoResumoDTO } from '../../../core/models/processo/processo-resumo.model';
import { StatusDisplayPipe } from '../../pipes/status-display.pipe';

@Component({
  selector: 'app-process-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, StatusDisplayPipe],
  templateUrl: './process-card.component.html',
  styleUrl: './process-card.component.scss'
})
export class ProcessCardComponent {
  readonly processo = input.required<ProcessoResumoDTO>();

  get scoreColor(): string {
    const score = this.processo().scoreFinal;
    if (score > 100) return 'accent';
    if (score > 50) return 'primary';
    return '';
  }

  get deadlineColor(): string {
    const days = this.processo().diasParaVencer;
    if (days !== undefined && days <= 3) return 'warn';
    return '';
  }
}
