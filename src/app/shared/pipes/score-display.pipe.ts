import { Pipe, PipeTransform } from '@angular/core';
import { SCORE_DISPLAY } from '../../core/models/processo/enums.model';

@Pipe({
  name: 'appScoreDisplay',
  standalone: true,
})
export class ScoreDisplayPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return SCORE_DISPLAY[value] || value;
  }
}
