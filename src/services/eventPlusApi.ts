export type EventoApi = {
  idEvento: string;
  nomeEvento: string;
  dataEvento: string;
  descricao: string;
  imagemUrl: string | null;
  idTipoEventoNavigation?: { tituloTipoEvento?: string } | null;
  idInstituicaoNavigation?: { nomeFantasia?: string; endereco?: string } | null;
};

export type ComentarioApi = {
  idComentario: string;
  dataComentario: string;
  descricao: string;
  exibe: boolean;
  idUsuarioNavigation?: { nome?: string } | null;
};

export type LoginApi = { token: string; expires: string; user: { idUsuario: string; nome: string; email: string } };

const apiBaseUrl = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(message || `A API respondeu com erro ${response.status}.`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const eventPlusApi = {
  entrar: (email: string, senha: string) =>
    request<LoginApi>("/Login", { method: "POST", body: JSON.stringify({ email, senha }) }),
  listarEventos: () => request<EventoApi[]>("/Evento"),
  buscarEvento: (id: string) => request<EventoApi>(`/Evento/${encodeURIComponent(id)}`),
  listarComentarios: async (id: string) => {
    try {
      return await request<ComentarioApi[]>(`/Comentario/Evento/${encodeURIComponent(id)}`);
    } catch (error) {
      // A API retorna 404 quando ainda não existem comentários públicos.
      if (error instanceof ApiError && error.status === 404) return [];
      throw error;
    }
  },
  comentar: (idEvento: string, descricao: string, token: string) =>
    request<ComentarioApi>("/Comentario", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ idEvento, descricao }),
    }),
  inscrever: (idEvento: string, idUsuario: string, token: string) =>
    request<unknown>("/Presenca", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ idEvento, idUsuario, situacao: true }),
    }),
};
