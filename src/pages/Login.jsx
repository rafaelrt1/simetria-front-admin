import {
    Box,
    Button,
    CircularProgress,
    Container,
    TextField,
} from "@mui/material";
import { useContext, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import FeedbackMessage from "../components/FeedbackMessage";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Context } from "../context";
const ENDPOINT = process.env.REACT_APP_ENDPOINT;

const Login = () => {
    const [visibleLoader, setVisibleLoader] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const [feedbackMessage, setFeedbackMessage] = useState({
        message: "",
        messageType: "",
        visible: false,
    });

    const history = useNavigate();
    const loginContext = useContext(Context);

    const showFeedbackMessage = (message, type, time) => {
        setFeedbackMessage({
            message: message,
            messageType: type,
            visible: true,
        });
        setTimeout(() => {
            setFeedbackMessage({
                message: "",
                messageType: "",
                visible: false,
            });
        }, time);
    };

    const tryLogin = (data, e) => {
        try {
            setVisibleLoader(true);
            fetch(`${ENDPOINT}/admin/login`, {
                method: "POST",
                mode: "cors",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify({
                    username: data.email,
                    password: data.password,
                }),
            })
                .then((res) => res.json())
                .then(
                    (result) => {
                        if (result.session) {
                            localStorage.setItem("userToken", result.session);
                            localStorage.setItem(
                                "userData",
                                JSON.stringify(result.userData)
                            );
                            loginContext.dispatchLogin({
                                isLoggedIn: true,
                                session: result.session,
                                userData: result.userData,
                            });
                            setVisibleLoader(false);
                            history("/");
                        } else {
                            setVisibleLoader(false);
                            window.scrollTo(0, 0);
                            showFeedbackMessage(
                                "Usuário ou senha incorretos",
                                "error",
                                6000
                            );
                        }
                    },
                    (error) => {
                        console.error(error);
                        setVisibleLoader(false);
                        window.scrollTo(0, 0);
                        showFeedbackMessage(
                            "Usuário ou senha incorretos",
                            "error",
                            6000
                        );
                    }
                );
        } catch (e) {
            console.error(e);
            setVisibleLoader(false);
        }
    };

    return (
        <Container>
            <FeedbackMessage
                message={feedbackMessage}
                hideTime={6000}
            ></FeedbackMessage>
            <div className="image">
                <img
                    className="tinyLogo"
                    src={require("../images/Simetria.png")}
                    alt="Logo Simetria"
                />
                <h1 className="simetriaName">
                    Administração - Agenda Simetria
                </h1>
            </div>
            <form onSubmit={handleSubmit(tryLogin)} className="form">
                <Box
                    component="form"
                    sx={{
                        marginTop: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "20px",
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <h3 className="login-label">Login</h3>
                    <Controller
                        control={control}
                        rules={{ maxLength: 60, required: true }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                sx={{ minWidth: "270px" }}
                                id="email"
                                label="E-mail"
                                variant="standard"
                                maxLength={60}
                                onChange={onChange}
                                autoComplete="username"
                            />
                        )}
                        name="email"
                    ></Controller>
                    <Controller
                        control={control}
                        rules={{ maxLength: 60, required: true }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <div className="password">
                                <TextField
                                    sx={{ minWidth: "270px" }}
                                    id="password"
                                    type={passwordVisible ? "text" : "password"}
                                    autoComplete="current-password"
                                    label="Senha"
                                    variant="standard"
                                    maxLength={60}
                                    onChange={onChange}
                                />
                                <div className="password-input">
                                    {passwordVisible ? (
                                        <VisibilityIcon
                                            onClick={() =>
                                                setPasswordVisible(false)
                                            }
                                        ></VisibilityIcon>
                                    ) : (
                                        <VisibilityOffIcon
                                            onClick={() =>
                                                setPasswordVisible(true)
                                            }
                                        ></VisibilityOffIcon>
                                    )}
                                </div>
                            </div>
                        )}
                        name="password"
                    ></Controller>
                    <Button
                        type="submit"
                        variant="contained"
                        onClick={handleSubmit(tryLogin)}
                    >
                        Entrar
                    </Button>
                    {visibleLoader ? <CircularProgress /> : null}
                </Box>
            </form>
        </Container>
    );
};

export default Login;
