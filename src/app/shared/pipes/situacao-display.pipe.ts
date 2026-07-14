import { Pipe, PipeTransform } from '@angular/core';
import { SITUACAO_DISPLAY, ProcessoSituacao } from '../../core/models/processo/enums.model';

@Pipe({
  name: 'situacaoDisplay',
  standalone: true,
})
export class SituacaoDisplayPipe implements PipeTransform {
  transform(value: ProcessoSituacao | string | null | undefined): string {
    if (!value) return '';
    return SITUACAO_DISPLAY[value as ProcessoSituacao] || value;
  }
}
