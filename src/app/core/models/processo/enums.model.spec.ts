import { ProcessoSituacao, ResultadoAtendimento, SITUACAO_DISPLAY, STATUS_DISPLAY, StatusAtribuicao, TipologiaProcesso } from './enums.model';

describe('StatusAtribuicao', () => {
  it('should have all expected values', () => {
    expect(StatusAtribuicao.NAO_DISPONIVEL).toBe('NAO_DISPONIVEL');
    expect(StatusAtribuicao.DISPONIVEL).toBe('DISPONIVEL');
    expect(StatusAtribuicao.ATRIBUIDO).toBe('ATRIBUIDO');
    expect(StatusAtribuicao.EM_CONVERSA).toBe('EM_CONVERSA');
    expect(StatusAtribuicao.EM_NEGOCIACAO).toBe('EM_NEGOCIACAO');
    expect(StatusAtribuicao.CONCLUIDO_SUCESSO).toBe('CONCLUIDO_SUCESSO');
    expect(StatusAtribuicao.CONCLUIDO_RECUSADO).toBe('CONCLUIDO_RECUSADO');
  });
});

describe('ResultadoAtendimento', () => {
  it('should have all expected values', () => {
    expect(ResultadoAtendimento.ACEITOU).toBe('ACEITOU');
    expect(ResultadoAtendimento.RECUSOU).toBe('RECUSOU');
  });
});

describe('TipologiaProcesso', () => {
  it('should have all expected values', () => {
    expect(TipologiaProcesso.JUDICIAL).toBe('JUDICIAL');
    expect(TipologiaProcesso.ADMINISTRATIVO).toBe('ADMINISTRATIVO');
  });
});

describe('ProcessoSituacao', () => {
  it('should have all expected values', () => {
    expect(ProcessoSituacao.AGUARDANDO_DISTRIBUICAO).toBe('AGUARDANDO_DISTRIBUICAO');
    expect(ProcessoSituacao.PENDENTE_ENRIQUECIMENTO).toBe('PENDENTE_ENRIQUECIMENTO');
    expect(ProcessoSituacao.EM_ENRIQUECIMENTO).toBe('EM_ENRIQUECIMENTO');
    expect(ProcessoSituacao.ENRIQUECIDO).toBe('ENRIQUECIDO');
    expect(ProcessoSituacao.DESCARTADO_SCORE_BAIXO).toBe('DESCARTADO_SCORE_BAIXO');
    expect(ProcessoSituacao.DESCARTADO_POR_USUARIO).toBe('DESCARTADO_POR_USUARIO');
    expect(ProcessoSituacao.PROPOSTA_APRESENTADA).toBe('PROPOSTA_APRESENTADA');
    expect(ProcessoSituacao.FINALIZADO).toBe('FINALIZADO');
    expect(ProcessoSituacao.ERRO_PROCESSAMENTO).toBe('ERRO_PROCESSAMENTO');
  });

  it('should have display labels for every value', () => {
    const values = Object.values(ProcessoSituacao);
    for (const v of values) {
      expect(SITUACAO_DISPLAY[v]).toBeTruthy();
    }
  });
});

describe('STATUS_DISPLAY', () => {
  it('should have display labels for every StatusAtribuicao value', () => {
    const values = Object.values(StatusAtribuicao);
    for (const v of values) {
      expect(STATUS_DISPLAY[v]).toBeTruthy();
    }
  });
});
