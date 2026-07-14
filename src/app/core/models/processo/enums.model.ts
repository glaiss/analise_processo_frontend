export enum StatusAtribuicao {
  NAO_DISPONIVEL = 'NAO_DISPONIVEL',
  DISPONIVEL = 'DISPONIVEL',
  ATRIBUIDO = 'ATRIBUIDO',
  EM_CONVERSA = 'EM_CONVERSA',
  EM_NEGOCIACAO = 'EM_NEGOCIACAO',
  CONCLUIDO_SUCESSO = 'CONCLUIDO_SUCESSO',
  CONCLUIDO_RECUSADO = 'CONCLUIDO_RECUSADO',
}

export const STATUS_DISPLAY: Record<StatusAtribuicao, string> = {
  [StatusAtribuicao.NAO_DISPONIVEL]: 'Não Disponível',
  [StatusAtribuicao.DISPONIVEL]: 'Disponível',
  [StatusAtribuicao.ATRIBUIDO]: 'Atribuído',
  [StatusAtribuicao.EM_CONVERSA]: 'Em Conversa',
  [StatusAtribuicao.EM_NEGOCIACAO]: 'Em Negociação',
  [StatusAtribuicao.CONCLUIDO_SUCESSO]: 'Concluído com Sucesso',
  [StatusAtribuicao.CONCLUIDO_RECUSADO]: 'Concluído Recusado',
};

export enum ResultadoAtendimento {
  ACEITOU = 'ACEITOU',
  RECUSOU = 'RECUSOU',
}

export enum TipologiaProcesso {
  JUDICIAL = 'JUDICIAL',
  ADMINISTRATIVO = 'ADMINISTRATIVO',
}

export enum ProcessoSituacao {
  AGUARDANDO_DISTRIBUICAO = 'AGUARDANDO_DISTRIBUICAO',
  PENDENTE_ENRIQUECIMENTO = 'PENDENTE_ENRIQUECIMENTO',
  EM_ENRIQUECIMENTO = 'EM_ENRIQUECIMENTO',
  ENRIQUECIDO = 'ENRIQUECIDO',
  DESCARTADO_SCORE_BAIXO = 'DESCARTADO_SCORE_BAIXO',
  DESCARTADO_POR_USUARIO = 'DESCARTADO_POR_USUARIO',
  PROPOSTA_APRESENTADA = 'PROPOSTA_APRESENTADA',
  FINALIZADO = 'FINALIZADO',
  ERRO_PROCESSAMENTO = 'ERRO_PROCESSAMENTO'
}

export const SCORE_OPTIONS = ['ALTO', 'INTERMEDIARIO_ALTO', 'MEDIO', 'INTERMEDIARIO_BAIXO', 'MINIMO'] as const;

export const SCORE_DISPLAY: Record<string, string> = {
  ALTO: 'Alto',
  INTERMEDIARIO_ALTO: 'Intermediário Alto',
  MEDIO: 'Médio',
  INTERMEDIARIO_BAIXO: 'Intermediário Baixo',
  MINIMO: 'Mínimo',
};

export const SITUACAO_DISPLAY: Record<ProcessoSituacao, string> = {
  [ProcessoSituacao.AGUARDANDO_DISTRIBUICAO]: 'Aguardando Distribuição',
  [ProcessoSituacao.PENDENTE_ENRIQUECIMENTO]: 'Pendente de Enriquecimento',
  [ProcessoSituacao.EM_ENRIQUECIMENTO]: 'Em Enriquecimento',
  [ProcessoSituacao.ENRIQUECIDO]: 'Enriquecido',
  [ProcessoSituacao.DESCARTADO_SCORE_BAIXO]: 'Descartado por Score Baixo',
  [ProcessoSituacao.DESCARTADO_POR_USUARIO]: 'Descartado por Usuário',
  [ProcessoSituacao.PROPOSTA_APRESENTADA]: 'Proposta Apresentada',
  [ProcessoSituacao.FINALIZADO]: 'Finalizado',
  [ProcessoSituacao.ERRO_PROCESSAMENTO]: 'Erro no Processamento',
};
