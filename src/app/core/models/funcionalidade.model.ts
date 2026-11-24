export const FUNCIONALIDADES = ['FUNC_ACOMPANHAMENTO'] as const;

export type Funcionalidade = (typeof FUNCIONALIDADES)[number];

export const FUNCIONALIDADE_LABELS: Record<Funcionalidade, string> = {
  FUNC_ACOMPANHAMENTO: 'Acompanhamento',
};
