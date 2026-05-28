import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { ProcessStateService } from '../../../core/services/process-state.service';

@Component({
  selector: 'app-process-sidebar-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatDividerModule],
  templateUrl: './process-sidebar-list.component.html',
  styleUrl: './process-sidebar-list.component.scss'
})
export class ProcessSidebarListComponent {
  processState = inject(ProcessStateService);
  private router = inject(Router);

  navigate(numero: string) {
    this.router.navigate(['/processos', numero]);
  }
}
