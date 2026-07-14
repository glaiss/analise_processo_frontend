import { TestBed } from '@angular/core/testing';
import { SituacaoDisplayPipe } from './situacao-display.pipe';
import { ProcessoSituacao } from '../../core/models/processo/enums.model';

describe('SituacaoDisplayPipe', () => {
  let pipe: SituacaoDisplayPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SituacaoDisplayPipe] });
    pipe = TestBed.inject(SituacaoDisplayPipe);
  });

  it('should be created', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform AGUARDANDO_DISTRIBUICAO to "Aguardando Distribuição"', () => {
    expect(pipe.transform(ProcessoSituacao.AGUARDANDO_DISTRIBUICAO)).toBe('Aguardando Distribuição');
  });

  it('should transform PENDENTE_ENRIQUECIMENTO to "Pendente de Enriquecimento"', () => {
    expect(pipe.transform(ProcessoSituacao.PENDENTE_ENRIQUECIMENTO)).toBe('Pendente de Enriquecimento');
  });

  it('should transform EM_ENRIQUECIMENTO to "Em Enriquecimento"', () => {
    expect(pipe.transform(ProcessoSituacao.EM_ENRIQUECIMENTO)).toBe('Em Enriquecimento');
  });

  it('should transform ENRIQUECIDO to "Enriquecido"', () => {
    expect(pipe.transform(ProcessoSituacao.ENRIQUECIDO)).toBe('Enriquecido');
  });

  it('should transform DESCARTADO_SCORE_BAIXO to "Descartado por Score Baixo"', () => {
    expect(pipe.transform(ProcessoSituacao.DESCARTADO_SCORE_BAIXO)).toBe('Descartado por Score Baixo');
  });

  it('should transform DESCARTADO_POR_USUARIO to "Descartado por Usuário"', () => {
    expect(pipe.transform(ProcessoSituacao.DESCARTADO_POR_USUARIO)).toBe('Descartado por Usuário');
  });

  it('should transform PROPOSTA_APRESENTADA to "Proposta Apresentada"', () => {
    expect(pipe.transform(ProcessoSituacao.PROPOSTA_APRESENTADA)).toBe('Proposta Apresentada');
  });

  it('should transform FINALIZADO to "Finalizado"', () => {
    expect(pipe.transform(ProcessoSituacao.FINALIZADO)).toBe('Finalizado');
  });

  it('should transform ERRO_PROCESSAMENTO to "Erro no Processamento"', () => {
    expect(pipe.transform(ProcessoSituacao.ERRO_PROCESSAMENTO)).toBe('Erro no Processamento');
  });

  it('should return raw value if not found in map', () => {
    expect(pipe.transform('UNKNOWN')).toBe('UNKNOWN');
  });

  it('should return empty string for null', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
