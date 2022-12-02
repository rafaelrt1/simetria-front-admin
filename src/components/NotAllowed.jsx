import { Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

const NotAllowed = () => {
    return (
        <div className="container-form-not-allowed">
            <Container maxWidth="xl" sx={{ justifyContent: "center" }}>
                <h1 className="not-allowed-label">
                    Não é possível acessar essa página
                </h1>
                <div className="not-allowed-options">
                    <Link to="/login" className="not-found-link">
                        <Button
                            size="medium"
                            variant="outlined"
                            sx={{ backgroundColor: "#FFFFFF" }}
                        >
                            Entrar
                        </Button>
                    </Link>
                </div>
            </Container>
        </div>
    );
};

export default NotAllowed;
