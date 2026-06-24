import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-loader.component.html',
  styleUrl: './content-loader.component.scss'
})
export class ContentLoaderComponent {
  @Input() type: 'table' | 'card' | 'text' | 'chart' = 'text';
  @Input() rows = 5;
  @Input() columns = 6;

  get rowsArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }

  get columnsArray(): number[] {
    return Array.from({ length: this.columns }, (_, i) => i);
  }
}
