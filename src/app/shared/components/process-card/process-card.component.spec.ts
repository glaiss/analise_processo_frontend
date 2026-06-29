import { TestBed } from '@angular/core/testing';
import { ProcessCardComponent } from './process-card.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProcessoResumoDTO } from '../../../core/models/processo/processo-resumo.model';
import { StatusAtribuicao, ProcessoSituacao } from '../../../core/models/processo/enums.model';

function createProcesso(overrides?: Partial<ProcessoResumoDTO>): ProcessoResumoDTO {
  return {
    numero: '0000001-12.2023.8.26.0100',
    classeJudicial: 'Procedimento Comum',
    assuntoJudicial: 'Indenização',
    dataAjuizamento: '2023-01-15T10:00:00',
    scoreFinal: 75,
    nivel: 'ALTO',
    statusAtribuicao: StatusAtribuicao.DISPONIVEL,
    usuarioResponsavel: null,
    prazoVencendo: false,
    diasParaVencer: 30,
    processoSituacao: ProcessoSituacao.ENRIQUECIDO,
    monitorado: false,
    ...overrides,
  };
}

describe('ProcessCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessCardComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('processo', createProcesso());
    expect(component).toBeTruthy();
  });

  describe('scoreColor', () => {
    it('should return accent for score > 100', () => {
      const fixture = TestBed.createComponent(ProcessCardComponent);
      fixture.componentRef.setInput('processo', createProcesso({ scoreFinal: 150 }));
      expect(fixture.componentInstance.scoreColor).toBe('accent');
    });

    it('should return primary for score between 51 and 100', () => {
      const fixture = TestBed.createComponent(ProcessCardComponent);
      fixture.componentRef.setInput('processo', createProcesso({ scoreFinal: 75 }));
      expect(fixture.componentInstance.scoreColor).toBe('primary');
    });

    it('should return empty for score <= 50', () => {
      const fixture = TestBed.createComponent(ProcessCardComponent);
      fixture.componentRef.setInput('processo', createProcesso({ scoreFinal: 30 }));
      expect(fixture.componentInstance.scoreColor).toBe('');
    });
  });

  describe('deadlineColor', () => {
    it('should return warn for <= 3 days', () => {
      const fixture = TestBed.createComponent(ProcessCardComponent);
      fixture.componentRef.setInput('processo', createProcesso({ diasParaVencer: 2 }));
      expect(fixture.componentInstance.deadlineColor).toBe('warn');
    });

    it('should return empty for > 3 days', () => {
      const fixture = TestBed.createComponent(ProcessCardComponent);
      fixture.componentRef.setInput('processo', createProcesso({ diasParaVencer: 10 }));
      expect(fixture.componentInstance.deadlineColor).toBe('');
    });

    it('should return empty when diasParaVencer is undefined', () => {
      const fixture = TestBed.createComponent(ProcessCardComponent);
      fixture.componentRef.setInput('processo', createProcesso({ diasParaVencer: undefined }));
      expect(fixture.componentInstance.deadlineColor).toBe('');
    });
  });

  it('should render processo numero', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    fixture.componentRef.setInput('processo', createProcesso());
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('0000001-12.2023.8.26.0100');
  });
});
