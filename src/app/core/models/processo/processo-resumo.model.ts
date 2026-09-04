import { ProcessoSituacao, StatusAtribuicao } from './enums.model';
import { EtiquetaDTO } from './etiqueta.model';

export interface ProcessoResumoDTO {
  numero: string;
  classeJudicial: string;
  assuntoJudicial: string;
  dataAjuizamento: string; // ISO LocalDateTime string
  scoreFinal: number;
  nivel: string;
  statusAtribuicao: StatusAtribuicao;
  usuarioResponsavel: string | null;
  equipeNome?: string;
  prazoVencendo: boolean;
  diasParaVencer?: number;
  processoSituacao: ProcessoSituacao;
  monitorado: boolean;
  etiquetas?: EtiquetaDTO[];
}
