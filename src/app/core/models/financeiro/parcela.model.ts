import { StatusContrato } from './contrato.model';

export type StatusParcela = 'ABERTA' | 'PAGA' | 'ATRASADA' | 'CANCELADA';

export interface Parcela {
  id: string;
  numero: number;
  valorPrevisto: number;
  dataVencimento: string;
  jurosMulta: number;
  valorEfetivo?: number | null;
  valorRecebido: number;
  valorPendente: number;
  status: StatusParcela;
}

export interface Contrato {
  id: string;
  numeroContrato: string;
  numeroProcesso?: string | null;
  clienteId?: string | null;
  clienteNome?: string | null;
  documentoId?: string | null;
  documentoNomeArquivo?: string | null;
  descricao?: string | null;
  valorTotal: number;
  valorDesconto: number;
  dataFechamento: string;
  dataAssinatura?: string | null;
  modalidade: string;
  status: StatusContrato;
  valorRecebido: number;
  valorPendente: number;
  parcelas: Parcela[];
}

export interface SituacaoFinanceira {
  contratoId: string;
  numeroContrato: string;
  valorContratado: number;
  valorRecebido: number;
  valorPendente: number;
  quantidadeParcelas: number;
  parcelasPagas: number;
  parcelas: Parcela[];
  situacao: StatusContrato;
}

export const STATUS_PARCELA_LABEL: Record<StatusParcela, string> = {
  ABERTA: 'Aberta',
  PAGA: 'Paga',
  ATRASADA: 'Atrasada',
  CANCELADA: 'Cancelada',
};