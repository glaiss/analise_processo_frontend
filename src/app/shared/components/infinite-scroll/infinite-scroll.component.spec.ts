import { TestBed } from '@angular/core/testing';
import { InfiniteScrollComponent } from './infinite-scroll.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('InfiniteScrollComponent', () => {
  let mockObserver: { observe: any; disconnect: any; callback?: any };

  beforeEach(async () => {
    mockObserver = { observe: vi.fn(), disconnect: vi.fn() };
    class MockIntersectionObserver {
      constructor(callback: any) { mockObserver.callback = callback; }
      observe(...args: any[]) { return mockObserver.observe(...args); }
      disconnect(...args: any[]) { return mockObserver.disconnect(...args); }
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    await TestBed.configureTestingModule({
      imports: [InfiniteScrollComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(InfiniteScrollComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should observe anchor after view init', () => {
    const fixture = TestBed.createComponent(InfiniteScrollComponent);
    fixture.detectChanges();

    expect(mockObserver.observe).toHaveBeenCalled();
  });

  it('should disconnect on destroy', () => {
    const fixture = TestBed.createComponent(InfiniteScrollComponent);
    fixture.detectChanges();
    fixture.destroy();

    expect(mockObserver.disconnect).toHaveBeenCalled();
  });

  it('should emit scrolled when intersecting and not loading', () => {
    const entries = [{ isIntersecting: true }] as IntersectionObserverEntry[];

    const fixture = TestBed.createComponent(InfiniteScrollComponent);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
    vi.spyOn(fixture.componentInstance.scrolled, 'emit');

    mockObserver.callback!(entries, null as any);

    expect(fixture.componentInstance.scrolled.emit).toHaveBeenCalled();
  });

  it('should not emit scrolled when loading', () => {
    const entries = [{ isIntersecting: true }] as IntersectionObserverEntry[];

    const fixture = TestBed.createComponent(InfiniteScrollComponent);
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    vi.spyOn(fixture.componentInstance.scrolled, 'emit');

    mockObserver.callback!(entries, null as any);

    expect(fixture.componentInstance.scrolled.emit).not.toHaveBeenCalled();
  });

  it('should not emit scrolled when not intersecting', () => {
    const entries = [{ isIntersecting: false }] as IntersectionObserverEntry[];

    const fixture = TestBed.createComponent(InfiniteScrollComponent);
    fixture.detectChanges();
    vi.spyOn(fixture.componentInstance.scrolled, 'emit');

    mockObserver.callback!(entries, null as any);

    expect(fixture.componentInstance.scrolled.emit).not.toHaveBeenCalled();
  });
});
