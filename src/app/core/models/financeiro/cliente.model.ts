export type TipoCliente = 'PJ' | 'PF';

export interface Cliente {
  id: string;
  nome: string;
  cpfCnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  tipo?: TipoCliente | null;
  origemCaptacao?: string | null;
  ativo: boolean;
}

export interface ClienteRequest {
  nome: string;
  cpfCnpj?: string | null;
  email?: string | null;
  telefone?: string | null;
  tipo?: TipoCliente | null;
  origemCaptacao?: string | null;
}