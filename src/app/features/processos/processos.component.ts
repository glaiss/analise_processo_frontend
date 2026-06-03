import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ProcessStateService } from '../../core/services/process-state.service';
import { InfiniteScrollComponent } from '../../shared/components/infinite-scroll/infinite-scroll.component';

@Component({
  selector: 'app-processos',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatTableModule, MatButtonToggleModule, InfiniteScrollComponent],
  templateUrl: './processos.component.html',
  styleUrl: './processos.component.scss'
})
export class ProcessosComponent implements OnInit {
  processState = inject(ProcessStateService);

  ngOnInit() {
    this.processState.loadProcesses();
  }

  onFilterChange(values: string[]) {
    this.processState.setFilterNivel(values);
  }
  
  onScroll() {
    this.processState.loadNextPage();
  }
}
