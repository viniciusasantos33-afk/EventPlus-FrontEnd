import { Link } from "react-router-dom";
import logoEvent from "../../assets/logo-event.svg";
import { useLoginForm } from "./useLoginForm";
import "./Login.css";
import Input from "../../components/Input";

function Login() {
    const {
        email,
        setEmail,
        senha,
        setSenha,
        erro,
        enviando,
        mensagemRecuperacao,
        entrar,
        mostrarAjudaRecuperacao,
    } = useLoginForm();

    return (
        <main className="login-pagina">
            <form className="login-formulario" onSubmit={entrar} aria-labelledby="login-titulo">
                <Link className="login-logo" to="/home" aria-label="Event+, página inicial">
                    <img src={logoEvent} alt="Event+" />
                </Link>
                <h1 id="login-titulo" className="visualmente-oculto">
                    Entrar na Event+
                </h1>

                <label className="visualmente-oculto" htmlFor="login-email">
                    Login (e-mail)
                </label>
                <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="Login"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />

                <label className="visualmente-oculto" htmlFor="login-senha">
                    Senha
                </label>
                <Input
                    id="login-senha"
                    name="senha"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Senha"
                    value={senha}
                    onChange={(event) => setSenha(event.target.value)}
                    required
                />

                <button className="login-recuperar" type="button" onClick={mostrarAjudaRecuperacao}>
                    Esqueceu a senha?
                </button>
                {erro && (
                    <p className="login-erro" role="alert">
                        {erro}
                    </p>
                )}
                {mensagemRecuperacao && (
                    <p className="login-ajuda" role="status">
                        {mensagemRecuperacao}
                    </p>
                )}

                <button className="login-entrar" type="submit" disabled={enviando}>
                    {enviando ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </main>
    );
}

export default Login;
