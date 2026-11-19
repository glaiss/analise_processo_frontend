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

export interface FonteSincronizacaoDTO {
  fonte: FonteAcompanhamento;
  descricao: string;
  status: string | null;
  quantidadeEncontrada: number | null;
  quantidadeProcessada: number | null;
  quantidadeCompleta: number | null;
  quantidadeErro: number | null;
  totalEsperado: number | null;
  iniciadaEm: string | null;
  finalizadaEm: string | null;
  ultimoErro: string | null;
}

export interface StatusSincronizacaoDTO {
  status: string | null;
  ultimaSincronizacaoEm: string | null;
  ultimoErro: string | null;
  fontes: FonteSincronizacaoDTO[];
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
  fontePrincipal: FonteAcompanhamento | null;
  fontes: FonteAcompanhamento[];
  statusDados: string | null;
  dadosCompletos: boolean;
  partesOk: boolean;
  advogadosOk: boolean;
  movimentacoesOk: boolean;
  pendencias: string | null;
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
  fontePrincipal: FonteAcompanhamento | null;
  fontes: FonteAcompanhamento[];
  statusDados: string | null;
  dadosCompletos: boolean;
  partesOk: boolean;
  advogadosOk: boolean;
  movimentacoesOk: boolean;
  pendencias: string | null;
  ultimaVerificacaoEm: string | null;
  partes: ProcessoAcompanhadoParteDTO[];
  movimentacoes: ProcessoAcompanhadoMovimentacaoDTO[];
}

export interface SincronizacaoResultadoDTO {
  novos: number;
  atualizados: number;
  desvinculados: number;
  erros: number;
}

export interface ProcessoSincronizacaoResultadoDTO {
  numero: string;
  fonte: FonteAcompanhamento | null;
  encontrado: boolean;
  completo: boolean;
  statusDados: string | null;
  pendencias: string | null;
}
