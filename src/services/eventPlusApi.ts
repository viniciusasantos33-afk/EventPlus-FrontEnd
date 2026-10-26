import axios from "axios";
import type {
    ComentarioApi,
    AtualizarEventoInput,
    AdminUsuarioApi,
    CriarEventoInput,
    EventoApi,
    InstituicaoInput,
    InstituicaoListaApi,
    LoginApi,
    Presenca,
    PresencaPayload,
    TipoUsuarioApi,
    TipoEventoListaApi,
    UsuarioInput,
} from "../types/api";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

// Instância compartilhada para os endpoints que usam Axios.
export const axiosInstance = axios.create({ baseURL: apiBaseUrl });

class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

async function getErrorMessage(response: Response): Promise<string> {
    const responseText = await response.text();

    if (!responseText) {
        return `A API respondeu com erro ${response.status}.`;
    }

    try {
        const body: unknown = JSON.parse(responseText);

        if (typeof body !== "object" || body === null) {
            return `A API respondeu com erro ${response.status}.`;
        }

        const problem = body as {
            detail?: unknown;
            title?: unknown;
            message?: unknown;
            errors?: Record<string, unknown>;
        };

        const validationMessages = Object.values(problem.errors ?? {})
            .flatMap((messages) => (Array.isArray(messages) ? messages : [messages]))
            .filter((message): message is string => typeof message === "string");

        if (validationMessages.length > 0) {
            return validationMessages.join(" ");
        }

        for (const message of [problem.detail, problem.message, problem.title]) {
            if (typeof message === "string" && message.trim()) {
                return message;
            }
        }
    } catch {
        // Se a API não responder JSON, não exibimos HTML ou conteúdo técnico bruto.
    }

    return `A API respondeu com erro ${response.status}.`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        headers: {
            ...(init?.body && !(init.body instanceof FormData)
                ? { "Content-Type": "application/json" }
                : {}),
            ...init?.headers,
        },
    });

    if (!response.ok) {
        throw new ApiError(await getErrorMessage(response), response.status);
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
}

export const eventPlusApi = {
    entrar: async (email: string, senha: string) => {
        try {
            return await request<LoginApi>("/Login", {
                method: "POST",
                body: JSON.stringify({ email, senha }),
            });
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                throw new Error("E-mail ou senha incorretos.");
            }

            throw error;
        }
    },
    listarEventos: () => request<EventoApi[]>("/Evento"),
    buscarEvento: (id: string) => request<EventoApi>(`/Evento/${encodeURIComponent(id)}`),
    listarTiposEvento: () => request<TipoEventoListaApi[]>("/TipoEvento"),
    cadastrarTipoEvento: (titulo: string, token: string) =>
        request<TipoEventoListaApi>("/TipoEvento", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ titulo }),
        }),
    atualizarTipoEvento: (id: string, titulo: string, token: string) =>
        request<void>(`/TipoEvento/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ titulo }),
        }),
    excluirTipoEvento: (id: string, token: string) =>
        request<void>(`/TipoEvento/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }),
    listarInstituicoes: () => request<InstituicaoListaApi[]>("/Instituicao"),
    cadastrarInstituicao: (instituicao: InstituicaoInput, token: string) =>
        request<InstituicaoListaApi>("/Instituicao", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(instituicao),
        }),
    atualizarInstituicao: (id: string, instituicao: InstituicaoInput, token: string) =>
        request<void>(`/Instituicao/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(instituicao),
        }),
    excluirInstituicao: (id: string, token: string) =>
        request<void>(`/Instituicao/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }),
    listarUsuarios: (token: string) =>
        request<AdminUsuarioApi[]>("/Usuario", {
            headers: { Authorization: `Bearer ${token}` },
        }),
    listarTiposUsuario: () => request<TipoUsuarioApi[]>("/TipoUsuario"),
    cadastrarTipoUsuario: (titulo: string, token: string) =>
        request<TipoUsuarioApi>("/TipoUsuario", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ titulo }),
        }),
    atualizarTipoUsuario: (id: string, titulo: string, token: string) =>
        request<void>(`/TipoUsuario/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ titulo }),
        }),
    excluirTipoUsuario: (id: string, token: string) =>
        request<void>(`/TipoUsuario/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }),
    cadastrarUsuario: (usuario: UsuarioInput, token: string) =>
        request<AdminUsuarioApi>("/Usuario", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(usuario),
        }),
    atualizarUsuario: (id: string, usuario: UsuarioInput, token: string) =>
        request<void>(`/Usuario/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(usuario),
        }),
    excluirUsuario: (id: string, token: string) =>
        request<void>(`/Usuario/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }),
    criarEvento: (evento: CriarEventoInput, token: string) => {
        const formData = new FormData();
        formData.append("NomeEvento", evento.nomeEvento);
        formData.append("DataEvento", evento.dataEvento);
        formData.append("Descricao", evento.descricao);
        formData.append("IdTipoEvento", evento.idTipoEvento);
        formData.append("IdInstituicao", evento.idInstituicao);
        if (evento.imagem) formData.append("Imagem", evento.imagem);

        return request<EventoApi>("/Evento", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
    },
    atualizarEvento: (id: string, evento: AtualizarEventoInput, token: string) =>
        request<void>(`/Evento/${encodeURIComponent(id)}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(evento),
        }),
    excluirEvento: (id: string, token: string) =>
        request<void>(`/Evento/${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }),
    listarComentarios: async (id: string) => {
        try {
            return await request<ComentarioApi[]>(`/Comentario/Evento/${encodeURIComponent(id)}`);
        } catch (error) {
            // A API retorna 404 quando ainda não existem comentários públicos.
            if (error instanceof ApiError && error.status === 404) return [];
            throw error;
        }
    },
    comentar: (idEvento: string, descricao: string, token: string, idUsuario?: string) =>
        request<ComentarioApi>("/Comentario", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({ idEvento, descricao, idUsuario }),
        }),
};

export const presencaService = {
    async listarPorUsuario(idUsuario: string, token: string): Promise<Presenca[]> {
        const { data } = await axiosInstance.get<Presenca[]>(
            `/Presenca/Minhas/${encodeURIComponent(idUsuario)}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        return data;
    },

    async cadastrar(payload: PresencaPayload, token: string): Promise<Presenca> {
        const { data } = await axiosInstance.post<Presenca>("/Presenca", payload, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return data;
    },

    async excluir(id: string, token: string): Promise<void> {
        await axiosInstance.delete(`/Presenca/${encodeURIComponent(id)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
};
