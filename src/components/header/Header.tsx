import logoEvent from "../../assets/logo-event.svg"
import { Link, NavLink } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { eventPlusApi } from "../../services/eventPlusApi";

import "./Header.css"

function Header() {
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState(() => localStorage.getItem("eventplus.user") || "");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErroLogin("");
    setEnviando(true);
    try {
      const sessao = await eventPlusApi.entrar(email, senha);
      localStorage.setItem("eventplus.token", sessao.token);
      localStorage.setItem("eventplus.user", sessao.user.nome);
      localStorage.setItem("eventplus.userId", sessao.user.idUsuario);
      setNomeUsuario(sessao.user.nome);
      setSenha("");
      setModalAberto(false);
    } catch {
      setErroLogin("Não foi possível entrar. Confira seu e-mail e sua senha.");
    } finally {
      setEnviando(false);
    }
  }

  function sair() {
    localStorage.removeItem("eventplus.token");
    localStorage.removeItem("eventplus.user");
    localStorage.removeItem("eventplus.userId");
    setNomeUsuario("");
  }

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
            <NavLink to="/usuarios">Usuários</NavLink>
            <Link to="/home#contato">Contatos</Link>
          </nav>

          {nomeUsuario ? (
            <div className="header-conta"><span>{nomeUsuario}</span><button type="button" onClick={sair}>Sair</button></div>
          ) : <button type="button" onClick={() => setModalAberto(true)}>Entrar</button>}
        </div>
      </header>
      {modalAberto && (
        <div className="login-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalAberto(false); }}>
          <form className="login-modal" onSubmit={entrar} aria-labelledby="login-titulo">
            <button className="login-fechar" type="button" aria-label="Fechar" onClick={() => setModalAberto(false)}>×</button>
            <h2 id="login-titulo">Entrar</h2>
            <label htmlFor="login-email">E-mail</label>
            <input id="login-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <label htmlFor="login-senha">Senha</label>
            <input id="login-senha" type="password" autoComplete="current-password" value={senha} onChange={(event) => setSenha(event.target.value)} required />
            {erroLogin && <p role="alert">{erroLogin}</p>}
            <button className="login-submit" type="submit" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
          </form>
        </div>
      )}
    </>
  )
}

export default Header;
