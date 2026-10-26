import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import CardEvento from "../../components/cardEvento/CardEvento";
import { eventPlusApi } from "../../services/eventPlusApi";
import { useAuth } from "../../contexts/AuthContext";
import { isOwnedEvent } from "../../services/eventOwnership";
import type { EventoApi } from "../../types/api";
import "./Eventos.css";

function Eventos() {
    const navigate = useNavigate();
    const { session, isAdmin } = useAuth();
    const [eventos, setEventos] = useState<EventoApi[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        eventPlusApi
            .listarEventos()
            .then(setEventos)
            .catch(() =>
                setErro(
                    "Não foi possível carregar os eventos. Verifique se a API e o banco estão disponíveis.",
                ),
            )
            .finally(() => setCarregando(false));
    }, []);

    return (
        <>
            <Header />
            <main className="eventos-catalogo">
                <h1>Catálogo de Eventos</h1>

                {session && (
                    <Link className="eventos-criar-link" to="/eventos/criar">
                        Criar evento
                    </Link>
                )}
                {carregando && <p role="status">Carregando eventos…</p>}
                {erro && <p role="alert">{erro}</p>}
                {!carregando && !erro && eventos.length === 0 && (
                    <p>Nenhum evento disponível no momento.</p>
                )}

                <div className="eventos-catalogo-lista">
                    {eventos.map((evento) => (
                        <CardEvento
                            key={evento.idEvento}
                            id={evento.idEvento}
                            imagem={evento.imagemUrl || undefined}
                            categoria={evento.idTipoEventoNavigation?.tituloTipoEvento}
                            titulo={evento.nomeEvento}
                            descricao={evento.descricao}
                            onVerEvento={(eventoId) => navigate(`/eventos/${eventoId}`)}
                            onEditarEvento={
                                session &&
                                (isAdmin || isOwnedEvent(session.user.idUsuario, evento.idEvento))
                                    ? (eventoId) => navigate(`/eventos/${eventoId}/editar`)
                                    : undefined
                            }
                        />
                    ))}
                </div>
            </main>
            <Footer />
        </>
    );
}

export default Eventos;
