import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type LoginLocationState = { from?: { pathname?: string } };

export function useLoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mensagemRecuperacao, setMensagemRecuperacao] = useState("");

    async function entrar(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErro("");
        setMensagemRecuperacao("");
        setEnviando(true);

        try {
            await login({ email: email.trim(), senha });
            const state = location.state as LoginLocationState | null;
            navigate(state?.from?.pathname || "/home", { replace: true });
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível entrar. Confira seu e-mail e sua senha.",
            );
        } finally {
            setEnviando(false);
        }
    }

    function mostrarAjudaRecuperacao() {
        setMensagemRecuperacao(
            "A recuperação de senha ainda não está disponível. Entre em contato com a equipe do Event+.",
        );
    }

    return {
        email,
        setEmail,
        senha,
        setSenha,
        erro,
        enviando,
        mensagemRecuperacao,
        entrar,
        mostrarAjudaRecuperacao,
    };
}
