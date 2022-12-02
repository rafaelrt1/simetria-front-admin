import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ContextProvider } from "../context";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Funcionarios from "../pages/Funcionarios";
import Servicos from "../pages/Servicos";
import Agenda from "../pages/Agenda";
import NotFound from "../pages/NotFound";

const Navigation = () => {
    return (
        <BrowserRouter>
            <ContextProvider>
                <Routes>
                    <Route path="*" element={<NotFound />} />
                    <Route path="/login" element={<Login />} />
                    <Route exact path="/" element={<Agenda />} />
                    {/* <Route exact path="/" element={<Home />} />
                    <Route path="/funcionarios" element={<Funcionarios />} />
                    <Route path="/servicos" element={<Servicos />} />
                    */}
                </Routes>
            </ContextProvider>
        </BrowserRouter>
    );
};

export default Navigation;
