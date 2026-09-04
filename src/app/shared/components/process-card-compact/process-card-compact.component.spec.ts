import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProcessCardCompactComponent } from './process-card-compact.component';
import { ProcessoResumoDTO } from '../../../core/models/processo/processo-resumo.model';
import { StatusAtribuicao } from '../../../core/models/processo/enums.model';

describe('ProcessCardCompactComponent', () => {
  let fixture: ComponentFixture<ProcessCardCompactComponent>;

  const mockProcesso: ProcessoResumoDTO = {
    numero: '1234567-89.2024.8.26.0000',
    classeJudicial: 'Ação Civil',
    assuntoJudicial: 'Direito Civil',
    dataAjuizamento: '2024-01-15T10:00:00',
    scoreFinal: 85,
    nivel: 'ALTO',
    statusAtribuicao: StatusAtribuicao.ATRIBUIDO,
    usuarioResponsavel: 'João',
    prazoVencendo: false,
    processoSituacao: 'ATIVO' as any,
    monitorado: true,
  };

  async function setup(processo: ProcessoResumoDTO = mockProcesso): Promise<ProcessCardCompactComponent> {
    await TestBed.configureTestingModule({
      imports: [ProcessCardCompactComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessCardCompactComponent);
    fixture.componentRef.setInput('processo', processo);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('scoreColor', () => {
    it('should return low for score >= 80', async () => {
      const component = await setup();
      expect(component.scoreColor).toBe('low');
    });

    it('should return medium for score 50-79', async () => {
      const component = await setup({ ...mockProcesso, scoreFinal: 60 });
      expect(component.scoreColor).toBe('medium');
    });

    it('should return high for score < 50', async () => {
      const component = await setup({ ...mockProcesso, scoreFinal: 30 });
      expect(component.scoreColor).toBe('high');
    });
  });

  describe('onToggleMonitoramento', () => {
    it('should emit monitorToggle with process number', async () => {
      const component = await setup();
      vi.spyOn(component.monitorToggle, 'emit');
      const event = new MouseEvent('click');
      vi.spyOn(event, 'stopPropagation');
      component.onToggleMonitoramento(event);
      expect(event.stopPropagation).toHaveBeenCalled();
      expect(component.monitorToggle.emit).toHaveBeenCalledWith(mockProcesso.numero);
    });
  });

  describe('onCardClick', () => {
    it('should emit cardClick with process number', async () => {
      const component = await setup();
      vi.spyOn(component.cardClick, 'emit');
      component.onCardClick();
      expect(component.cardClick.emit).toHaveBeenCalledWith(mockProcesso.numero);
    });
  });

  describe('template rendering', () => {
    it('should display process number', async () => {
      await setup();
      expect(fixture.nativeElement.textContent).toContain(mockProcesso.numero);
    });

    it('should display score', async () => {
      await setup();
      expect(fixture.nativeElement.textContent).toContain('85');
    });

    it('should show star icon for monitored process', async () => {
      await setup();
      const icon = fixture.nativeElement.querySelector('.monitor-icon');
      expect(icon.textContent.trim()).toBe('star');
    });

    it('should show star_border icon for non-monitored process', async () => {
      await setup({ ...mockProcesso, monitorado: false });
      const icon = fixture.nativeElement.querySelector('.monitor-icon');
      expect(icon.textContent.trim()).toBe('star_border');
    });

    it('should apply monitored class when monitored', async () => {
      await setup();
      const icon = fixture.nativeElement.querySelector('.monitor-icon');
      expect(icon.classList.contains('monitored')).toBe(true);
    });

    it('should not apply monitored class when not monitored', async () => {
      await setup({ ...mockProcesso, monitorado: false });
      const icon = fixture.nativeElement.querySelector('.monitor-icon');
      expect(icon.classList.contains('monitored')).toBe(false);
    });

    it('should render etiquetas when present', async () => {
      await setup({
        ...mockProcesso,
        etiquetas: [
          { id: '1', nome: 'Alta', cor: '#F44336', tipo: 'GLOBAL', apelido: 'AL', usuarioNome: null },
        ],
      });
      expect(fixture.nativeElement.querySelector('app-etiqueta-badge')).toBeTruthy();
    });

    it('should not render etiquetas row when empty', async () => {
      await setup({ ...mockProcesso, etiquetas: [] });
      expect(fixture.nativeElement.querySelector('.etiquetas-row')).toBeFalsy();
    });

    it('should apply low score class', async () => {
      await setup();
      const badge = fixture.nativeElement.querySelector('.score-badge');
      expect(badge.classList.contains('low')).toBe(true);
    });

    it('should apply medium score class', async () => {
      await setup({ ...mockProcesso, scoreFinal: 60 });
      const badge = fixture.nativeElement.querySelector('.score-badge');
      expect(badge.classList.contains('medium')).toBe(true);
    });

    it('should apply high score class', async () => {
      await setup({ ...mockProcesso, scoreFinal: 30 });
      const badge = fixture.nativeElement.querySelector('.score-badge');
      expect(badge.classList.contains('high')).toBe(true);
    });
  });
});
