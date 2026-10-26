import { Navigate, Route, Routes } from "react-router-dom";

import Home from "../pages/Home/Home";
import Eventos from "../pages/Eventos/Eventos";
import DetalhesEventos from "../pages/DetalhesEventos/DetalhesEventos";
import Login from "../pages/Login/Login";
import CriarEvento from "../pages/Eventos/CriarEvento";
import EditarEvento from "../pages/Eventos/EditarEvento";
import Administracao from "../pages/Administracao/Administracao";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/eventos/criar" element={<CriarEvento />} />
            <Route path="/eventos/:id/editar" element={<EditarEvento />} />
            <Route path="/login" element={<Login />} />

            <Route path="/eventos/:id" element={<DetalhesEventos />} />
            <Route path="/administracao" element={<Administracao />} />
            <Route
                path="/usuarios"
                element={<Navigate to="/administracao?aba=usuarios" replace />}
            />
            <Route
                path="/tipos-evento"
                element={<Navigate to="/administracao?aba=eventos" replace />}
            />
            <Route
                path="/tipos-usuario"
                element={<Navigate to="/administracao?aba=perfis" replace />}
            />

            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
}

export default AppRoutes;
