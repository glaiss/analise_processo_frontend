export type FormaPagamento = 'PIX' | 'BOLETO' | 'TRANSFERENCIA' | 'CARTAO' | 'CHEQUE';

export interface RecebimentoRequest {
  parcelaId: string;
  valorRecebido: number;
  jurosMulta?: number | null;
  formaPagamento: FormaPagamento;
  dataRecebimento?: string | null;
  referenciaIntegracao?: string | null;
}

export interface Recebimento {
  id: string;
  parcelaId: string;
  numeroParcela?: number | null;
  valorRecebido: number;
  jurosMulta: number;
  valorLiquido: number;
  formaPagamento: FormaPagamento;
  dataRecebimento: string;
  estornado: boolean;
  referenciaIntegracao?: string | null;
}

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transferência',
  CARTAO: 'Cartão',
  CHEQUE: 'Cheque',
};