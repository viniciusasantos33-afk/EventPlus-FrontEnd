import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { eventPlusApi, presencaService } from "../../services/eventPlusApi";
import type { ComentarioApi, EventoApi, Presenca } from "../../types/api";

interface EventoDetalhesState {
    id: string;
    evento: EventoApi | null;
    comentarios: ComentarioApi[];
    erro: string;
}

function isUnauthorized(error: unknown): boolean {
    if (axios.isAxiosError(error)) return error.response?.status === 401;
    return typeof error === "object" && error !== null && "status" in error && error.status === 401;
}

export function useDetalhesEvento(id: string) {
    const navigate = useNavigate();
    const { session, logout } = useAuth();
    const [resultado, setResultado] = useState<EventoDetalhesState | null>(null);
    const [presenca, setPresenca] = useState<Presenca | null>(null);
    const [carregandoPresenca, setCarregandoPresenca] = useState(false);
    const [erroPresenca, setErroPresenca] = useState("");
    const [mensagemInscricao, setMensagemInscricao] = useState("");
    const [inscrevendo, setInscrevendo] = useState(false);
    const [erroComentario, setErroComentario] = useState("");
    const [mensagemComentario, setMensagemComentario] = useState("");
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const envioEmAndamento = useRef(false);

    const carregando = resultado?.id !== id;
    const evento = resultado?.id === id ? resultado.evento : null;
    const comentarios = resultado?.id === id ? resultado.comentarios : [];
    const erro = resultado?.id === id ? resultado.erro : "";

    const redirecionarParaLogin = useCallback(() => {
        logout();
        navigate("/login", {
            replace: true,
            state: { from: { pathname: `/eventos/${id}` } },
        });
    }, [id, logout, navigate]);

    useEffect(() => {
        let ativo = true;

        Promise.all([eventPlusApi.buscarEvento(id), eventPlusApi.listarComentarios(id)])
            .then(([dadosEvento, dadosComentarios]) => {
                if (ativo)
                    setResultado({
                        id,
                        evento: dadosEvento,
                        comentarios: dadosComentarios,
                        erro: "",
                    });
            })
            .catch(() => {
                if (ativo)
                    setResultado({
                        id,
                        evento: null,
                        comentarios: [],
                        erro: "Não foi possível carregar este evento. Confira a conexão com a API e tente novamente.",
                    });
            });
        return () => {
            ativo = false;
        };
    }, [id]);

    useEffect(() => {
        let ativo = true;
        const idUsuario = session?.user.idUsuario;
        const token = session?.token;
        setPresenca(null);
        setErroPresenca("");
        if (!idUsuario || !token) {
            setCarregandoPresenca(false);
            return () => {
                ativo = false;
            };
        }

        setCarregandoPresenca(true);
        presencaService
            .listarPorUsuario(idUsuario, token)
            .then((presencas) => {
                if (!ativo) return;
                const inscricao = presencas.find(
                    (item) => item.idEvento.toLowerCase() === id.toLowerCase() && item.situacao,
                );
                setPresenca(inscricao ?? null);
            })
            .catch((error: unknown) => {
                if (!ativo) return;
                if (isUnauthorized(error)) return redirecionarParaLogin();
                setErroPresenca(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível verificar sua inscrição.",
                );
            })
            .finally(() => {
                if (ativo) setCarregandoPresenca(false);
            });
        return () => {
            ativo = false;
        };
    }, [id, session?.token, session?.user.idUsuario, redirecionarParaLogin]);

    async function enviarComentario(texto: string): Promise<void> {
        if (envioEmAndamento.current || !texto.trim()) return;
        if (!session) {
            setErroComentario("Faça login para publicar um comentário.");
            return;
        }
        envioEmAndamento.current = true;
        setEnviandoComentario(true);
        setErroComentario("");
        setMensagemComentario("");
        try {
            const comentario = await eventPlusApi.comentar(
                id,
                texto.trim(),
                session.token,
                session.user.idUsuario,
            );
            const comentarioComAutor = {
                ...comentario,
                idUsuarioNavigation: comentario.idUsuarioNavigation ?? {
                    idUsuario: session.user.idUsuario,
                    nome: session.user.nome,
                },
            };
            setResultado((atual) =>
                atual?.id === id
                    ? {
                          ...atual,
                          comentarios: [comentarioComAutor, ...atual.comentarios],
                      }
                    : atual,
            );
            setMensagemComentario("Comentário publicado!");
        } catch (error: unknown) {
            if (isUnauthorized(error)) return redirecionarParaLogin();
            setErroComentario(
                error instanceof Error ? error.message : "Não foi possível publicar o comentário.",
            );
        } finally {
            envioEmAndamento.current = false;
            setEnviandoComentario(false);
        }
    }

    async function alternarInscricao(): Promise<boolean> {
        if (!session) return false;
        setMensagemInscricao("");
        setInscrevendo(true);
        try {
            if (presenca) {
                await presencaService.excluir(presenca.idPresenca, session.token);
                setPresenca(null);
                setMensagemInscricao("Inscrição cancelada com sucesso.");
            } else {
                const novaPresenca = await presencaService.cadastrar(
                    {
                        situacao: true,
                        idEvento: id,
                        idUsuario: session.user.idUsuario,
                    },
                    session.token,
                );
                setPresenca(novaPresenca);
                setMensagemInscricao("Inscrição realizada com sucesso.");
            }
            return true;
        } catch (error: unknown) {
            if (isUnauthorized(error)) {
                redirecionarParaLogin();
                return false;
            }
            setMensagemInscricao(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar sua inscrição.",
            );
            return false;
        } finally {
            setInscrevendo(false);
        }
    }

    return {
        session,
        evento,
        comentarios,
        carregando,
        erro,
        presenca,
        carregandoPresenca,
        erroPresenca,
        mensagemInscricao,
        setMensagemInscricao,
        inscrevendo,
        mensagemComentario,
        setMensagemComentario,
        erroComentario,
        setErroComentario,
        enviandoComentario,
        enviarComentario,
        alternarInscricao,
    };
}
