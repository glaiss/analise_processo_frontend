import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ScoreItemDTO } from '../../../core/models/processo.model';

@Component({
  selector: 'app-score-breakdown',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule],
  templateUrl: './score-breakdown.component.html',
  styleUrl: './score-breakdown.component.scss'
})
export class ScoreBreakdownComponent {
  hipoteses = input.required<ScoreItemDTO[]>();
  displayedColumns: string[] = ['nomeRegra', 'pontos', 'justificativa'];
}
