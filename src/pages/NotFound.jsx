import { Link } from "react-router-dom";
import Header from "../components/Header";

const NotFound = () => {
    return (
        <>
            <Header></Header>
            <div className="not-found">
                <h1 className="error-404">404</h1>
                <h1>Ops! Página não encontrada</h1>
                <h2>A página que você tentou acessar não existe</h2>
                <button className="mainButton">
                    <Link className="not-found-link" to="/">
                        HOME
                    </Link>
                </button>
            </div>
        </>
    );
};
export default NotFound;
