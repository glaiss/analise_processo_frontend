export type FonteAcompanhamento = 'EPROC' | 'ESAJ_1G' | 'ESAJ_2G';

export interface FonteAcompanhamentoOpcao {
  valor: FonteAcompanhamento;
  label: string;
  descricao: string;
}

export const FONTES_ACOMPANHAMENTO: readonly FonteAcompanhamentoOpcao[] = [
  {
    valor: 'EPROC',
    label: 'eProc TJSP',
    descricao: 'Fonte principal: consulta pública do eProc',
  },
  {
    valor: 'ESAJ_1G',
    label: 'eSAJ - 1º Grau',
    descricao: 'Fallback para processos de primeira instância no TJSP',
  },
  {
    valor: 'ESAJ_2G',
    label: 'eSAJ - 2º Grau',
    descricao: 'Fallback para recursos e processos de segunda instância no TJSP',
  },
];

export function fonteLabel(valor: FonteAcompanhamento | string | null | undefined): string {
  return FONTES_ACOMPANHAMENTO.find((fonte) => fonte.valor === valor)?.label ?? valor ?? '';
}
