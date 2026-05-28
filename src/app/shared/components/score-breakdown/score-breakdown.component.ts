import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ProcessoDetalheDTO } from '../../../core/models/processo/processo-detalhe.model';

@Component({
  selector: 'app-score-breakdown',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  templateUrl: './score-breakdown.component.html',
  styleUrl: './score-breakdown.component.scss'
})
export class ScoreBreakdownComponent {
  @Input({ required: true }) processo!: ProcessoDetalheDTO;
}
