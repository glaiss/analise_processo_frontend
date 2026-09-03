export interface EtiquetaDTO {
  id: string;
  nome: string;
  cor: string;
  tipo: 'GLOBAL' | 'USUARIO';
  apelido: string;
  usuarioNome: string | null;
}

export interface EtiquetaRequestDTO {
  nome: string;
  cor: string;
}
