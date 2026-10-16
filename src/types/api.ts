export interface TipoEvento {
    idTipoEvento: string;
    titulo: string;
}

export interface instituicao {
    idInstituicao: string;
    cnpj: string;
    nomeFantasia: string;
    endereco: string;
}

export interface Evento {
    idEvento: string;
    nome: string;
    descricao: string;
    dataEvento: string;
    imagemUrl?: string | null;
    idTipoEvento?:string | null;
    idInstituicao?: string | null;
    idTipoEventoNavigation?: TipoEvento | null;
    idInstituicaoNavigation?: instituicao | null
}

export interface Presenca {
    idPresenca: string;
    situacao: boolean;
    idEvento: string;
    idUsuario?: string | null;
    idEventoNavigation?: Evento | null;
}