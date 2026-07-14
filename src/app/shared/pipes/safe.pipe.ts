import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'appSafe',
  standalone: true
})
export class SafePipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(url: string | null): SafeResourceUrl {
    if (!url) return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
