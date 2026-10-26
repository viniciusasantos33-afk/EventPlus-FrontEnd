import { Link, Navigate, useParams } from "react-router-dom";

import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import Input from "../../components/Input";
import bannerPadrao from "../../assets/banner-3.png";
import { useAuth } from "../../contexts/AuthContext";
import { isOwnedEvent } from "../../services/eventOwnership";
import { useEditarEvento } from "./useEditarEvento";
import "./CriarEvento.css";

function EditarEvento() {
    const { id = "" } = useParams();
    const { session, isAdmin, checkingRole } = useAuth();
    const dadosEvento = useEditarEvento(id, session?.token ?? "");
    const {
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
    } = dadosEvento;

    if (!session)
        return (
            <Navigate to="/login" replace state={{ from: { pathname: `/eventos/${id}/editar` } }} />
        );

    if (checkingRole)
        return (
            <>
                <Header />
                <main className="criar-evento-pagina">
                    <p role="status">Verificando permissões…</p>
                </main>
                <Footer />
            </>
        );

    if (!isAdmin && !isOwnedEvent(session.user.idUsuario, id)) {
        return <Navigate to="/eventos" replace />;
    }

    async function removerEvento() {
        if (
            !isAdmin ||
            !window.confirm(
                "Tem certeza que deseja remover este evento? Esta ação não pode ser desfeita.",
            )
        )
            return;
        await remover();
    }

    return (
        <>
            <Header />

            <main className="criar-evento-pagina editar-evento-pagina">
                <Link className="editar-evento-voltar" to={`/eventos/${id}`}>
                    ← Voltar ao evento
                </Link>

                <h1 className="criar-evento-titulo">Editar evento</h1>

                {carregando ? (
                    <p>Carregando evento…</p>
                ) : erro && !evento ? (
                    <p className="criar-evento-erro" role="alert">
                        {erro}
                    </p>
                ) : (
                    <section className="editar-evento-grade">
                        <div className="editar-evento-resumo">
                            <img src={evento?.imagemUrl || bannerPadrao} alt="" />
                            <h2>{nomeEvento || "Nome do evento"}</h2>
                            <p>{descricao || "A descrição do evento aparecerá aqui."}</p>
                            <dl>
                                <dt>Data e horário</dt>
                                <dd>
                                    {dataEvento
                                        ? new Intl.DateTimeFormat("pt-BR", {
                                              dateStyle: "long",
                                              timeStyle: "short",
                                          }).format(new Date(dataEvento))
                                        : "A definir"}
                                </dd>
                            </dl>
                        </div>

                        <form
                            className="criar-evento-formulario editar-evento-formulario"
                            onSubmit={salvar}
                        >
                            <label>
                                Nome
                                <Input
                                    name="nomeEvento"
                                    value={nomeEvento}
                                    onChange={(e) => setNomeEvento(e.target.value)}
                                    maxLength={100}
                                    required
                                />
                            </label>
                            <label>
                                Data e horário
                                <Input
                                    name="dataEvento"
                                    type="datetime-local"
                                    value={dataEvento}
                                    onChange={(e) => setDataEvento(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Descrição
                                <textarea
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    rows={5}
                                    required
                                />
                            </label>

                            <div className="criar-evento-linha">
                                <label>
                                    Tipo de evento
                                    <select
                                        value={idTipoEvento}
                                        onChange={(e) => setIdTipoEvento(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {tipos.map((tipo) => (
                                            <option
                                                key={tipo.idTipoEvento}
                                                value={tipo.idTipoEvento}
                                            >
                                                {tipo.tituloTipoEvento}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Instituição
                                    <select
                                        value={idInstituicao}
                                        onChange={(e) => setIdInstituicao(e.target.value)}
                                        required
                                    >
                                        <option value="">Selecione</option>
                                        {instituicoes.map((instituicao) => (
                                            <option
                                                key={instituicao.idInstituicao}
                                                value={instituicao.idInstituicao}
                                            >
                                                {instituicao.nomeFantasia}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            {erro && (
                                <p className="criar-evento-erro" role="alert">
                                    {erro}
                                </p>
                            )}
                            <div className="editar-evento-acoes">
                                <button
                                    type="submit"
                                    disabled={
                                        salvando ||
                                        excluindo ||
                                        !tipos.length ||
                                        !instituicoes.length
                                    }
                                >
                                    {salvando ? "Salvando…" : "Salvar alterações"}
                                </button>
                                {isAdmin && (
                                    <button
                                        className="editar-evento-remover"
                                        type="button"
                                        onClick={() => void removerEvento()}
                                        disabled={salvando || excluindo}
                                    >
                                        {excluindo ? "Removendo…" : "Remover evento"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>
                )}
            </main>
            <Footer />
        </>
    );
}

export default EditarEvento;
