import { ProcessoSituacao, ResultadoAtendimento, StatusAtribuicao, TipologiaProcesso } from './enums.model';

export interface AtribuicaoProcessoResumoDTO {
    id: string;
    status: StatusAtribuicao;
    resultadoAtendimento: ResultadoAtendimento | null;
    statusPrazo: string;
    isVencendoPrazo: boolean;

    processoNumero: string;
    processoTribunal: string;
    processoOrgaoJulgadorNome: string;
    processoDataAjuizamento: string;
    processoValorCausa: number;
    processoSituacao: ProcessoSituacao;
    processoTipologia: TipologiaProcesso;
    processoScoreFinal: number;
    processoEnriquecimentoStatus: string;
    processoEnriquecimentoErro: string;

    equipeNome: string;
    usuarioNome: string;
    monitorado: boolean;
    isLido: boolean;
}
