import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { eventPlusApi } from "../../services/eventPlusApi";
import { registerOwnedEvent } from "../../services/eventOwnership";
import type { EventoApi, InstituicaoListaApi, TipoEventoListaApi } from "../../types/api";

export function useCriarEvento(token: string, userId: string) {
    const navigate = useNavigate();
    const [tipos, setTipos] = useState<TipoEventoListaApi[]>([]);
    const [instituicoes, setInstituicoes] = useState<InstituicaoListaApi[]>([]);
    const [eventos, setEventos] = useState<EventoApi[]>([]);
    const [carregandoOpcoes, setCarregandoOpcoes] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        Promise.all([
            eventPlusApi.listarTiposEvento(),
            eventPlusApi.listarInstituicoes(),
            eventPlusApi.listarEventos(),
        ])
            .then(([tiposEvento, instituicoesDisponiveis, eventosDisponiveis]) => {
                if (!ativo) return;
                setTipos(tiposEvento);
                setInstituicoes(instituicoesDisponiveis);
                setEventos(eventosDisponiveis);
            })
            .catch((error: unknown) => {
                if (ativo)
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar os dados do formulário.",
                    );
            })
            .finally(() => {
                if (ativo) setCarregandoOpcoes(false);
            });
        return () => {
            ativo = false;
        };
    }, []);

    async function criarEvento(
        event: FormEvent<HTMLFormElement>,
        dados: {
            nomeEvento: string;
            dataEvento: string;
            descricao: string;
            idTipoEvento: string;
            idInstituicao: string;
            imagem: File | null;
        },
    ) {
        event.preventDefault();
        if (!dados.idTipoEvento) {
            setErro("Selecione o tipo de evento.");
            return;
        }
        setErro("");
        setEnviando(true);
        try {
            const criado = await eventPlusApi.criarEvento(
                {
                    ...dados,
                    nomeEvento: dados.nomeEvento.trim(),
                    dataEvento: new Date(dados.dataEvento).toISOString(),
                    descricao: dados.descricao.trim(),
                },
                token,
            );
            setEventos((atuais) => [criado, ...atuais]);
            registerOwnedEvent(userId, criado.idEvento);
            navigate("/eventos/criar", { replace: true });
            return true;
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível criar o evento.");
            return false;
        } finally {
            setEnviando(false);
        }
    }

    return {
        tipos,
        instituicoes,
        eventos,
        carregandoOpcoes,
        enviando,
        erro,
        setErro,
        criarEvento,
    };
}
