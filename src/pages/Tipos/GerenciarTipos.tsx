import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";

import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import Input from "../../components/Input";
import TabelaAdministracao, {
    AcaoTabelaAdministracao,
    type ColunaTabelaAdministracao,
} from "../../components/TabelaAdministracao";
import { useAuth } from "../../contexts/AuthContext";
import { eventPlusApi } from "../../services/eventPlusApi";
import ilustracao from "../../assets/visao-img.png";
import "./GerenciarTipos.css";

interface ItemTipo {
    id: string;
    titulo: string;
}

interface GerenciarTiposProps {
    categoria: "evento" | "usuario";
    embedded?: boolean;
}

interface ConfiguracaoTipo {
    titulo: string;
    tituloLista: string;
    mensagemCriacao: string;
    campoNome: string;
    listar(token: string): Promise<ItemTipo[]>;
    criar(titulo: string, token: string): Promise<unknown>;
    atualizar(id: string, titulo: string, token: string): Promise<void>;
    excluir(id: string, token: string): Promise<void>;
}

const colunasTipos: ColunaTabelaAdministracao[] = [
    { id: "titulo", titulo: "Título" },
    { id: "editar", titulo: "Editar", acao: true },
    { id: "excluir", titulo: "Excluir", acao: true },
];

function obterConfiguracao(categoria: "evento" | "usuario"): ConfiguracaoTipo {
    if (categoria === "evento") {
        return {
            titulo: "tipo de evento",
            tituloLista: "Tipos de evento cadastrados",
            mensagemCriacao: "Tipo de evento cadastrado.",
            campoNome: "tituloTipoEvento",
            listar: async () =>
                (await eventPlusApi.listarTiposEvento()).map((tipo) => ({
                    id: tipo.idTipoEvento,
                    titulo: tipo.tituloTipoEvento,
                })),
            criar: eventPlusApi.cadastrarTipoEvento,
            atualizar: eventPlusApi.atualizarTipoEvento,
            excluir: eventPlusApi.excluirTipoEvento,
        };
    }

    return {
        titulo: "tipo de usuário",
        tituloLista: "Tipos de usuário cadastrados",
        mensagemCriacao: "Tipo de usuário cadastrado.",
        campoNome: "tituloTipoUsuario",
        listar: async () =>
            (await eventPlusApi.listarTiposUsuario()).map((tipo) => ({
                id: tipo.idTipoUsuario,
                titulo: tipo.tituloTipoUsuario,
            })),
        criar: eventPlusApi.cadastrarTipoUsuario,
        atualizar: eventPlusApi.atualizarTipoUsuario,
        excluir: eventPlusApi.excluirTipoUsuario,
    };
}

function GerenciarTipos({ categoria, embedded = false }: GerenciarTiposProps) {
    const { session, isAdmin, checkingRole } = useAuth();
    const [itens, setItens] = useState<ItemTipo[]>([]);
    const [titulo, setTitulo] = useState("");
    const [idEditando, setIdEditando] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");
    const configuracao = useMemo(() => obterConfiguracao(categoria), [categoria]);

    useEffect(() => {
        if (!session || checkingRole || !isAdmin) return;

        let ativo = true;
        configuracao
            .listar(session.token)
            .then((lista) => {
                if (ativo) setItens(lista);
            })
            .catch((error: unknown) => {
                if (ativo)
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar os cadastros.",
                    );
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });

        return () => {
            ativo = false;
        };
    }, [categoria, checkingRole, configuracao, isAdmin, session]);

    if (!session) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: { pathname: window.location.pathname } }}
            />
        );
    }

    if (checkingRole) {
        return (
            <div className={embedded ? "gerenciar-tipos-embedded" : "gerenciar-tipos-pagina"}>
                {!embedded && <Header />}
                <main className="gerenciar-tipos-carregando" role="status">
                    Verificando permissões…
                </main>
                {!embedded && <Footer />}
            </div>
        );
    }

    if (!isAdmin) return <Navigate to="/home" replace />;
    const token = session.token;

    function iniciarEdicao(item: ItemTipo) {
        setIdEditando(item.id);
        setTitulo(item.titulo);
        setErro("");
        setMensagem("");
    }

    function cancelarEdicao() {
        setIdEditando(null);
        setTitulo("");
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const tituloLimpo = titulo.trim();
        if (!tituloLimpo) return;

        setErro("");
        setMensagem("");
        setSalvando(true);

        try {
            if (idEditando) {
                await configuracao.atualizar(idEditando, tituloLimpo, token);
                setItens((atuais) =>
                    atuais.map((item) =>
                        item.id === idEditando ? { ...item, titulo: tituloLimpo } : item,
                    ),
                );
                setMensagem("Alterações salvas.");
            } else {
                await configuracao.criar(tituloLimpo, token);
                setItens(await configuracao.listar(token));
                setMensagem(configuracao.mensagemCriacao);
            }

            cancelarEdicao();
        } catch (error) {
            setErro(
                error instanceof Error ? error.message : "Não foi possível salvar este cadastro.",
            );
        } finally {
            setSalvando(false);
        }
    }

    async function excluir(item: ItemTipo) {
        if (!window.confirm(`Deseja excluir o ${configuracao.titulo} “${item.titulo}”?`)) return;

        setErro("");
        setMensagem("");
        try {
            await configuracao.excluir(item.id, token);
            setItens((atuais) => atuais.filter((atual) => atual.id !== item.id));
            setMensagem("Cadastro excluído.");
            if (idEditando === item.id) cancelarEdicao();
        } catch (error) {
            setErro(
                error instanceof Error ? error.message : "Não foi possível excluir este cadastro.",
            );
        }
    }

    return (
        <div className={embedded ? "gerenciar-tipos-embedded" : "gerenciar-tipos-pagina"}>
            {!embedded && <Header />}

            <main>
                <section className="gerenciar-tipos-topo">
                    <h1 className="gerenciar-tipos-titulo">
                        Administração de {configuracao.titulo}s
                    </h1>

                    <div className="gerenciar-tipos-form-area">
                        <img src={ilustracao} alt="Ilustração de pessoas organizando informações" />

                        <form className="gerenciar-tipos-formulario" onSubmit={salvar}>
                            <label htmlFor="titulo-tipo">Título</label>
                            <Input
                                id="titulo-tipo"
                                name={configuracao.campoNome}
                                value={titulo}
                                onChange={(event) => setTitulo(event.target.value)}
                                placeholder={`Nome do ${configuracao.titulo}`}
                                maxLength={100}
                                required
                            />

                            {erro && (
                                <p className="gerenciar-tipos-erro" role="alert">
                                    {erro}
                                </p>
                            )}
                            {mensagem && (
                                <p className="gerenciar-tipos-mensagem" role="status">
                                    {mensagem}
                                </p>
                            )}

                            <div className="gerenciar-tipos-botoes-formulario">
                                <button type="submit" disabled={salvando || !titulo.trim()}>
                                    {salvando
                                        ? "Salvando…"
                                        : idEditando
                                          ? "Salvar alterações"
                                          : "Cadastrar"}
                                </button>
                                {idEditando && (
                                    <button
                                        className="gerenciar-tipos-cancelar"
                                        type="button"
                                        onClick={cancelarEdicao}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </section>

                <section
                    className="gerenciar-tipos-lista"
                    aria-labelledby="gerenciar-tipos-lista-titulo"
                >
                    <h2 id="gerenciar-tipos-lista-titulo">{configuracao.tituloLista}</h2>

                    {carregando ? (
                        <p className="gerenciar-tipos-status" role="status">
                            Carregando cadastros…
                        </p>
                    ) : itens.length === 0 ? (
                        <p className="gerenciar-tipos-status">Nenhum cadastro disponível.</p>
                    ) : (
                        <TabelaAdministracao
                            colunas={colunasTipos}
                            linhas={itens.map((item) => ({
                                id: item.id,
                                celulas: [
                                    item.titulo,
                                    <AcaoTabelaAdministracao
                                        acao="edit"
                                        rotulo={`Editar ${item.titulo}`}
                                        aoAcionar={() => iniciarEdicao(item)}
                                    />,
                                    <AcaoTabelaAdministracao
                                        acao="delete"
                                        rotulo={`Excluir ${item.titulo}`}
                                        aoAcionar={() => void excluir(item)}
                                    />,
                                ],
                            }))}
                        />
                    )}
                </section>
            </main>

            {!embedded && <Footer />}
        </div>
    );
}

export default GerenciarTipos;
