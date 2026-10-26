import GerenciarTipos from "./GerenciarTipos";

function TipoEvento({ embedded = false }: { embedded?: boolean }) {
    return <GerenciarTipos categoria="evento" embedded={embedded} />;
}

export default TipoEvento;
