import { Component, ElementRef, EventEmitter, Output, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
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
  @Output() scrolled = new EventEmitter<void>();
  @Input() isLoading = false;
  @ViewChild('anchor') anchor!: ElementRef;
  
  private observer!: IntersectionObserver;

  ngAfterViewInit() {
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !this.isLoading) {
        this.scrolled.emit();
      }
    }, { rootMargin: '200px' });
    
    this.observer.observe(this.anchor.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }
}
