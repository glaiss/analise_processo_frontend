import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AssignedProcessesListComponent } from '../../shared/components/assigned-processes-list/assigned-processes-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatIconModule,
    AssignedProcessesListComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  viewMode = signal<'meus' | 'equipe'>('meus');

  onViewModeChange(event: any) {
    this.viewMode.set(event.value);
  }
}
