export function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'ATIVO':
      return 'Ativo';
    case 'PROCESSO_DESVINCULADO':
      return 'Desvinculado';
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
      return 'success';
    case 'EM_ANDAMENTO':
      return 'info';
    case 'ERRO':
      return 'error';
    case 'PROCESSO_DESVINCULADO':
    case 'NAO_ENCONTRADO':
      return 'warn';
    case null:
    case undefined:
      return 'neutral';
    default:
      return 'neutral';
  }
}
