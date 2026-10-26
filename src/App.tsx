import AppRoutes from "./routes/AppRoutes";
import { useLocation } from "react-router-dom";

import "./App.css";

function App() {
    const location = useLocation();

    return (
        <div className="app-route-enter" key={location.pathname}>
            <AppRoutes />
        </div>
    );
}

export default App;
