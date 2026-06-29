import { TestBed } from '@angular/core/testing';
import { ContentLoaderComponent } from './content-loader.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentLoaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentLoaderComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ContentLoaderComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should default to text type', () => {
    const fixture = TestBed.createComponent(ContentLoaderComponent);
    expect(fixture.componentInstance.type).toBe('text');
  });

  it('should default to 5 rows', () => {
    const fixture = TestBed.createComponent(ContentLoaderComponent);
    expect(fixture.componentInstance.rows).toBe(5);
  });

  it('should default to 6 columns', () => {
    const fixture = TestBed.createComponent(ContentLoaderComponent);
    expect(fixture.componentInstance.columns).toBe(6);
  });

  it('should generate correct rows array', () => {
    const fixture = TestBed.createComponent(ContentLoaderComponent);
    fixture.componentRef.setInput('rows', 3);
    expect(fixture.componentInstance.rowsArray).toEqual([0, 1, 2]);
  });

  it('should generate correct columns array', () => {
    const fixture = TestBed.createComponent(ContentLoaderComponent);
    fixture.componentRef.setInput('columns', 4);
    expect(fixture.componentInstance.columnsArray).toEqual([0, 1, 2, 3]);
  });

  it('should render rows for table type', () => {
    const fixture = TestBed.createComponent(ContentLoaderComponent);
    fixture.componentRef.setInput('type', 'table');
    fixture.componentRef.setInput('rows', 2);
    fixture.componentRef.setInput('columns', 3);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.skeleton-row');
    expect(rows.length).toBe(2);
  });

  it('should render rows for card type', () => {
    const fixture = TestBed.createComponent(ContentLoaderComponent);
    fixture.componentRef.setInput('type', 'card');
    fixture.componentRef.setInput('rows', 3);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.skeleton-card');
    expect(cards.length).toBe(3);
  });

  it('should render chart type', () => {
    const fixture = TestBed.createComponent(ContentLoaderComponent);
    fixture.componentRef.setInput('type', 'chart');
    fixture.detectChanges();

    const chart = fixture.nativeElement.querySelector('.skeleton-chart');
    expect(chart).toBeTruthy();
  });
});
