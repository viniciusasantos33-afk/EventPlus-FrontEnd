import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import CardEvento from "../../components/cardEvento/CardEvento";
import { eventPlusApi, type EventoApi } from "../../services/eventPlusApi";
import "./Eventos.css";

function Eventos() {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<EventoApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    eventPlusApi.listarEventos()
      .then(setEventos)
      .catch(() => setErro("Não foi possível carregar os eventos. Verifique se a API e o banco estão disponíveis."))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <>
      <Header />
      <main className="eventos-catalogo">
        <h1>Catálogo de Eventos</h1>
        {carregando && <p>Carregando eventos…</p>}
        {erro && <p role="alert">{erro}</p>}
        {!carregando && !erro && eventos.length === 0 && <p>Nenhum evento disponível no momento.</p>}
        <div className="eventos-catalogo-lista">
          {eventos.map((evento) => (
            <CardEvento
              key={evento.idEvento}
              id={evento.idEvento}
              imagem={evento.imagemUrl || undefined}
              categoria={evento.idTipoEventoNavigation?.tituloTipoEvento}
              titulo={evento.nomeEvento}
              descricao={evento.descricao}
              onVerEvento={(id) => navigate(`/eventos/${id}`)}
            />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Eventos;
