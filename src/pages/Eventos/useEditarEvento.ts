import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { eventPlusApi } from "../../services/eventPlusApi";
import type { EventoApi, InstituicaoListaApi, TipoEventoListaApi } from "../../types/api";

export function useEditarEvento(id: string, token: string) {
    const navigate = useNavigate();
    const [evento, setEvento] = useState<EventoApi | null>(null);
    const [tipos, setTipos] = useState<TipoEventoListaApi[]>([]);
    const [instituicoes, setInstituicoes] = useState<InstituicaoListaApi[]>([]);
    const [nomeEvento, setNomeEvento] = useState("");
    const [dataEvento, setDataEvento] = useState("");
    const [descricao, setDescricao] = useState("");
    const [idTipoEvento, setIdTipoEvento] = useState("");
    const [idInstituicao, setIdInstituicao] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        Promise.all([
            eventPlusApi.buscarEvento(id),
            eventPlusApi.listarTiposEvento(),
            eventPlusApi.listarInstituicoes(),
        ])
            .then(([dadosEvento, tiposDisponiveis, instituicoesDisponiveis]) => {
                if (!ativo) return;
                setEvento(dadosEvento);
                setTipos(tiposDisponiveis);
                setInstituicoes(instituicoesDisponiveis);
                setNomeEvento(dadosEvento.nomeEvento);
                setDataEvento(new Date(dadosEvento.dataEvento).toISOString().slice(0, 16));
                setDescricao(dadosEvento.descricao);
                setIdTipoEvento(dadosEvento.idTipoEvento ?? "");
                setIdInstituicao(dadosEvento.idInstituicao ?? "");
            })
            .catch((error: unknown) => {
                if (ativo)
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar o evento.",
                    );
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });
        return () => {
            ativo = false;
        };
    }, [id]);

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!idTipoEvento) {
            setErro("Selecione o tipo de evento.");
            return;
        }
        setErro("");
        setSalvando(true);
        try {
            await eventPlusApi.atualizarEvento(
                id,
                {
                    nomeEvento: nomeEvento.trim(),
                    dataEvento: new Date(dataEvento).toISOString(),
                    descricao: descricao.trim(),
                    imagemUrl: evento?.imagemUrl ?? null,
                    idTipoEvento,
                    idInstituicao,
                },
                token,
            );
            navigate(`/eventos/${id}`, { replace: true });
        } catch (error) {
            setErro(
                error instanceof Error ? error.message : "Não foi possível salvar as alterações.",
            );
        } finally {
            setSalvando(false);
        }
    }

    async function remover() {
        setErro("");
        setExcluindo(true);
        try {
            await eventPlusApi.excluirEvento(id, token);
            navigate("/eventos", { replace: true });
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível remover o evento.");
        } finally {
            setExcluindo(false);
        }
    }

    return {
        evento,
        tipos,
        instituicoes,
        nomeEvento,
        setNomeEvento,
        dataEvento,
        setDataEvento,
        descricao,
        setDescricao,
        idTipoEvento,
        setIdTipoEvento,
        idInstituicao,
        setIdInstituicao,
        carregando,
        salvando,
        excluindo,
        erro,
        salvar,
        remover,
    };
}
