import { Navigate, Route, Routes } from "react-router-dom"

import Home from "../pages/Home/Home"
import Eventos from "../pages/Eventos/Eventos"
import DetalhesEventos from "../pages/DetalhesEventos/DetalhesEventos"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/eventos" element={<Eventos />} />

      <Route path="/eventos/:id" element={<DetalhesEventos />} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default AppRoutes
