import { useEffect, useState, type FormEvent } from "react";

import ilustracao from "../../assets/visao-img.png";
import Input from "../../components/Input";
import TabelaAdministracao, {
    AcaoTabelaAdministracao,
    type ColunaTabelaAdministracao,
} from "../../components/TabelaAdministracao";
import { useAuth } from "../../contexts/AuthContext";
import { eventPlusApi } from "../../services/eventPlusApi";
import type { InstituicaoInput, InstituicaoListaApi } from "../../types/api";

const formularioVazio: InstituicaoInput = {
    cnpj: "",
    nomeFantasia: "",
    endereco: "",
};

const colunasInstituicoes: ColunaTabelaAdministracao[] = [
    { id: "nome", titulo: "Nome fantasia" },
    { id: "cnpj", titulo: "CNPJ" },
    { id: "endereco", titulo: "Endereço" },
    { id: "editar", titulo: "Editar", acao: true },
    { id: "excluir", titulo: "Excluir", acao: true },
];

function AdministracaoInstituicoes() {
    const { session } = useAuth();
    const [instituicoes, setInstituicoes] = useState<InstituicaoListaApi[]>([]);
    const [formulario, setFormulario] = useState<InstituicaoInput>(formularioVazio);
    const [instituicaoEditando, setInstituicaoEditando] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        let ativo = true;

        eventPlusApi
            .listarInstituicoes()
            .then((lista) => {
                if (ativo) setInstituicoes(lista);
            })
            .catch((error: unknown) => {
                if (ativo) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar as instituições.",
                    );
                }
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });

        return () => {
            ativo = false;
        };
    }, []);

    function atualizarCampo(campo: keyof InstituicaoInput, valor: string) {
        setFormulario((atual) => ({ ...atual, [campo]: valor }));
    }

    function iniciarEdicao(instituicao: InstituicaoListaApi) {
        setInstituicaoEditando(instituicao.idInstituicao);
        setFormulario({
            cnpj: instituicao.cnpj,
            nomeFantasia: instituicao.nomeFantasia,
            endereco: instituicao.endereco,
        });
        setErro("");
        setMensagem("");
    }

    function cancelarEdicao() {
        setInstituicaoEditando(null);
        setFormulario(formularioVazio);
        setErro("");
        setMensagem("");
    }

    async function salvar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!session) return;

        setSalvando(true);
        setErro("");
        setMensagem("");

        try {
            if (instituicaoEditando) {
                await eventPlusApi.atualizarInstituicao(
                    instituicaoEditando,
                    formulario,
                    session.token,
                );
                setInstituicoes((atuais) =>
                    atuais.map((instituicao) =>
                        instituicao.idInstituicao === instituicaoEditando
                            ? { ...instituicao, ...formulario }
                            : instituicao,
                    ),
                );
                setMensagem("Instituição atualizada com sucesso.");
            } else {
                const novaInstituicao = await eventPlusApi.cadastrarInstituicao(
                    formulario,
                    session.token,
                );
                setInstituicoes((atuais) => [...atuais, novaInstituicao]);
                setMensagem("Instituição cadastrada com sucesso.");
            }

            setInstituicaoEditando(null);
            setFormulario(formularioVazio);
        } catch (error) {
            setErro(
                error instanceof Error ? error.message : "Não foi possível salvar a instituição.",
            );
        } finally {
            setSalvando(false);
        }
    }

    async function excluir(instituicao: InstituicaoListaApi) {
        if (!session) return;
        const confirmado = window.confirm(
            `Deseja excluir a instituição “${instituicao.nomeFantasia}”?`,
        );
        if (!confirmado) return;

        setErro("");
        setMensagem("");
        try {
            await eventPlusApi.excluirInstituicao(instituicao.idInstituicao, session.token);
            setInstituicoes((atuais) =>
                atuais.filter((item) => item.idInstituicao !== instituicao.idInstituicao),
            );
            if (instituicaoEditando === instituicao.idInstituicao) cancelarEdicao();
            setMensagem("Instituição excluída com sucesso.");
        } catch (error) {
            setErro(
                error instanceof Error ? error.message : "Não foi possível excluir a instituição.",
            );
        }
    }

    return (
        <div className="admin-instituicoes-embedded">
            <section className="admin-instituicoes-topo">
                <div className="admin-instituicoes-form-area">
                    <img src={ilustracao} alt="Ilustração de gerenciamento" />
                    <form
                        className="admin-instituicoes-formulario gerenciar-tipos-formulario"
                        onSubmit={salvar}
                    >
                        <Input
                            aria-label="CNPJ"
                            value={formulario.cnpj}
                            onChange={(event) => atualizarCampo("cnpj", event.target.value)}
                            inputMode="numeric"
                            maxLength={14}
                            placeholder="CNPJ"
                            required
                        />

                        <Input
                            aria-label="Nome fantasia"
                            value={formulario.nomeFantasia}
                            onChange={(event) => atualizarCampo("nomeFantasia", event.target.value)}
                            maxLength={100}
                            placeholder="Nome fantasia"
                            required
                        />

                        <Input
                            aria-label="Endereço"
                            value={formulario.endereco}
                            onChange={(event) => atualizarCampo("endereco", event.target.value)}
                            maxLength={100}
                            placeholder="Endereço"
                            required
                        />

                        {erro && (
                            <p className="admin-instituicoes-erro" role="alert">
                                {erro}
                            </p>
                        )}
                        {mensagem && (
                            <p className="admin-instituicoes-mensagem" role="status">
                                {mensagem}
                            </p>
                        )}

                        <div className="admin-instituicoes-acoes">
                            <button type="submit" disabled={salvando}>
                                {salvando
                                    ? "Salvando…"
                                    : instituicaoEditando
                                      ? "Salvar alterações"
                                      : "Cadastrar"}
                            </button>
                            {instituicaoEditando && (
                                <button
                                    className="admin-instituicoes-cancelar"
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

            <section className="admin-instituicoes-lista" aria-labelledby="lista-instituicoes">
                <h2 id="lista-instituicoes">Instituições cadastradas</h2>
                {carregando ? (
                    <p className="admin-instituicoes-status" role="status">
                        Carregando instituições…
                    </p>
                ) : erro && instituicoes.length === 0 ? (
                    <p className="admin-instituicoes-status" role="alert">
                        {erro}
                    </p>
                ) : instituicoes.length === 0 ? (
                    <p className="admin-instituicoes-status">Nenhuma instituição cadastrada.</p>
                ) : (
                    <TabelaAdministracao
                        colunas={colunasInstituicoes}
                        linhas={instituicoes.map((instituicao) => ({
                            id: instituicao.idInstituicao,
                            celulas: [
                                instituicao.nomeFantasia,
                                instituicao.cnpj,
                                instituicao.endereco,
                                <AcaoTabelaAdministracao
                                    acao="edit"
                                    rotulo={`Editar ${instituicao.nomeFantasia}`}
                                    aoAcionar={() => iniciarEdicao(instituicao)}
                                />,
                                <AcaoTabelaAdministracao
                                    acao="delete"
                                    rotulo={`Excluir ${instituicao.nomeFantasia}`}
                                    aoAcionar={() => void excluir(instituicao)}
                                />,
                            ],
                        }))}
                    />
                )}
            </section>
        </div>
    );
}

export default AdministracaoInstituicoes;
