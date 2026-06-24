import { Component, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss'
})
export class ErrorStateComponent {
  @Input({ required: true }) message!: string;
  @Input() retryLabel = 'Tentar novamente';

  retry = output<void>();
}
