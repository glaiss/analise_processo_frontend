import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EtiquetaBadgeComponent } from './etiqueta-badge.component';

describe('EtiquetaBadgeComponent', () => {
  let component: EtiquetaBadgeComponent;
  let fixture: ComponentFixture<EtiquetaBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtiquetaBadgeComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(EtiquetaBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('textColor', () => {
    it('should return black text for light background colors', () => {
      fixture.componentRef.setInput('cor', '#FFFFFF');
      expect(component.textColor()).toBe('#000000');

      fixture.componentRef.setInput('cor', '#FFFF00');
      expect(component.textColor()).toBe('#000000');

      fixture.componentRef.setInput('cor', '#00FF00');
      expect(component.textColor()).toBe('#000000');
    });

    it('should return white text for dark background colors', () => {
      fixture.componentRef.setInput('cor', '#000000');
      expect(component.textColor()).toBe('#FFFFFF');

      fixture.componentRef.setInput('cor', '#1a1a1a');
      expect(component.textColor()).toBe('#FFFFFF');

      fixture.componentRef.setInput('cor', '#333333');
      expect(component.textColor()).toBe('#FFFFFF');
    });

    it('should handle colors without # prefix', () => {
      fixture.componentRef.setInput('cor', 'FF5722');
      expect(component.textColor()).toBe('#000000');
    });

    it('should return black for medium luminance colors', () => {
      fixture.componentRef.setInput('cor', '#808080');
      expect(component.textColor()).toBe('#000000');
    });
  });

  describe('template rendering', () => {
    it('should display nome when not compact', () => {
      fixture.componentRef.setInput('nome', 'Alta Prioridade');
      fixture.componentRef.setInput('cor', '#F44336');
      fixture.componentRef.setInput('apelido', 'AP');
      fixture.componentRef.setInput('compact', false);
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.etiqueta-badge');
      expect(badge.textContent.trim()).toBe('Alta Prioridade');
    });

    it('should display apelido when compact', () => {
      fixture.componentRef.setInput('nome', 'Alta Prioridade');
      fixture.componentRef.setInput('cor', '#F44336');
      fixture.componentRef.setInput('apelido', 'AP');
      fixture.componentRef.setInput('compact', true);
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.etiqueta-badge');
      expect(badge.textContent.trim()).toBe('AP');
    });

    it('should apply compact class when compact is true', () => {
      fixture.componentRef.setInput('nome', 'Test');
      fixture.componentRef.setInput('cor', '#2196F3');
      fixture.componentRef.setInput('compact', true);
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.etiqueta-badge');
      expect(badge.classList.contains('compact')).toBe(true);
    });

    it('should not apply compact class when compact is false', () => {
      fixture.componentRef.setInput('nome', 'Test');
      fixture.componentRef.setInput('cor', '#2196F3');
      fixture.componentRef.setInput('compact', false);
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.etiqueta-badge');
      expect(badge.classList.contains('compact')).toBe(false);
    });

    it('should set background color from cor input', () => {
      fixture.componentRef.setInput('nome', 'Test');
      fixture.componentRef.setInput('cor', '#E91E63');
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.etiqueta-badge');
      expect(badge.style.backgroundColor).toBe('rgb(233, 30, 99)');
    });

    it('should set text color based on luminance', () => {
      fixture.componentRef.setInput('nome', 'Test');
      fixture.componentRef.setInput('cor', '#FFFFFF');
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.etiqueta-badge');
      expect(badge.style.color).toBe('rgb(0, 0, 0)');
    });
  });
});
