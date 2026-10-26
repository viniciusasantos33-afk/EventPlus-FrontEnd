import GerenciarTipos from "./GerenciarTipos";

function TipoUsuario({ embedded = false }: { embedded?: boolean }) {
    return <GerenciarTipos categoria="usuario" embedded={embedded} />;
}

export default TipoUsuario;
