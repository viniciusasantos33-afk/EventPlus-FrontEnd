import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import CardEvento from "../../components/cardEvento/CardEvento";
import Input from "../../components/Input";
import { useAuth } from "../../contexts/AuthContext";
import { isOwnedEvent } from "../../services/eventOwnership";
import { useCriarEvento } from "./useCriarEvento";
import ilustracaoEvento from "../../assets/visao-img.png";
import "./CriarEvento.css";

function CriarEvento() {
    const navigate = useNavigate();
    const { session, isAdmin } = useAuth();
    const [nomeEvento, setNomeEvento] = useState("");
    const [dataEvento, setDataEvento] = useState("");
    const [descricao, setDescricao] = useState("");
    const [idTipoEvento, setIdTipoEvento] = useState("");
    const [idInstituicao, setIdInstituicao] = useState("");
    const [imagem, setImagem] = useState<File | null>(null);
    const { tipos, instituicoes, eventos, carregandoOpcoes, enviando, erro, criarEvento } =
        useCriarEvento(session?.token ?? "", session?.user.idUsuario ?? "");

    if (!session) {
        return <Navigate to="/login" replace state={{ from: { pathname: "/eventos/criar" } }} />;
    }

    async function salvarEvento(event: FormEvent<HTMLFormElement>) {
        if (
            await criarEvento(event, {
                nomeEvento,
                dataEvento,
                descricao,
                idTipoEvento,
                idInstituicao,
                imagem,
            })
        ) {
            setNomeEvento("");
            setDataEvento("");
            setDescricao("");
            setIdTipoEvento("");
            setIdInstituicao("");
            setImagem(null);
        }
    }

    return (
        <>
            <Header />
            <main className="criar-evento-pagina">
                <h1 className="criar-evento-titulo">Administração Evento</h1>

                <section className="criar-evento-painel" aria-label="Cadastro de evento">
                    <div className="criar-evento-ilustracao">
                        <img src={ilustracaoEvento} alt="Pessoas reunidas em um evento" />
                    </div>
                    {carregandoOpcoes ? (
                        <p>Carregando categorias e instituições…</p>
                    ) : (
                        <form className="criar-evento-formulario" onSubmit={salvarEvento}>
                            <div className="criar-evento-linha criar-evento-nome-data">
                                <label>
                                    <span className="visualmente-oculto">Nome do evento</span>
                                    <Input
                                        name="nomeEvento"
                                        placeholder="Nome"
                                        value={nomeEvento}
                                        onChange={(event) => setNomeEvento(event.target.value)}
                                        maxLength={100}
                                        required
                                    />
                                </label>

                                <label>
                                    <span className="visualmente-oculto">Data e horário</span>
                                    <Input
                                        name="dataEvento"
                                        aria-label="Data e horário"
                                        type="datetime-local"
                                        value={dataEvento}
                                        onChange={(event) => setDataEvento(event.target.value)}
                                        required
                                    />
                                </label>
                            </div>

                            <label>
                                <span className="visualmente-oculto">Descrição</span>
                                <textarea
                                    placeholder="Descrição"
                                    value={descricao}
                                    onChange={(event) => setDescricao(event.target.value)}
                                    rows={2}
                                    required
                                />
                            </label>

                            <div className="criar-evento-linha">
                                <label>
                                    <span className="visualmente-oculto">Tipo de evento</span>
                                    <select
                                        aria-label="Tipo de evento"
                                        value={idTipoEvento}
                                        onChange={(event) => setIdTipoEvento(event.target.value)}
                                        required
                                    >
                                        <option value="">Tipo de Evento</option>
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
                                    <span className="visualmente-oculto">Instituição</span>
                                    <select
                                        aria-label="Instituição"
                                        value={idInstituicao}
                                        onChange={(event) => setIdInstituicao(event.target.value)}
                                        required
                                    >
                                        <option value="">Instituição</option>
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

                            <label className="criar-evento-arquivo">
                                <span>Foto</span>
                                <Input
                                    name="imagem"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => setImagem(event.target.files?.[0] ?? null)}
                                />
                            </label>

                            {tipos.length === 0 && (
                                <span className="criar-evento-ajuda">
                                    Cadastre um tipo de evento antes de continuar.
                                </span>
                            )}
                            {instituicoes.length === 0 && (
                                <span className="criar-evento-ajuda">
                                    Cadastre uma instituição antes de continuar.
                                </span>
                            )}
                            {erro && (
                                <p className="criar-evento-erro" role="alert">
                                    {erro}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    enviando || tipos.length === 0 || instituicoes.length === 0
                                }
                            >
                                {enviando ? "Cadastrando…" : "Cadastrar"}
                            </button>
                        </form>
                    )}
                </section>

                <section
                    className="criar-evento-listagem"
                    aria-labelledby="criar-evento-lista-titulo"
                >
                    <h2 id="criar-evento-lista-titulo">Eventos</h2>

                    {eventos.length === 0 ? (
                        <p>Nenhum evento cadastrado ainda.</p>
                    ) : (
                        <div className="criar-evento-cards">
                            {eventos.map((evento) => (
                                <CardEvento
                                    key={evento.idEvento}
                                    id={evento.idEvento}
                                    imagem={evento.imagemUrl || undefined}
                                    categoria={evento.idTipoEventoNavigation?.tituloTipoEvento}
                                    titulo={evento.nomeEvento}
                                    descricao={evento.descricao}
                                    onVerEvento={(id) => navigate(`/eventos/${id}`)}
                                    onEditarEvento={
                                        evento.idEvento &&
                                        session &&
                                        (isAdmin ||
                                            isOwnedEvent(session.user.idUsuario, evento.idEvento))
                                            ? (id) => navigate(`/eventos/${id}/editar`)
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}

export default CriarEvento;
