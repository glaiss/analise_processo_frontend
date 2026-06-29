import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EmptyStateComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should display message', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'Nenhum item encontrado');
    fixture.detectChanges();

    const text = fixture.nativeElement.querySelector('p');
    expect(text?.textContent).toContain('Nenhum item encontrado');
  });

  it('should display default icon', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    expect(fixture.componentInstance.icon).toBe('info');
  });

  it('should display custom icon', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'Vazio');
    fixture.componentRef.setInput('icon', 'search_off');
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('mat-icon');
    expect(icon?.textContent).toContain('search_off');
  });

  it('should show action button when actionLabel is provided', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'Vazio');
    fixture.componentRef.setInput('actionLabel', 'Criar novo');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button?.textContent).toContain('Criar novo');
  });

  it('should emit action on button click', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('message', 'Vazio');
    fixture.componentRef.setInput('actionLabel', 'Criar');
    fixture.detectChanges();

    vi.spyOn(fixture.componentInstance.action, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(fixture.componentInstance.action.emit).toHaveBeenCalled();
  });
});
