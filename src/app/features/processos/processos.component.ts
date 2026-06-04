import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProcessStateService } from '../../core/services/process-state.service';
import { InfiniteScrollComponent } from '../../shared/components/infinite-scroll/infinite-scroll.component';
import { StatusAtribuicao } from '../../core/models/processo/enums.model';

@Component({
  selector: 'app-processos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    InfiniteScrollComponent
  ],
  templateUrl: './processos.component.html',
  styleUrl: './processos.component.scss'
})
export class ProcessosComponent implements OnInit {
  processState = inject(ProcessStateService);
  
  searchQuery = signal<string>('');
  statusOptions = Object.values(StatusAtribuicao);

  ngOnInit() {
    this.processState.loadProcesses();
  }

  onSearch() {
    this.processState.setSearchQuery(this.searchQuery());
  }

  onNivelChange(values: string[]) {
    this.processState.setFilterNivel(values);
  }

  onStatusChange(values: StatusAtribuicao[]) {
    this.processState.setFilterStatus(values);
  }

  toggleMonitoramento(numero: string) {
    this.processState.alternarMonitoramento(numero).subscribe();
  }
  
  onScroll() {
    this.processState.loadNextPage();
  }

  getScoreColor(score: number): string {
    if (score > 100) return 'high';
    if (score > 50) return 'medium';
    return 'low';
  }
}
