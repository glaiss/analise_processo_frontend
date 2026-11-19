export type FonteAcompanhamento = 'ESAJ_1G' | 'ESAJ_2G' | 'EPROC';

export interface FonteAcompanhamentoOpcao {
  valor: FonteAcompanhamento;
  label: string;
  descricao: string;
}

export const FONTES_ACOMPANHAMENTO: readonly FonteAcompanhamentoOpcao[] = [
  {
    valor: 'ESAJ_1G',
    label: 'eSAJ - 1º Grau',
    descricao: 'Processos de primeira instância no TJSP',
  },
  {
    valor: 'ESAJ_2G',
    label: 'eSAJ - 2º Grau',
    descricao: 'Recursos e processos de segunda instância no TJSP',
  },
  {
    valor: 'EPROC',
    label: 'eProc TJSP',
    descricao: 'Consulta pública do eProc (1º grau)',
  },
];

export function fonteLabel(valor: FonteAcompanhamento | string | null | undefined): string {
  return FONTES_ACOMPANHAMENTO.find((fonte) => fonte.valor === valor)?.label ?? valor ?? '';
}
