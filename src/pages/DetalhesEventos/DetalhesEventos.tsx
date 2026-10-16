import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import bannerPadrao from "../../assets/banner-3.png";
import { eventPlusApi, type ComentarioApi, type EventoApi } from "../../services/eventPlusApi";
import "./DetalhesEventos.css";

function DetalhesEventos() {
    const { id = "" } = useParams();
    const [resultado, setResultado] = useState<{ id: string; evento: EventoApi | null; comentarios: ComentarioApi[]; erro: string } | null>(null);
    
    const carregando = resultado?.id !== id;
    const evento = resultado?.id === id ? resultado.evento : null;
    const comentarios = resultado?.id === id ? resultado.comentarios : [];
    const erro = resultado?.id === id ? resultado.erro : "";

    const [secaoComentario, setSecaoComentario] = useState(false);
    const [novoComentario, setNovoComentario] = useState("");
    const [erroComentario, setErroComentario] = useState("");
    const [mensagemInscricao, setMensagemInscricao] = useState("");
    const [inscrevendo, setInscrevendo] = useState(false);

    useEffect(() => {
        let ativo = true;

        Promise.all([eventPlusApi.buscarEvento(id), eventPlusApi.listarComentarios(id)])

            .then(([dadosEvento, dadosComentarios]) => {
                if (!ativo) return;
                setResultado({ id, evento: dadosEvento, comentarios: dadosComentarios, erro: "" });
            })

            .catch(() => {
                if (ativo) setResultado({ id, evento: null, comentarios: [], erro: "Não foi possível carregar este evento. Confira a conexão com a API e tente novamente." });
            })
            
        return () => { ativo = false; };
    }, [id])

    function enviarComentario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const texto = novoComentario.trim();

        if (!texto) return;

        const token = localStorage.getItem("eventplus.token");

        if (!token) {
            setErroComentario("Faça login para publicar um comentário.");
            return;
        }

        setErroComentario("");

        eventPlusApi.comentar(id, texto, token)
            .then((comentario) => {
                setResultado((atual) => atual?.id === id ? { ...atual, comentarios: [comentario, ...atual.comentarios] } : atual);
                setNovoComentario("");
            })

            .catch((e: unknown) => setErroComentario(e instanceof Error ? e.message : "Não foi possível publicar o comentário."));
    }

    async function inscrever() {
        const token = localStorage.getItem("eventplus.token");

        const idUsuario = localStorage.getItem("eventplus.userId");

        if (!token || !idUsuario) {
            setMensagemInscricao("Faça login para se inscrever no evento.");
            return;
        }

        setMensagemInscricao("");
        setInscrevendo(true);
        
        try {
            await eventPlusApi.inscrever(id, idUsuario, token);
            setMensagemInscricao("Inscrição realizada com sucesso.");
        } catch (e) {
            setMensagemInscricao(e instanceof Error ? e.message : "Não foi possível realizar a inscrição.");
        } finally {
            setInscrevendo(false);
        }
    }

    return (
        <div className="detalhes-pagina">
            <Header />
            <main className="detalhes-conteudo">
                {carregando ? <p className="detalhes-status">Carregando evento…</p> : erro ? <p className="detalhes-status" role="alert">{erro}</p> : evento ? (
                    <>
                        <img className="detalhes-banner" src={evento.imagemUrl || bannerPadrao} alt={`Imagem do evento ${evento.nomeEvento}`} />
                        <h1 className="detalhes-titulo">{evento.nomeEvento}</h1>
                        <div className="detalhes-grade">
                            <section className="detalhes-principal" aria-label="Conteúdo do evento">
                                <div className="detalhes-abas" role="tablist" aria-label="Seções do evento">
                                    <button className={!secaoComentario ? "ativa" : ""} role="tab" aria-selected={!secaoComentario} onClick={() => setSecaoComentario(false)}>Sobre o evento</button>
                                    <button className={secaoComentario ? "ativa" : ""} role="tab" aria-selected={secaoComentario} onClick={() => setSecaoComentario(true)}>Comentários</button>
                                </div>
                                {secaoComentario ? (
                                    <div className="detalhes-comentarios">
                                        <form className="comentario-form" onSubmit={enviarComentario}>
                                            <label className="visualmente-oculto" htmlFor="novo-comentario">Escreva um comentário</label>
                                            <input id="novo-comentario" maxLength={200} value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)} placeholder="Comentar" />
                                            <button type="submit" aria-label="Enviar comentário" disabled={!novoComentario.trim()}>➤</button>
                                        </form>
                                        {erroComentario && <p className="comentario-erro" role="alert">{erroComentario}</p>}
                                        <ul className="comentarios-lista">
                                            {comentarios.map((comentario) => (
                                                <li key={comentario.idComentario}>
                                                    <p className="comentario-meta"><strong>{comentario.idUsuarioNavigation?.nome || "Usuário"}</strong><span>{new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(comentario.dataComentario))}</span></p>
                                                    <p>{comentario.descricao}</p>
                                                </li>
                                            ))}
                                        </ul>
                                        {comentarios.length === 0 && <p>Este evento ainda não tem comentários.</p>}
                                    </div>
                                ) : <p className="detalhes-descricao">{evento.descricao}</p>}
                            </section>
                            <aside className="detalhes-info">
                                <h2>Informações principais</h2>
                                <p><span aria-hidden="true">◷</span>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(evento.dataEvento))}</p>
                                <p><span aria-hidden="true">▦</span>{evento.idInstituicaoNavigation?.nomeFantasia || "Local a confirmar"}</p>
                                <p><span aria-hidden="true">◆</span>{evento.idTipoEventoNavigation?.tituloTipoEvento || "Evento"}</p>
                                <p className="detalhes-endereco">{evento.idInstituicaoNavigation?.endereco}</p>
                                <button className="detalhes-inscricao" type="button" onClick={inscrever} disabled={inscrevendo}>{inscrevendo ? "Inscrevendo…" : "Se-inscrever"}</button>
                                {mensagemInscricao && <p className="detalhes-mensagem" role="status">{mensagemInscricao}</p>}
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
            <Footer />
        </div>
    );
}

export default DetalhesEventos;
