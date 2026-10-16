import visaoImg from "../../assets/visao-img.png"

import "./Home.css"
import Carrossel from "../../components/carrossel/Carrossel"
import Header from "../../components/header/Header"
import Footer from "../../components/footer/Footer"
import CardEvento from "../../components/cardEvento/CardEvento"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { eventPlusApi, type EventoApi } from "../../services/eventPlusApi"

function Home() {
    const navigate = useNavigate()
    const [eventos, setEventos] = useState<EventoApi[]>([])
    const [erroEventos, setErroEventos] = useState("")

    useEffect(() => {
        eventPlusApi.listarEventos()
            .then((dados) => setEventos(dados.slice(0, 3)))
            .catch(() => setErroEventos("Não foi possível carregar os eventos. Verifique se a API e o banco estão disponíveis."))
    }, [])
    return (
        <>
            <Header />
            <main>
                <Carrossel />

                <section className="home-visao">
                    <img src={visaoImg} alt="Pessoas confraternizando" />
                    <div className="home-visao-texto">
                        <h1>Visão</h1>
                        <p>A EventPlus organiza eventos e informações em uma interface direta, facilitando a consulta da agenda e a participação dos usuários.</p>
                    </div>
                </section>

                <section id="eventos" className="home-eventos">
                    <h2>Próximos Eventos</h2>

                    <div className="home-eventos-lista">
                        {erroEventos && <p role="alert">{erroEventos}</p>}
                        {!erroEventos && eventos.length === 0 && <p>Nenhum evento disponível no momento.</p>}
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
                </section>

                <section id="contato" className="home-contato">
                    <div className="home-contato-container">
                        <div className="home-contato-titulo">
                            <h2>Contato</h2>
                            <hr />
                        </div>

                        <div className="home-contato-conteudo">
                            <div className="home-contato-texto">
                                <p>Rua Niterói, 180 – Centro</p>
                                <p>São Caetano do Sul – SP</p>
                                <p><a href="tel:1142252000">(11) 4225-2000</a></p>
                            </div>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4493.463099686336!2d-46.57330458832518!3d-23.615129178674422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce5d11c031c57f%3A0x8f79f71018065a16!2sSENAI%20S%C3%A3o%20Caetano%20do%20Sul%20-%20Cyber%20e%20IA!5e1!3m2!1spt-BR!2sbr!4v1791222288177!5m2!1spt-BR!2sbr"
                                title="Mapa de Localização SENAI"
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                            ></iframe>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}

export default Home;
