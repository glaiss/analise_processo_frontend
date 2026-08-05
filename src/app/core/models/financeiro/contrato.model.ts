export type ModalidadeContrato = 'FIXA' | 'HONORARIOS' | 'EXITO' | 'RECORRENTE';
export type StatusContrato = 'RASCUNHO' | 'ATIVO' | 'PAGO' | 'PARCIAL' | 'VENCIDO' | 'CANCELADO' | 'RENEGOCIADO';

export interface ParcelaRequest {
  numero: number;
  valor: number;
  dataVencimento: string;
}

export interface ContratoRequest {
  numeroContrato: string;
  descricao?: string | null;
  modalidade: ModalidadeContrato;
  clienteId?: string | null;
  cliente?: {
    nome: string;
    cpfCnpj?: string | null;
    email?: string | null;
    telefone?: string | null;
    tipo?: string | null;
    origemCaptacao?: string | null;
  } | null;
  valorTotal: number;
  valorDesconto?: number | null;
  dataAssinatura?: string | null;
  parcelas: ParcelaRequest[];
}

export const MODALIDADE_LABEL: Record<ModalidadeContrato, string> = {
  FIXA: 'Fixa',
  HONORARIOS: 'Honorários',
  EXITO: 'Êxito',
  RECORRENTE: 'Recorrente',
};

export const STATUS_CONTRATO_LABEL: Record<StatusContrato, string> = {
  RASCUNHO: 'Rascunho',
  ATIVO: 'Ativo',
  PAGO: 'Pago',
  PARCIAL: 'Parcial',
  VENCIDO: 'Vencido',
  CANCELADO: 'Cancelado',
  RENEGOCIADO: 'Renegociado',
};