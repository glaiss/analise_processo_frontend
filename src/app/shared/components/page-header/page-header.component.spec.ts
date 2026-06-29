import { TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

describe('PageHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent, NoopAnimationsModule],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('title', 'Meu Título');
    fixture.detectChanges();

    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Meu Título');
  });

  it('should display subtitle when provided', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('title', 'Título');
    fixture.componentRef.setInput('subtitle', 'Subtítulo');
    fixture.detectChanges();

    const subtitle = fixture.nativeElement.querySelector('.subtitle');
    expect(subtitle).toBeTruthy();
    expect(subtitle!.textContent).toContain('Subtítulo');
  });

  it('should show back button when backButton is true', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('title', 'Título');
    fixture.componentRef.setInput('backButton', true);
    fixture.componentRef.setInput('backRouterLink', '/home');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
  });
});
