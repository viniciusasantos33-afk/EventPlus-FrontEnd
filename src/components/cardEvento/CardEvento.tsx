import bannerEvento3 from '../../assets/banner-3.png'
import './CardEvento.css' // <-- Importação do CSS que estava a faltar

interface CardEventoProps {
    id: string
    imagem?: string
    categoria?: string
    titulo: string
    descricao: string
    onVerEvento?: (id: string) => void
    onEditarEvento?: (id: string) => void
}

function CardEvento({
    id,
    imagem,
    categoria,
    titulo,
    descricao,
    onVerEvento,
    onEditarEvento,
}: CardEventoProps) {
    return (
        <article className="evento-card">
            <img src={imagem || bannerEvento3} alt={titulo} />
            {categoria && <span>{categoria}</span>}
            <div className="evento-card-info">
                <h3>{titulo}</h3>
                <p>{descricao}</p>
                <button type="button" onClick={() => onVerEvento?.(id)}>
                    Ver evento
                </button>
                {onEditarEvento && (
                    <button
                        className="evento-card-editar"
                        type="button"
                        onClick={() => onEditarEvento(id)}
                    >
                        Editar evento
                    </button>
                )}
            </div>
        </article>
    )
}

export default CardEvento
