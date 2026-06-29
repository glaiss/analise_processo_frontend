import { TestBed } from '@angular/core/testing';
import { ScoreBreakdownComponent } from './score-breakdown.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProcessoDetalheDTO } from '../../../core/models/processo/processo-detalhe.model';
import { StatusAtribuicao } from '../../../core/models/processo/enums.model';

function createProcessoDetalhe(overrides?: Partial<ProcessoDetalheDTO>): ProcessoDetalheDTO {
  return {
    numero: '0000001-12.2023.8.26.0100',
    classeJudicial: 'Procedimento Comum',
    assuntoJudicial: 'Indenização',
    dataAjuizamento: '2023-01-15T10:00:00',
    orgaoJulgador: '1ª Vara Cível',
    scoreFinal: 85,
    nivel: 'ALTO',
    statusAtribuicao: StatusAtribuicao.DISPONIVEL,
    usuarioResponsavel: 'João',
    equipeNome: 'Equipe A',
    valorCausa: 50000,
    ultimaMovimentacao: '2024-01-10T14:00:00',
    quantidadeMovimentacoes: 5,
    tribunal: 'TJSP',
    foro: 'Foro Central',
    sistemaNome: 'PJE',
    grau: '1º Grau',
    hipoteses: [
      { nomeRegra: 'Hipótese 1', pontos: 50, justificativa: 'Detalhe 1' },
      { nomeRegra: 'Hipótese 2', pontos: 35, justificativa: 'Detalhe 2' },
    ],
    historicoContatos: [],
    partes: [],
    movimentacoes: [],
    anotacoes: [],
    monitorado: false,
    ...overrides,
  };
}

describe('ScoreBreakdownComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreBreakdownComponent, NoopAnimationsModule],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ScoreBreakdownComponent);
    fixture.componentRef.setInput('processo', createProcessoDetalhe());
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display score final', () => {
    const fixture = TestBed.createComponent(ScoreBreakdownComponent);
    fixture.componentRef.setInput('processo', createProcessoDetalhe());
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('85');
  });

  it('should display hipoteses', () => {
    const fixture = TestBed.createComponent(ScoreBreakdownComponent);
    fixture.componentRef.setInput('processo', createProcessoDetalhe());
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Hipótese 1');
    expect(fixture.nativeElement.textContent).toContain('Hipótese 2');
  });
});
