import logoEvent from "../../assets/logo-event.svg";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

import "./Header.css";

function Header() {
    const { session, logout, isAdmin } = useAuth();

    return (
        <>
            <header className="header">
                <div className="header-conteudo">
                    <Link to="/home">
                        <img src={logoEvent} alt="Logo Event+" />
                    </Link>

                    <nav>
                        <NavLink to="/home">Home</NavLink>
                        <NavLink to="/eventos">Eventos</NavLink>
                        {isAdmin && <NavLink to="/administracao">Administração</NavLink>}
                        <Link to="/home#contato">Contato</Link>
                    </nav>

                    {session ? (
                        <div className="header-conta">
                            <span>{session.user.nome}</span>
                            <button type="button" onClick={logout}>
                                Sair
                            </button>
                        </div>
                    ) : (
                        <Link to="/login">Entrar</Link>
                    )}
                </div>
            </header>
        </>
    );
}

export default Header;
