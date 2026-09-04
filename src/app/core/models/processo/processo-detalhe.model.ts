import { StatusAtribuicao } from './enums.model';
import { ScoreItemDTO } from './score-item.model';
import { EventoContatoDTO } from './evento-contato.model';
import { ProcessoParteDTO } from './processo-parte.model';
import { MovimentacaoDTO } from './movimentacao.model';
import { ProcessoAnotacaoDTO } from './processo-anotacao.model';
import { EtiquetaDTO } from './etiqueta.model';

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

  atribuicaoId: string;
  prazoFinal: string | null;
  diasPendentes: number | null;
  statusPrazo: string | null;

  // Novos campos de contexto
  valorCausa: number;
  ultimaMovimentacao: string;
  quantidadeMovimentacoes: number;
  tribunal: string;
  foro: string;
  sistemaNome: string;
  grau: string;

  hipoteses: ScoreItemDTO[];
  historicoContatos: EventoContatoDTO[];
  partes: ProcessoParteDTO[];
  movimentacoes: MovimentacaoDTO[];
  anotacoes: ProcessoAnotacaoDTO[];
  contatos?: any[];
  monitorado: boolean;
  etiquetas?: EtiquetaDTO[];
}
