import { useSearchParams, Navigate } from "react-router-dom";

import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import { useAuth } from "../../contexts/AuthContext";
import AdministracaoInstituicoes from "./AdministracaoInstituicoes";
import AdministracaoUsuarios from "../Usuarios/AdministracaoUsuarios";
import TipoEvento from "../Tipos/TipoEvento";
import TipoUsuario from "../Tipos/TipoUsuario";
import "./Administracao.css";

const abas = [
    {
        id: "usuarios",
        titulo: "Usuários",
        descricao: "Crie contas, atualize dados e acompanhe os acessos da plataforma.",
        icone: "group",
    },
    {
        id: "eventos",
        titulo: "Tipos de evento",
        descricao: "Organize as categorias que ajudam a identificar cada evento.",
        icone: "event",
    },
    {
        id: "perfis",
        titulo: "Tipos de usuário",
        descricao: "Defina os perfis de acesso usados no EventPlus.",
        icone: "badge",
    },
    {
        id: "instituicoes",
        titulo: "Instituições",
        descricao: "Cadastre e mantenha os dados das instituições vinculadas aos eventos.",
        icone: "account_balance",
    },
] as const;

type AbaId = (typeof abas)[number]["id"];

function Administracao() {
    const { session, isAdmin, checkingRole } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const abaSelecionada = searchParams.get("aba");
    const abaAtiva = abas.find((aba) => aba.id === abaSelecionada) ?? abas[0];

    if (!session) {
        return <Navigate to="/login" replace state={{ from: { pathname: "/administracao" } }} />;
    }

    if (checkingRole) {
        return (
            <div className="administracao-pagina">
                <Header />
                <main className="administracao-carregando" role="status">
                    <span className="administracao-spinner" aria-hidden="true" />
                    Preparando seu painel…
                </main>
                <Footer />
            </div>
        );
    }

    if (!isAdmin) return <Navigate to="/home" replace />;

    function selecionarAba(aba: AbaId) {
        setSearchParams({ aba }, { preventScrollReset: true });
    }

    function renderizarConteudoAba() {
        switch (abaAtiva.id) {
            case "eventos":
                return <TipoEvento embedded />;
            case "perfis":
                return <TipoUsuario embedded />;
            case "instituicoes":
                return <AdministracaoInstituicoes />;
            default:
                return <AdministracaoUsuarios embedded />;
        }
    }

    return (
        <div className="administracao-pagina">
            <Header />

            <main className="administracao-conteudo">
                <section className="administracao-introducao">
                    <span className="administracao-etiqueta">Painel de gestão</span>
                    <h1>Administração</h1>
                    <p>Gerencie usuários, tipos de evento e perfis de acesso em um só lugar.</p>
                </section>

                <section className="administracao-painel" aria-label="Gerenciamento da plataforma">
                    <div
                        className="administracao-abas"
                        role="tablist"
                        aria-label="Seções da administração"
                    >
                        {abas.map((aba) => (
                            <button
                                key={aba.id}
                                id={`aba-${aba.id}`}
                                className={
                                    abaAtiva.id === aba.id
                                        ? "administracao-aba ativa"
                                        : "administracao-aba"
                                }
                                type="button"
                                role="tab"
                                aria-selected={abaAtiva.id === aba.id}
                                aria-controls="conteudo-administracao"
                                onClick={() => selecionarAba(aba.id)}
                            >
                                <span className="administracao-aba-icone" aria-hidden="true">
                                    {aba.icone}
                                </span>
                                <span>{aba.titulo}</span>
                            </button>
                        ))}
                    </div>

                    <div className="administracao-resumo-aba" key={`resumo-${abaAtiva.id}`}>
                        <div>
                            <p className="administracao-resumo-etiqueta">Gerenciar</p>
                            <h2>{abaAtiva.titulo}</h2>
                        </div>
                        <p>{abaAtiva.descricao}</p>
                    </div>

                    <div
                        className="administracao-conteudo-aba"
                        id="conteudo-administracao"
                        role="tabpanel"
                        aria-labelledby={`aba-${abaAtiva.id}`}
                        key={abaAtiva.id}
                    >
                        {renderizarConteudoAba()}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Administracao;
