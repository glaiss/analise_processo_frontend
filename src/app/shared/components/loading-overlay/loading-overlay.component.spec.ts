import { TestBed } from '@angular/core/testing';
import { LoadingOverlayComponent } from './loading-overlay.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoadingOverlayComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingOverlayComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoadingOverlayComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should show overlay when isLoading is true', () => {
    const fixture = TestBed.createComponent(LoadingOverlayComponent);
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(overlay).toBeTruthy();
  });

  it('should hide overlay when isLoading is false', () => {
    const fixture = TestBed.createComponent(LoadingOverlayComponent);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.loading-overlay');
    expect(overlay).toBeFalsy();
  });

  it('should display default message', () => {
    const fixture = TestBed.createComponent(LoadingOverlayComponent);
    expect(fixture.componentInstance.message).toBe('Carregando...');
  });

  it('should display custom message', () => {
    const fixture = TestBed.createComponent(LoadingOverlayComponent);
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('message', 'Aguarde...');
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('p');
    expect(text?.textContent).toContain('Aguarde...');
  });

  it('should have fullPage class when fullPage is true', () => {
    const fixture = TestBed.createComponent(LoadingOverlayComponent);
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('fullPage', true);
    fixture.detectChanges();

    const overlay = fixture.nativeElement.querySelector('.full-page');
    expect(overlay).toBeTruthy();
  });
});
