SARAH BERTOLINO DOS SANTOS, Agora
import type { ButtonHTMLAttributes } from "react";

import "./Botao.css"

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement>{
    texto?: string;
    className?: string;
}

function Botao({
    texto,
    onClick,
    type = "button",
    className = "",
    ...props
}: BotaoProps) {

    const classes = ["botao", className].filter(Boolean).join("");

}

export default Botao;
