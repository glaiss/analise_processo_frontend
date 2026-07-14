export interface ProcessoContatoDTO {
  id: string;
  tipo: 'WHATSAPP' | 'EMAIL';
  valor: string;
  nome: string;
  principal: boolean;
}
