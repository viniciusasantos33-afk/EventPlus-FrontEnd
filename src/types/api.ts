export interface TipoEvento {
    idTipoEvento: string;
    titulo: string;
}

/** Representações retornadas pela API EventPlus. */
export interface EventoApi {
    idEvento: string;
    nomeEvento: string;
    dataEvento: string;
    descricao: string;
    imagemUrl: string | null;
    idTipoEvento?: string | null;
    idInstituicao?: string | null;
    idTipoEventoNavigation?: TipoEventoApi | null;
    idInstituicaoNavigation?: InstituicaoApi | null;
}

export interface TipoEventoApi {
    tituloTipoEvento?: string;
}

export interface InstituicaoApi {
    idInstituicao?: string;
    nomeFantasia?: string;
    endereco?: string;
}

export interface TipoEventoListaApi {
    idTipoEvento: string;
    tituloTipoEvento: string;
}

export interface InstituicaoListaApi {
    idInstituicao: string;
    cnpj: string;
    nomeFantasia: string;
    endereco: string;
}

export interface InstituicaoInput {
    cnpj: string;
    nomeFantasia: string;
    endereco: string;
}

export interface CriarEventoInput {
    nomeEvento: string;
    dataEvento: string;
    descricao: string;
    idTipoEvento: string;
    idInstituicao: string;
    imagem?: File | null;
}

export interface AtualizarEventoInput {
    nomeEvento: string;
    dataEvento: string;
    descricao: string;
    imagemUrl: string | null;
    idTipoEvento: string;
    idInstituicao: string;
}

export interface ComentarioApi {
    idComentario: string;
    dataComentario: string;
    descricao: string;
    exibe: boolean;
    idUsuario?: string | null;
    idUsuarioNavigation?: UsuarioApi | null;
}

export interface UsuarioApi {
    idUsuario?: string;
    nome?: string;
    email?: string;
}

export interface TipoUsuarioApi {
    idTipoUsuario: string;
    tituloTipoUsuario: string;
}

export interface AdminUsuarioApi {
    idUsuario: string;
    nome: string;
    email: string;
    idTipoUsuario: string | null;
    idTipoUsuarioNavigation?: TipoUsuarioApi | null;
}

export interface UsuarioInput {
    nome: string;
    email: string;
    senha: string;
    idTipoUsuario: string | null;
}

export interface LoginApi {
    token: string;
    expires: string;
    user: LoginUsuarioApi;
}

export interface LoginUsuarioApi {
    idUsuario: string;
    nome: string;
    email: string;
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
    idTipoEvento?: string | null;
    idInstituicao?: string | null;
    idTipoEventoNavigation?: TipoEvento | null;
    idInstituicaoNavigation?: instituicao | null;
}

export interface Presenca {
    idPresenca: string;
    situacao: boolean;
    idEvento: string;
    idUsuario?: string | null;
    idEventoNavigation?: Evento | null;
}

export interface PresencaPayload {
    situacao: boolean;
    idEvento: string;
    idUsuario: string | null;
}
