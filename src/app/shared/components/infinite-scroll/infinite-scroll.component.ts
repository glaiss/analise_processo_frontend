import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-infinite-scroll',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-content></ng-content>
    <div #anchor style="height: 20px;"></div>
  `
})
export class InfiniteScrollComponent implements AfterViewInit, OnDestroy {
  readonly scrolled = output<void>();
  @Input() isLoading = false;
  @Input() scrollRoot?: HTMLElement | ElementRef | null;
  @ViewChild('anchor') anchor!: ElementRef;
  
  private observer!: IntersectionObserver;

  ngAfterViewInit() {
    const root = this.resolveRoot();
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.isLoading) {
        this.scrolled.emit();
      }
    }, root ? { root, rootMargin: '80px' } : { rootMargin: '200px' });
    
    this.observer.observe(this.anchor.nativeElement);
  }

  private resolveRoot(): Element | null {
    if (!this.scrollRoot) return null;
    if (this.scrollRoot instanceof ElementRef) return this.scrollRoot.nativeElement;
    return this.scrollRoot;
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
