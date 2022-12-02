import { AccountCircle } from "@mui/icons-material";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AppBar,
    Box,
    Button,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
const ENDPOINT = process.env.REACT_APP_ENDPOINT;

const Header = () => {
    const history = useNavigate();
    const [anchorElNav, setAnchorElNav] = useState(null);
    const pages = [
        // { name: "Funcionários", route: "/funcionarios" },
        // { name: "Agendamentos", route: "/" },
        // { name: "Serviços", route: "/servicos" },
        // { name: "Notícias", route: "/" },
        // { name: "Fórmula", route: "/" },
    ];

    const logout = () => {
        try {
            fetch(`${ENDPOINT}/logout`, {
                method: "POST",
                mode: "cors",
                headers: {
                    Authorization: `${localStorage.getItem("userToken")}`,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify({
                    token: localStorage.getItem("userToken"),
                }),
            })
                .then((res) => res.json())
                .then(
                    (result) => {
                        localStorage.setItem("userToken", "");
                        localStorage.setItem("userData", "");
                        // loginContext.dispatchLogin({
                        //     isLoggedIn: false,
                        //     session: null,
                        //     userData: null,
                        // });
                        history("/login");
                    },
                    (error) => {
                        console.error(error);
                    }
                );
        } catch (e) {
            console.error(e);
        }
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    return (
        <div className="user">
            <AppBar
                position="static"
                sx={{ backgroundColor: "#300202", padding: "20px 0" }}
            >
                <Container maxWidth="xl">
                    <Toolbar
                        disableGutters
                        sx={{ justifyContent: "space-between" }}
                    >
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                mr: 2,
                                display: { xs: "none", md: "flex" },
                                fontWeight: 700,
                                letterSpacing: ".1rem",
                                color: "inherit",
                                textDecoration: "none",
                            }}
                        >
                            Simetria
                        </Typography>
                        {localStorage.getItem("userToken") ? (
                            <>
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        display: { xs: "flex", md: "none" },
                                    }}
                                >
                                    <IconButton
                                        size="large"
                                        aria-label="account of current user"
                                        aria-controls="menu-appbar"
                                        aria-haspopup="true"
                                        onClick={handleOpenNavMenu}
                                        color="inherit"
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <Menu
                                        id="menu-appbar"
                                        anchorEl={anchorElNav}
                                        anchorOrigin={{
                                            vertical: "bottom",
                                            horizontal: "left",
                                        }}
                                        keepMounted
                                        transformOrigin={{
                                            vertical: "top",
                                            horizontal: "left",
                                        }}
                                        open={Boolean(anchorElNav)}
                                        onClose={handleCloseNavMenu}
                                        sx={{
                                            display: {
                                                xs: "block",
                                                md: "none",
                                            },
                                        }}
                                    >
                                        {pages.map((page, index) => (
                                            <MenuItem
                                                onClick={handleCloseNavMenu}
                                                key={index}
                                            >
                                                <Link
                                                    className="header-link"
                                                    to={page.route}
                                                >
                                                    <Typography textAlign="center">
                                                        {page.name}
                                                    </Typography>
                                                </Link>
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </Box>
                                <Typography
                                    variant="h6"
                                    noWrap
                                    component="a"
                                    sx={{
                                        mr: 2,
                                        display: { xs: "flex", md: "none" },
                                        flexGrow: 1,
                                        fontWeight: 700,
                                        letterSpacing: ".1rem",
                                        color: "inherit",
                                        textDecoration: "none",
                                    }}
                                >
                                    Simetria
                                </Typography>
                                <Box
                                    sx={{
                                        flexGrow: 1,
                                        display: { xs: "none", md: "flex" },
                                    }}
                                >
                                    {pages.map((page, index) => (
                                        <Link
                                            className="header-link"
                                            to={page.route}
                                            key={index}
                                        >
                                            <Button
                                                onClick={handleCloseNavMenu}
                                                sx={{
                                                    my: 2,
                                                    color: "white",
                                                    display: "block",
                                                }}
                                            >
                                                {page.name}
                                            </Button>
                                        </Link>
                                    ))}
                                </Box>
                                <AccountCircle
                                    fontSize="large"
                                    sx={{ marginRight: "10px" }}
                                />
                                <div className="user-login">
                                    <p>{`Olá, ${
                                        JSON.parse(
                                            localStorage.getItem("userData")
                                        ).name.split(" ")[0]
                                    }`}</p>
                                    <div>
                                        <span>Não é você?</span>
                                        {JSON.parse(
                                            localStorage.getItem("userData")
                                        ).id ? (
                                            <button
                                                className="logout"
                                                onClick={logout}
                                            >
                                                Sair
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <MenuItem>
                                <Button
                                    onClick={() => history("/login")}
                                    size="medium"
                                    variant="outlined"
                                    sx={{ backgroundColor: "#FFFFFF" }}
                                >
                                    Entrar
                                </Button>
                            </MenuItem>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
};

export default Header;
