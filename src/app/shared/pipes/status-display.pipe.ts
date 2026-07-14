import { Pipe, PipeTransform } from '@angular/core';
import { STATUS_DISPLAY, StatusAtribuicao } from '../../core/models/processo/enums.model';

@Pipe({
  name: 'statusDisplay',
  standalone: true,
})
export class StatusDisplayPipe implements PipeTransform {
  transform(value: StatusAtribuicao | string | null | undefined): string {
    if (!value) return '';
    return STATUS_DISPLAY[value as StatusAtribuicao] || value;
  }
}
