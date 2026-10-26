import { useEffect, useState } from "react";
import { eventPlusApi } from "../../services/eventPlusApi";
import type { EventoApi } from "../../types/api";

export function useEventosDestaque() {
    const [eventos, setEventos] = useState<EventoApi[]>([]);
    const [erro, setErro] = useState("");

    useEffect(() => {
        let ativo = true;
        eventPlusApi
            .listarEventos()
            .then((lista) => {
                if (ativo) setEventos(lista.slice(0, 3));
            })
            .catch(() => {
                if (ativo)
                    setErro(
                        "Não foi possível carregar os eventos. Verifique se a API e o banco estão disponíveis.",
                    );
            });
        return () => {
            ativo = false;
        };
    }, []);

    return { eventos, erro };
}
