import { StatusAtribuicao, ProcessoSituacao, TipologiaProcesso } from './enums.model';

export interface AtribuicaoProcessoResumoDTO {
    id: string;
    status: StatusAtribuicao;
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
}
