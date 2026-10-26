import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import bannerPadrao from "../../assets/banner-3.png";
import { useDetalhesEvento } from "./useDetalhesEvento";
import "./DetalhesEventos.css";

const formatoDataComentario: Intl.DateTimeFormatOptions = {
    dateStyle: "short",
    timeStyle: "short",
};

const formatoDataEvento: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
};

function DetalhesEventos() {
    const { id = "" } = useParams();
    const detalhes = useDetalhesEvento(id);
    const {
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
    } = detalhes;

    const [secaoComentario, setSecaoComentario] = useState(false);
    const [novoComentario, setNovoComentario] = useState("");
    const [modalInscricaoAberto, setModalInscricaoAberto] = useState(false);
    const modalInscricaoRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const modal = modalInscricaoRef.current;
        if (!modal) return;

        if (modalInscricaoAberto && !modal.open) modal.showModal();
        if (!modalInscricaoAberto && modal.open) modal.close();
    }, [modalInscricaoAberto]);

    async function enviarComentario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await detalhes.enviarComentario(novoComentario);
        if (novoComentario.trim()) setNovoComentario("");
    }

    async function confirmarInscricao() {
        const atualizada = await detalhes.alternarInscricao();
        if (atualizada) setModalInscricaoAberto(false);
    }

    return (
        <div className="detalhes-pagina">
            <Header />

            <main className="detalhes-conteudo">
                {carregando ? (
                    <p className="detalhes-status detalhes-carregando" role="status">
                        <span className="detalhes-spinner" aria-hidden="true" />
                        Carregando evento…
                    </p>
                ) : erro ? (
                    <p className="detalhes-status" role="alert">
                        {erro}
                    </p>
                ) : evento ? (
                    <>
                        <img
                            className="detalhes-banner"
                            src={evento.imagemUrl || bannerPadrao}
                            alt={`Imagem do evento ${evento.nomeEvento}`}
                        />
                        <h1 className="detalhes-titulo">{evento.nomeEvento}</h1>
                        <div className="detalhes-grade">
                            <section className="detalhes-principal" aria-label="Conteúdo do evento">
                                <div
                                    className="detalhes-abas"
                                    role="tablist"
                                    aria-label="Seções do evento"
                                >
                                    <button
                                        className={!secaoComentario ? "ativa" : ""}
                                        role="tab"
                                        aria-selected={!secaoComentario}
                                        onClick={() => setSecaoComentario(false)}
                                    >
                                        Sobre o evento
                                    </button>
                                    <button
                                        className={secaoComentario ? "ativa" : ""}
                                        role="tab"
                                        aria-selected={secaoComentario}
                                        onClick={() => setSecaoComentario(true)}
                                    >
                                        Comentários
                                    </button>
                                </div>

                                {secaoComentario ? (
                                    <div className="detalhes-comentarios">
                                        {session ? (
                                            <form
                                                className="comentario-form"
                                                onSubmit={enviarComentario}
                                            >
                                                <label
                                                    className="visualmente-oculto"
                                                    htmlFor="novo-comentario"
                                                >
                                                    Escreva um comentário
                                                </label>
                                                <input
                                                    id="novo-comentario"
                                                    maxLength={200}
                                                    value={novoComentario}
                                                    onChange={(event) => {
                                                        setNovoComentario(event.target.value);

                                                        setMensagemComentario("");
                                                        setErroComentario("");
                                                    }}
                                                    placeholder="Escreva seu comentário…"
                                                    required
                                                />
                                                <button
                                                    className={
                                                        enviandoComentario
                                                            ? "comentario-enviando"
                                                            : ""
                                                    }
                                                    type="submit"
                                                    aria-label={
                                                        enviandoComentario
                                                            ? "Enviando comentário"
                                                            : "Enviar comentário"
                                                    }
                                                    disabled={
                                                        !novoComentario.trim() || enviandoComentario
                                                    }
                                                >
                                                    {enviandoComentario ? (
                                                        <span
                                                            className="comentario-spinner"
                                                            aria-hidden="true"
                                                        />
                                                    ) : (
                                                        <span
                                                            className="detalhes-icone-google"
                                                            aria-hidden="true"
                                                        >
                                                            send
                                                        </span>
                                                    )}
                                                </button>
                                            </form>
                                        ) : (
                                            <p>
                                                Para comentar,{" "}
                                                <Link
                                                    to="/login"
                                                    state={{
                                                        from: {
                                                            pathname: `/eventos/${id}`,
                                                        },
                                                    }}
                                                >
                                                    entre na sua conta
                                                </Link>
                                                .
                                            </p>
                                        )}

                                        {erroComentario && (
                                            <p className="comentario-erro" role="alert">
                                                {erroComentario}
                                            </p>
                                        )}

                                        {mensagemComentario && (
                                            <p className="comentario-sucesso" role="status">
                                                {mensagemComentario}
                                            </p>
                                        )}

                                        <ul className="comentarios-lista">
                                            {comentarios.map((comentario) => (
                                                <li key={comentario.idComentario}>
                                                    <p className="comentario-meta">
                                                        <strong>
                                                            {comentario.idUsuarioNavigation?.nome ||
                                                                "Usuário"}
                                                        </strong>
                                                        <span>
                                                            {new Intl.DateTimeFormat(
                                                                "pt-BR",
                                                                formatoDataComentario,
                                                            ).format(
                                                                new Date(comentario.dataComentario),
                                                            )}
                                                        </span>
                                                    </p>
                                                    <p>{comentario.descricao}</p>
                                                </li>
                                            ))}
                                        </ul>

                                        {comentarios.length === 0 && (
                                            <p>Este evento ainda não tem comentários.</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="detalhes-descricao">{evento.descricao}</p>
                                )}
                            </section>
                            <aside className="detalhes-info">
                                <h2>Informações principais</h2>

                                <p>
                                    <span className="detalhes-icone-google" aria-hidden="true">
                                        schedule
                                    </span>
                                    {new Intl.DateTimeFormat("pt-BR", formatoDataEvento).format(
                                        new Date(evento.dataEvento),
                                    )}
                                </p>

                                <p>
                                    <span className="detalhes-icone-google" aria-hidden="true">
                                        location_city
                                    </span>
                                    {evento.idInstituicaoNavigation?.nomeFantasia ||
                                        "Local a confirmar"}
                                </p>

                                <p>
                                    <span className="detalhes-icone-google" aria-hidden="true">
                                        category
                                    </span>
                                    {evento.idTipoEventoNavigation?.tituloTipoEvento || "Evento"}
                                </p>

                                {evento.idInstituicaoNavigation?.endereco && (
                                    <p className="detalhes-endereco">
                                        <span className="detalhes-icone-google" aria-hidden="true">
                                            location_on
                                        </span>
                                        {evento.idInstituicaoNavigation.endereco}
                                    </p>
                                )}

                                <button
                                    className={`detalhes-inscricao${presenca ? " detalhes-inscricao--cancelar" : ""}`}
                                    type="button"
                                    onClick={() => {
                                        setMensagemInscricao("");
                                        setModalInscricaoAberto(true);
                                    }}
                                    disabled={
                                        inscrevendo || carregandoPresenca || Boolean(erroPresenca)
                                    }
                                >
                                    {carregandoPresenca
                                        ? "Verificando inscrição..."
                                        : presenca
                                          ? "Cancelar inscrição"
                                          : "Inscrever-se"}
                                </button>

                                {erroPresenca && (
                                    <p className="detalhes-mensagem" role="alert">
                                        {erroPresenca}
                                    </p>
                                )}
                                {mensagemInscricao && (
                                    <p className="detalhes-mensagem" role="status">
                                        {mensagemInscricao}
                                    </p>
                                )}
                                {!session && mensagemInscricao && (
                                    <Link
                                        to="/login"
                                        state={{
                                            from: {
                                                pathname: `/eventos/${id}`,
                                            },
                                        }}
                                    >
                                        Entrar
                                    </Link>
                                )}
                            </aside>
                        </div>
                    </>
                ) : (
                    <section className="detalhes-nao-encontrado">
                        <h1>Evento não encontrado</h1>
                        <p>O evento solicitado não está disponível.</p>
                    </section>
                )}
            </main>

            <dialog
                ref={modalInscricaoRef}
                className="modal-inscricao"
                aria-labelledby="modal-inscricao-titulo"
                onClose={() => setModalInscricaoAberto(false)}
                onCancel={(event) => {
                    if (inscrevendo) event.preventDefault();
                }}
                onClick={(event) => {
                    if (event.target === modalInscricaoRef.current && !inscrevendo)
                        setModalInscricaoAberto(false);
                }}
            >
                <button
                    className="modal-inscricao-fechar"
                    type="button"
                    onClick={() => setModalInscricaoAberto(false)}
                    disabled={inscrevendo}
                    aria-label="Fechar modal"
                >
                    <span className="detalhes-icone-google" aria-hidden="true">
                        close
                    </span>
                </button>
                {!session ? (
                    <>
                        <span
                            className="modal-inscricao-icone detalhes-icone-google"
                            aria-hidden="true"
                        >
                            login
                        </span>
                        <h2 id="modal-inscricao-titulo">Entre para continuar</h2>
                        <p>Faça login na sua conta para se inscrever neste evento.</p>
                        <Link
                            className="modal-inscricao-confirmar"
                            to="/login"
                            state={{ from: { pathname: `/eventos/${id}` } }}
                        >
                            Entrar
                        </Link>
                    </>
                ) : (
                    <>
                        <span
                            className={`modal-inscricao-icone detalhes-icone-google${presenca ? " cancelar" : ""}`}
                            aria-hidden="true"
                        >
                            {presenca ? "event_busy" : "check_circle"}
                        </span>
                        <h2 id="modal-inscricao-titulo">
                            {presenca ? "Cancelar inscrição?" : "Confirmar inscrição?"}
                        </h2>
                        <p>
                            {presenca
                                ? `Deseja cancelar sua inscrição em “${evento?.nomeEvento ?? "este evento"}”?`
                                : `Deseja confirmar sua participação em “${evento?.nomeEvento ?? "este evento"}”?`}
                        </p>
                        {mensagemInscricao && (
                            <p className="modal-inscricao-erro" role="alert">
                                {mensagemInscricao}
                            </p>
                        )}
                        <div className="modal-inscricao-acoes">
                            <button
                                type="button"
                                className="modal-inscricao-voltar"
                                onClick={() => setModalInscricaoAberto(false)}
                                disabled={inscrevendo}
                            >
                                Voltar
                            </button>
                            <button
                                type="button"
                                className={`modal-inscricao-confirmar${presenca ? " cancelar" : ""}`}
                                onClick={() => void confirmarInscricao()}
                                disabled={inscrevendo}
                            >
                                {inscrevendo
                                    ? "Processando…"
                                    : presenca
                                      ? "Sim, cancelar"
                                      : "Sim, inscrever"}
                            </button>
                        </div>
                    </>
                )}
            </dialog>
            <Footer />
        </div>
    );
}

export default DetalhesEventos;
