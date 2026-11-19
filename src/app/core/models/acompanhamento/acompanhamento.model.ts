import { FonteAcompanhamento } from './fonte-acompanhamento';

export interface OabResponse {
  numero: string;
  uf: string;
  fontes: FonteAcompanhamento[];
  ativo: boolean;
  ultimoStatus: string | null;
  ultimaSincronizacaoEm: string | null;
  ultimoErro: string | null;
}

export interface OabMembroDTO {
  usuarioId: string;
  username: string;
  nome: string;
  usuarioAtual: boolean;
  temOab: boolean;
  ativo: boolean;
  oabNumero: string | null;
  oabUf: string | null;
  fontes: FonteAcompanhamento[];
  ultimoStatus: string | null;
  ultimaSincronizacaoEm: string | null;
  ultimoErro: string | null;
}

export interface OabEquipeResponse {
  todosComOab: boolean;
  usuarioAtualTemOab: boolean;
  membros: OabMembroDTO[];
}

export interface StatusSincronizacaoDTO {
  status: string | null;
  ultimaSincronizacaoEm: string | null;
  ultimoErro: string | null;
}

export interface ProcessoAcompanhadoResumoDTO {
  numero: string;
  tribunal: string;
  classe: string | null;
  assunto: string | null;
  situacao: string | null;
  grau: string | null;
  ultimaMovimentacao: string | null;
  quantidadeMovimentacoes: number | null;
  statusVinculo: string | null;
  donoUsername: string;
  donoNome: string;
  oab: string;
}

export interface ProcessoAcompanhadoParteDTO {
  nome: string | null;
  papel: string | null;
  polo: string | null;
  advogados: string[];
}

export interface ProcessoAcompanhadoMovimentacaoDTO {
  dataHora: string | null;
  descricao: string | null;
  tipo: string | null;
  orgaoJulgadorNome: string | null;
  dadoScrapper: boolean | null;
}

export interface ProcessoAcompanhadoDetalheDTO {
  numero: string;
  tribunal: string;
  classe: string | null;
  assunto: string | null;
  situacao: string | null;
  grau: string | null;
  foro: string | null;
  orgaoJulgadorNome: string | null;
  dataAjuizamento: string | null;
  ultimaMovimentacao: string | null;
  quantidadeMovimentacoes: number | null;
  statusVinculo: string | null;
  donoUsername: string;
  donoNome: string;
  oab: string;
  partes: ProcessoAcompanhadoParteDTO[];
  movimentacoes: ProcessoAcompanhadoMovimentacaoDTO[];
}

export interface SincronizacaoResultadoDTO {
  novos: number;
  atualizados: number;
  desvinculados: number;
  erros: number;
}
