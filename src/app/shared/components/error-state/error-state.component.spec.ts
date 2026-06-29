import { TestBed } from '@angular/core/testing';
import { ErrorStateComponent } from './error-state.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ErrorStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorStateComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ErrorStateComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    const fixture = TestBed.createComponent(ErrorStateComponent);
    fixture.componentRef.setInput('message', 'Erro ao carregar');
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('p');
    expect(text?.textContent).toContain('Erro ao carregar');
  });

  it('should display default retry label', () => {
    const fixture = TestBed.createComponent(ErrorStateComponent);
    expect(fixture.componentInstance.retryLabel).toBe('Tentar novamente');
  });

  it('should display custom retry label', () => {
    const fixture = TestBed.createComponent(ErrorStateComponent);
    fixture.componentRef.setInput('message', 'Erro');
    fixture.componentRef.setInput('retryLabel', 'Tentar de novo');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button?.textContent).toContain('Tentar de novo');
  });

  it('should emit retry on button click', () => {
    const fixture = TestBed.createComponent(ErrorStateComponent);
    fixture.componentRef.setInput('message', 'Erro');
    fixture.detectChanges();

    vi.spyOn(fixture.componentInstance.retry, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(fixture.componentInstance.retry.emit).toHaveBeenCalled();
  });
});
