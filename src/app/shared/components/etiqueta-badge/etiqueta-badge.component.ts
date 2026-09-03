import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-etiqueta-badge',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  template: `
    <span
      class="etiqueta-badge"
      [class.compact]="compact()"
      [style.background-color]="cor()"
      [style.color]="textColor()"
      [matTooltip]="compact() ? nome() : ''"
      [matTooltipDisabled]="!compact()"
    >
      {{ compact() ? apelido() : nome() }}
    </span>
  `,
  styles: [`
    .etiqueta-badge {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      line-height: 1.4;
      white-space: nowrap;
      letter-spacing: 0.02em;
    }

    .etiqueta-badge.compact {
      padding: 1px 6px;
      font-size: 10px;
      min-width: 20px;
      justify-content: center;
    }
  `]
})
export class EtiquetaBadgeComponent {
  readonly nome = input.required<string>();
  readonly cor = input.required<string>();
  readonly apelido = input<string>('');
  readonly compact = input<boolean>(false);

  textColor(): string {
    const hex = this.cor().replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}
