import type { ReactNode } from "react";

export interface ColunaTabelaAdministracao {
    id: string;
    titulo: string;
    acao?: boolean;
}

export interface LinhaTabelaAdministracao {
    id: string;
    celulas: ReactNode[];
}

interface TabelaAdministracaoProps {
    colunas: ColunaTabelaAdministracao[];
    linhas: LinhaTabelaAdministracao[];
}

export function AcaoTabelaAdministracao({
    acao,
    rotulo,
    aoAcionar,
}: {
    acao: "edit" | "delete";
    rotulo: string;
    aoAcionar: () => void;
}) {
    return (
        <button className="tabela-admin-acao" type="button" aria-label={rotulo} onClick={aoAcionar}>
            <span className="tabela-admin-icone" aria-hidden="true">
                {acao}
            </span>
        </button>
    );
}

function TabelaAdministracao({ colunas, linhas }: TabelaAdministracaoProps) {
    return (
        <div className="tabela-admin-wrap">
            <table className="tabela-admin">
                <thead>
                    <tr>
                        {colunas.map((coluna) => (
                            <th
                                key={coluna.id}
                                className={coluna.acao ? "tabela-admin-coluna-acao" : undefined}
                                scope="col"
                            >
                                {coluna.titulo}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {linhas.map((linha) => (
                        <tr key={linha.id}>
                            {linha.celulas.map((celula, indice) => (
                                <td
                                    key={colunas[indice].id}
                                    className={
                                        colunas[indice].acao
                                            ? "tabela-admin-coluna-acao"
                                            : undefined
                                    }
                                >
                                    {celula}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TabelaAdministracao;
