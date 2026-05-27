/**
 * Status do Funil de Atendimento
 */
export enum StatusAtribuicao {
  DISPONIVEL = 'DISPONIVEL',
  ATRIBUIDO = 'ATRIBUIDO',
  EM_CONVERSA = 'EM_CONVERSA',
  NEGOCIACAO = 'NEGOCIACAO',
  CONCLUIDO_SUCESSO = 'CONCLUIDO_SUCESSO',
  CONCLUIDO_RECUSADO = 'CONCLUIDO_RECUSADO'
}

/**
 * Resumo para Listagens e Kanban
 */
export interface ProcessoResumoDTO {
  numero: string;
  classeJudicial: string;
  assuntoJudicial: string;
  dataAjuizamento: string; // ISO LocalDateTime string
  scoreFinal: number;
  nivel: string;
  statusAtribuicao: any;
  usuarioResponsavel: string | null;
  equipeNome?: string;
  prazoVencendo: boolean;
  diasParaVencer?: number;
}

/**
 * Detalhe para Análise 360º
 */
export interface ProcessoDetalheDTO {
  numero: string;
  classeJudicial: string;
  assuntoJudicial: string;
  dataAjuizamento: string;
  orgaoJulgador: string;
  scoreFinal: number;
  nivel: string;
  statusAtribuicao: StatusAtribuicao;
  usuarioResponsavel: string;
  equipeNome: string;
  hipoteses: ScoreItemDTO[];
  historicoContatos: EventoContatoDTO[];
}

/**
 * Explicação do Score
 */
export interface ScoreItemDTO {
  nomeRegra: string;
  pontos: number;
  justificativa: string;
}

/**
 * Registro de Interação CRM
 */
export interface EventoContatoDTO {
  descricao: string;
  usuarioNome: string;
  dataCriacao: string; // ISO LocalDateTime string
}

/**
 * Interface para paginação do Spring Data
 */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}
