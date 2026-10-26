import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";

import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import Input from "../../components/Input";
import TabelaAdministracao, {
    AcaoTabelaAdministracao,
    type ColunaTabelaAdministracao,
} from "../../components/TabelaAdministracao";
import { useAuth } from "../../contexts/AuthContext";
import { eventPlusApi } from "../../services/eventPlusApi";
import type { AdminUsuarioApi, TipoUsuarioApi } from "../../types/api";
import ilustracao from "../../assets/visao-img.png";
import "./AdministracaoUsuarios.css";

interface UsuarioForm {
    nome: string;
    email: string;
    senha: string;
    idTipoUsuario: string;
}

const formularioVazio: UsuarioForm = {
    nome: "",
    email: "",
    senha: "",
    idTipoUsuario: "",
};

const colunasUsuarios: ColunaTabelaAdministracao[] = [
    { id: "nome", titulo: "Nome" },
    { id: "email", titulo: "E-mail" },
    { id: "tipo", titulo: "Tipo" },
    { id: "editar", titulo: "Editar", acao: true },
    { id: "excluir", titulo: "Excluir", acao: true },
];

interface AdministracaoUsuariosProps {
    embedded?: boolean;
}

function AdministracaoUsuarios({ embedded = false }: AdministracaoUsuariosProps) {
    const { session, isAdmin, checkingRole } = useAuth();
    const [usuarios, setUsuarios] = useState<AdminUsuarioApi[]>([]);
    const [tipos, setTipos] = useState<TipoUsuarioApi[]>([]);
    const [formulario, setFormulario] = useState<UsuarioForm>(formularioVazio);
    const [usuarioEditando, setUsuarioEditando] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        if (!session || checkingRole || !isAdmin) return;

        let ativo = true;

        Promise.all([eventPlusApi.listarUsuarios(session.token), eventPlusApi.listarTiposUsuario()])
            .then(([listaUsuarios, listaTipos]) => {
                if (!ativo) return;

                setUsuarios(listaUsuarios);
                setTipos(listaTipos);
            })
            .catch((error: unknown) => {
                if (ativo)
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar os dados dos usuários.",
                    );
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });

        return () => {
            ativo = false;
        };
    }, [session, checkingRole, isAdmin]);

    if (!session)
        return <Navigate to="/login" replace state={{ from: { pathname: "/usuarios" } }} />;
    if (checkingRole) {
        return (
            <div className={embedded ? "admin-usuarios-embedded" : "admin-usuarios-pagina"}>
                {!embedded && <Header />}
                <main className="admin-usuarios-loading" role="status">
                    <span className="admin-usuarios-spinner" aria-hidden="true" />
                    Verificando permissões…
                </main>
                {!embedded && <Footer />}
            </div>
        );
    }
    if (!isAdmin) return <Navigate to="/home" replace />;

    const token = session.token;
    const currentUserId = session.user.idUsuario;

    function atualizarCampo(campo: keyof UsuarioForm, valor: string) {
        setFormulario((atual) => ({ ...atual, [campo]: valor }));
    }

    function editar(usuario: AdminUsuarioApi) {
        setUsuarioEditando(usuario.idUsuario);

        setFormulario({
            nome: usuario.nome,
            email: usuario.email,
            senha: "",
            idTipoUsuario: usuario.idTipoUsuario ?? "",
        });

        setErro("");
        setMensagem("");
    }

    function cancelarEdicao() {
        setUsuarioEditando(null);
        setFormulario(formularioVazio);
    }

    async function salvarUsuario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");
        setMensagem("");
        setSalvando(true);

        try {
            const dados = {
                nome: formulario.nome.trim(),
                email: formulario.email.trim(),
                senha: formulario.senha,
                idTipoUsuario: formulario.idTipoUsuario || null,
            };

            if (usuarioEditando) {
                await eventPlusApi.atualizarUsuario(usuarioEditando, dados, token);
            } else {
                await eventPlusApi.cadastrarUsuario(dados, token);
            }

            const atualizados = await eventPlusApi.listarUsuarios(token);

            setUsuarios(atualizados);
            setMensagem(usuarioEditando ? "Usuário atualizado." : "Usuário cadastrado.");
            cancelarEdicao();
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível salvar o usuário.");
        } finally {
            setSalvando(false);
        }
    }

    async function excluir(usuario: AdminUsuarioApi) {
        if (usuario.idUsuario.toLowerCase() === currentUserId.toLowerCase()) {
            setErro("Não é possível excluir a própria conta de administrador.");
            return;
        }

        if (!window.confirm(`Excluir o usuário ${usuario.nome}?`)) return;

        setErro("");

        try {
            await eventPlusApi.excluirUsuario(usuario.idUsuario, token);
            setUsuarios((lista) => lista.filter((item) => item.idUsuario !== usuario.idUsuario));
            setMensagem("Usuário excluído.");
            if (usuarioEditando === usuario.idUsuario) cancelarEdicao();
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível excluir o usuário.");
        }
    }

    return (
        <div className={embedded ? "admin-usuarios-embedded" : "admin-usuarios-pagina"}>
            {!embedded && <Header />}
            <main>
                <section className="admin-usuarios-topo">
                    <h1 className="admin-usuarios-titulo">Administração de usuários</h1>

                    <div className="admin-usuarios-conteudo">
                        <img
                            className="admin-usuarios-ilustracao"
                            src={ilustracao}
                            alt="Ilustração de pessoas colaborando"
                        />

                        <form className="admin-usuarios-formulario" onSubmit={salvarUsuario}>
                            <Input
                                aria-label="Nome"
                                placeholder="Nome"
                                value={formulario.nome}
                                onChange={(event) => atualizarCampo("nome", event.target.value)}
                                minLength={2}
                                maxLength={100}
                                required
                            />

                            <Input
                                aria-label="E-mail"
                                type="email"
                                placeholder="E-mail"
                                value={formulario.email}
                                onChange={(event) => atualizarCampo("email", event.target.value)}
                                maxLength={100}
                                required
                            />

                            <div className="admin-usuarios-linha">
                                <label className="visualmente-oculto" htmlFor="admin-tipo-usuario">
                                    Tipo de usuário
                                </label>
                                <select
                                    id="admin-tipo-usuario"
                                    value={formulario.idTipoUsuario}
                                    onChange={(event) =>
                                        atualizarCampo("idTipoUsuario", event.target.value)
                                    }
                                    required
                                >
                                    <option value="">Tipo de Usuário</option>
                                    {tipos.map((tipo) => (
                                        <option key={tipo.idTipoUsuario} value={tipo.idTipoUsuario}>
                                            {tipo.tituloTipoUsuario}
                                        </option>
                                    ))}
                                </select>

                                <Input
                                    aria-label={usuarioEditando ? "Nova senha" : "Senha"}
                                    type="password"
                                    placeholder={
                                        usuarioEditando
                                            ? "Nova senha (obrigatória para salvar)"
                                            : "Senha"
                                    }
                                    value={formulario.senha}
                                    onChange={(event) =>
                                        atualizarCampo("senha", event.target.value)
                                    }
                                    minLength={8}
                                    maxLength={60}
                                    required
                                />
                            </div>

                            {tipos.length === 0 && (
                                <p className="admin-usuarios-ajuda">
                                    Cadastre um tipo de usuário antes de criar contas.
                                </p>
                            )}
                            {erro && (
                                <p className="admin-usuarios-erro" role="alert">
                                    {erro}
                                </p>
                            )}
                            {mensagem && (
                                <p className="admin-usuarios-mensagem" role="status">
                                    {mensagem}
                                </p>
                            )}

                            <div className="admin-usuarios-acoes-form">
                                <button type="submit" disabled={salvando || tipos.length === 0}>
                                    {salvando
                                        ? "Salvando…"
                                        : usuarioEditando
                                          ? "Salvar alterações"
                                          : "Cadastrar"}
                                </button>
                                {usuarioEditando && (
                                    <button
                                        type="button"
                                        className="admin-usuarios-cancelar"
                                        onClick={cancelarEdicao}
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </section>

                <section
                    className="admin-usuarios-lista"
                    aria-labelledby="admin-usuarios-lista-titulo"
                >
                    <h2 id="admin-usuarios-lista-titulo">Lista usuários</h2>
                    {carregando ? (
                        <p className="admin-usuarios-loading" role="status">
                            <span className="admin-usuarios-spinner" aria-hidden="true" />
                            Carregando usuários…
                        </p>
                    ) : erro && usuarios.length === 0 ? (
                        <p role="alert">{erro}</p>
                    ) : usuarios.length === 0 ? (
                        <p>Nenhum usuário cadastrado.</p>
                    ) : (
                        <TabelaAdministracao
                            colunas={colunasUsuarios}
                            linhas={usuarios.map((usuario) => ({
                                id: usuario.idUsuario,
                                celulas: [
                                    usuario.nome,
                                    usuario.email,
                                    usuario.idTipoUsuarioNavigation?.tituloTipoUsuario ||
                                        "Sem tipo",
                                    <AcaoTabelaAdministracao
                                        acao="edit"
                                        rotulo={`Editar ${usuario.nome}`}
                                        aoAcionar={() => editar(usuario)}
                                    />,
                                    <AcaoTabelaAdministracao
                                        acao="delete"
                                        rotulo={`Excluir ${usuario.nome}`}
                                        aoAcionar={() => void excluir(usuario)}
                                    />,
                                ],
                            }))}
                        />
                    )}
                </section>
            </main>
            {!embedded && <Footer />}
        </div>
    );
}

export default AdministracaoUsuarios;
