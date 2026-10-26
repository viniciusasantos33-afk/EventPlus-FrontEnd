import type { ButtonHTMLAttributes } from 'react'
import './Botao.css'

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    texto?: string
}

function Botao({
    texto,
    type = 'button',
    className = '',
    ...props
}: BotaoProps) {
    const classes = ['botao', className].filter(Boolean).join(' ')

    return (
        <button type={type} className={classes} {...props}>
            {texto}
        </button>
    )
}

export default Botao
