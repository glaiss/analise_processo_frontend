import { TestBed } from '@angular/core/testing';
import { ProcessCardComponent } from './process-card.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProcessoResumoDTO } from '../../../core/models/processo/processo-resumo.model';
import { ProcessoSituacao, StatusAtribuicao } from '../../../core/models/processo/enums.model';

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

  it('should render score avatar with text', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    fixture.componentRef.setInput('processo', createProcesso({ scoreFinal: 85 }));
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('.score-avatar');
    expect(avatar).toBeTruthy();
    expect(avatar.textContent).toContain('85');
    expect(avatar.classList).toContain('primary');
  });

  it('should render high-priority class for score > 100', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    fixture.componentRef.setInput('processo', createProcesso({ scoreFinal: 150 }));
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.process-card');
    expect(card.classList).toContain('high-priority');
  });

  it('should not render high-priority class for score <= 100', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    fixture.componentRef.setInput('processo', createProcesso({ scoreFinal: 100 }));
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.process-card');
    expect(card.classList).not.toContain('high-priority');
  });

  it('should render prazo chip when prazoVencendo is true', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    fixture.componentRef.setInput('processo', createProcesso({ prazoVencendo: true, diasParaVencer: 5 }));
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    expect(chips.length).toBe(2);
    expect(chips[0].textContent).toContain('5 dias');
    expect(chips[0].querySelector('mat-icon')).toBeTruthy();
  });

  it('should not render prazo chip when prazoVencendo is false', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    fixture.componentRef.setInput('processo', createProcesso({ prazoVencendo: false }));
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    expect(chips.length).toBe(1);
  });

  it('should render deadline chip with correct color for <= 3 days', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    fixture.componentRef.setInput('processo', createProcesso({ prazoVencendo: true, diasParaVencer: 2 }));
    fixture.detectChanges();

    const chip = fixture.nativeElement.querySelector('mat-chip');
    expect(chip).toBeTruthy();
    expect(fixture.componentInstance.deadlineColor).toBe('warn');
  });

  it('should render subtitle with classJudicial and dataAjuizamento', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    fixture.componentRef.setInput('processo', createProcesso());
    fixture.detectChanges();

    const subtitle = fixture.nativeElement.querySelector('mat-card-subtitle');
    expect(subtitle.textContent).toContain('Procedimento Comum');

    const metadata = fixture.nativeElement.querySelector('.metadata');
    expect(metadata.textContent).toContain('Ajuizamento');
  });

  it('should render status chip with statusDisplay pipe', () => {
    const fixture = TestBed.createComponent(ProcessCardComponent);
    fixture.componentRef.setInput('processo', createProcesso({ statusAtribuicao: StatusAtribuicao.DISPONIVEL }));
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    const statusChip = chips[chips.length - 1];
    expect(statusChip.textContent).toContain('Disponível');
  });
});
