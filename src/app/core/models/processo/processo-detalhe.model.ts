import { StatusAtribuicao } from './enums.model';
import { ScoreItemDTO } from './score-item.model';
import { EventoContatoDTO } from './evento-contato.model';

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
