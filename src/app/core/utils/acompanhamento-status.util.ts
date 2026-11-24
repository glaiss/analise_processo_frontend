export function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'ATIVO':
    case 'COMPLETO':
      return status === 'COMPLETO' ? 'Completo' : 'Ativo';
    case 'PROCESSO_DESVINCULADO':
      return 'Desvinculado';
    case 'PARCIAL':
      return 'Parcial';
    case 'PENDENTE':
      return 'Pendente';
    case 'ERRO':
      return 'Erro';
    case 'CONCLUIDO':
      return 'Sincronizado';
    case 'EM_ANDAMENTO':
      return 'Sincronizando...';
    case 'NAO_ENCONTRADO':
      return 'Não encontrado';
    case null:
    case undefined:
      return 'Aguardando';
    default:
      return 'Aguardando';
  }
}

export function statusColor(status: string | null | undefined): string {
  switch (status) {
    case 'ATIVO':
    case 'CONCLUIDO':
    case 'COMPLETO':
      return 'success';
    case 'PARCIAL':
      return 'warn';
    case 'EM_ANDAMENTO':
      return 'info';
    case 'ERRO':
      return 'error';
    case 'PROCESSO_DESVINCULADO':
    case 'NAO_ENCONTRADO':
    case 'PENDENTE':
      return 'warn';
    case null:
    case undefined:
      return 'neutral';
    default:
      return 'neutral';
  }
}


const PENDENCIA_LABELS: Record<string, string> = {
  SEM_PARTES: 'sem partes',
  PARTE_SEM_NOME: 'parte sem nome',
  PARTES_DUPLICADAS: 'partes duplicadas',
  ADVOGADO_SEM_NOME: 'advogado sem nome',
  ADVOGADOS_DUPLICADOS: 'advogados duplicados',
  ADVOGADOS_NAO_VINCULADOS: 'advogados não vinculados',
  PARTE_NAO_VINCULADA: 'parte não vinculada',
  SEM_MOVIMENTACOES: 'sem movimentações',
  MOVIMENTACAO_SEM_DATA: 'movimentação sem data',
  MOVIMENTACOES_DUPLICADAS: 'movimentações duplicadas',
  MOVIMENTACOES_NAO_EXTRAIDAS: 'movimentações não extraídas',
  QUANTIDADE_MOVIMENTACOES_DIVERGENTE: 'quantidade de movimentações divergente',
  ULTIMA_MOVIMENTACAO_DIVERGENTE: 'última movimentação divergente',
};

export function pendenciaLabel(pendencias: string | null | undefined): string {
  if (!pendencias) {
    return 'Dados completos';
  }
  return pendencias
    .split(',')
    .map((pendencia) => pendencia.trim())
    .filter(Boolean)
    .map((pendencia) => PENDENCIA_LABELS[pendencia] ?? pendencia)
    .join(', ');
}
