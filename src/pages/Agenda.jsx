import { ThemeProvider } from "@emotion/react";
import {
    FormControl,
    CardActions,
    CardContent,
    Paper,
    TextField,
    createTheme,
    InputLabel,
    Select,
    MenuItem,
    Card,
    Typography,
    Tooltip,
    IconButton,
    Modal,
    Box,
    Button,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import FeedbackMessage from "../components/FeedbackMessage";
import Header from "../components/Header";
import NotAllowed from "../components/NotAllowed";
import { Context } from "../context";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircleOutline";
const ENDPOINT = process.env.REACT_APP_ENDPOINT;

const Agenda = () => {
    const loginContext = useContext(Context);
    const [accessDenied, setAcessDenied] = useState();
    const [employees, setEmployees] = useState([]);
    const [services, setServices] = useState([]);
    const [alreadySearched, setAlreadySearched] = useState(false);
    const [reserves, setReserves] = useState([]);
    const [professionalSelected, setProfessionalSelected] = useState("");
    const [nameProfessionalSelected, setNameProfessionalSelected] = useState();
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [clients, setClients] = useState([]);
    const [addNewClient, setAddNewClient] = useState(false);
    const [selectedReserve, setSelectedReserve] = useState();
    const [reserve, setReserve] = useState({
        date: "",
        beginTime: "",
        endTime: "",
        service: "",
        client: "",
    });

    const [feedbackMessage, setFeedbackMessage] = useState({
        message: "",
        messageType: "",
        visible: false,
    });

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

    const daysOfWeek = {
        Su: "D",
        Mo: "S",
        Tu: "T",
        We: "Q",
        Th: "Q",
        Fr: "S",
        Sa: "S",
    };

    const getInitialDate = () => {
        let today = new Date().getDay();
        if (today !== 0) return new Date();
        else if (today === 0) {
            return new Date(new Date().valueOf() + 1000 * 3600 * 24);
        }
    };

    const {
        control,
        handleSubmit,
        setValue,
        clearErrors,
        getValues,
        formState: { errors },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            date: getInitialDate(),
            professional: "",
            dateEdition: "",
            beginTime: "",
            endTime: "",
            service: "",
            client: "",
            clientNotRegistered: false,
            newClient: "",
            professionalModal: "",
            paid: false,
        },
    });

    const getClients = async () => {
        try {
            const response = await fetch(`${ENDPOINT}/admin/clientes`, {
                method: "GET",
                mode: "cors",
                headers: {
                    Authorization: loginContext.stateLogin.session,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
            });
            const result = await response.json();
            if (result.error) {
                setAcessDenied(true);
                localStorage.setItem("userToken", "");
                localStorage.setItem("userData", "");
                loginContext.dispatchLogin({
                    isLoggedIn: false,
                    session: null,
                    userData: null,
                });
                return;
            } else {
                setClients(result);
            }
        } catch (e) {}
    };

    const formatDbDate = (date, showDate, showTime) => {
        if (!date) return;
        let formattedDate;

        if (showDate) {
            formattedDate = `${date.getFullYear()}-${parseInt(
                date.getMonth() + 1
            ).toLocaleString("en-US", {
                minimumIntegerDigits: 2,
            })}-${date.getDate().toLocaleString("en-US", {
                minimumIntegerDigits: 2,
            })}`;
        }
        if (showTime && showDate) {
            formattedDate += " ";
        }
        if (showTime) {
            formattedDate += `${new Date(date)
                .getHours()
                .toLocaleString("en-US", {
                    minimumIntegerDigits: 2,
                })}:${new Date(date).getMinutes().toLocaleString("en-US", {
                minimumIntegerDigits: 2,
            })}`;
        }

        return formattedDate;
    };

    const formatDate = (date) => {
        if (!date) return;
        date = date.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
        let formattedDate;

        formattedDate = `${new Date(date).getHours().toLocaleString("en-US", {
            minimumIntegerDigits: 2,
        })}:${new Date(date).getMinutes().toLocaleString("en-US", {
            minimumIntegerDigits: 2,
        })}`;

        return formattedDate;
    };

    const isValidDate = (dateObj) => {
        return dateObj.getDay() !== 0 && !isNaN(new Date(dateObj).getDate());
    };

    const isNotAvailable = (date) => {
        return date.getDay() === 0;
    };

    const getEmployees = async () => {
        try {
            const response = await fetch(`${ENDPOINT}/admin/funcionarios`, {
                method: "GET",
                mode: "cors",
                headers: {
                    Authorization: loginContext.stateLogin.session,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
            });
            const result = await response.json();
            if (result.error) {
                setAcessDenied(true);
                localStorage.setItem("userToken", "");
                localStorage.setItem("userData", "");
                loginContext.dispatchLogin({
                    isLoggedIn: false,
                    session: null,
                    userData: null,
                });
                return;
            } else {
                setEmployees(result);
            }
        } catch (e) {}
    };

    const getReserves = async () => {
        try {
            const date = getValues("date");
            const formattedDate = `${date.getFullYear()}-${parseInt(
                date.getMonth() + 1
            ).toLocaleString("pt-BR", {
                minimumIntegerDigits: 2,
            })}-${date.getDate().toLocaleString("pt-BR", {
                minimumIntegerDigits: 2,
            })}`;
            const response = await fetch(
                `${ENDPOINT}/admin/agenda-profissional?data=${formattedDate}&funcionario=${getValues(
                    "professional"
                )}`,
                {
                    method: "GET",
                    mode: "cors",
                    headers: {
                        Authorization: loginContext.stateLogin.session,
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                }
            );
            const result = await response.json();
            setAlreadySearched(true);
            if (result.error) {
                setAcessDenied(true);
                localStorage.setItem("userToken", "");
                localStorage.setItem("userData", "");
                loginContext.dispatchLogin({
                    isLoggedIn: false,
                    session: null,
                    userData: null,
                });
                return;
            } else {
                setReserves(result);
            }
        } catch (e) {}
    };

    const formatStringDate = (date) => {
        return (
            date.split("-")[2] +
            "/" +
            date.split("-")[1] +
            "/" +
            date.split("-")[0]
        );
    };

    const handleClickDelete = (id) => {
        const filteredReserve = reserves.filter((reserve) => {
            return reserve.id === parseInt(id);
        })[0];

        setSelectedReserve(id);

        setReserve({
            date: formatStringDate(
                filteredReserve.dataInicio.split("T")[0],
                false,
                true
            ),
            beginTime: formatDate(filteredReserve.dataInicio),
            endTime: formatDate(filteredReserve.dataFim),
            service: filteredReserve.servico,
            client: filteredReserve.cliente,
        });
        setModalTitle("Cancelar agendamento");
        setModalOpen(true);
    };

    const deleteReserve = async () => {
        try {
            const response = await fetch(`${ENDPOINT}/admin/agendamento`, {
                method: "DELETE",
                mode: "cors",
                headers: {
                    Authorization: loginContext.stateLogin.session,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify({ id: selectedReserve }),
            });
            const result = await response.json();
            if (result === "Ok") {
                setModalOpen(false);
                showFeedbackMessage("Agendamento cancelado", "success", 6000);
                getReserves();
            } else {
                setAcessDenied(true);
                localStorage.setItem("userToken", "");
                localStorage.setItem("userData", "");
                loginContext.dispatchLogin({
                    isLoggedIn: false,
                    session: null,
                    userData: null,
                });
                return;
            }
        } catch (e) {
            setModalOpen(false);
            showFeedbackMessage(
                "Houve um erro ao cancelar o agendamento",
                "error",
                6000
            );
            getReserves();
            return;
        }
    };

    const handleClickEdition = (id) => {
        if (!services.length) {
            getServices();
        }
        const filteredReserve = reserves.filter((reserve) => {
            return reserve.id === parseInt(id);
        })[0];
        setSelectedReserve(id);
        setValue("dateEdition", getValues("date"));
        setValue("beginTime", formatDate(filteredReserve.dataInicio));
        setValue("endTime", formatDate(filteredReserve.dataFim));
        setValue("service", filteredReserve.idServico);
        setValue("professionalModal", professionalSelected);
        setValue("paid", Boolean(filteredReserve.pago));
        setValue("clientNotRegistered", false);
        clearErrors();
        setAddNewClient(false);
        setModalTitle("Editar agendamento");
        setModalOpen(true);
    };

    const checkIsLoggedIn = async () => {
        try {
            const response = await fetch(`${ENDPOINT}/admin/permission`, {
                method: "GET",
                mode: "cors",
                headers: {
                    Authorization: loginContext.stateLogin.session,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
            });
            const result = await response.json();
            if (result.error) {
                setAcessDenied(true);
                localStorage.setItem("userToken", "");
                localStorage.setItem("userData", "");
                loginContext.dispatchLogin({
                    isLoggedIn: false,
                    session: null,
                    userData: null,
                });
                return;
            } else {
                setAcessDenied(false);
                getEmployees();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getServices = async () => {
        try {
            const response = await fetch(`${ENDPOINT}/admin/lista-servicos`, {
                method: "GET",
                mode: "cors",
                headers: {
                    Authorization: `${loginContext.stateLogin.session}`,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
            });
            const result = await response.json();
            if (result.erro === "Usuário deslogado") {
                setAcessDenied(true);
                return;
            }
            setAcessDenied(false);
            setServices(result);
        } catch (e) {
            console.error(e);
        }
    };

    const sendReserve = async (formData) => {
        try {
            const method = modalTitle === "Editar agendamento" ? "PUT" : "POST";
            let body = {
                date: formatDbDate(formData.dateEdition, true, false),
                beginTime:
                    formatDbDate(formData.dateEdition, true, false) +
                    " " +
                    formData.beginTime +
                    ":00",
                endTime:
                    formatDbDate(formData.dateEdition, true, false) +
                    " " +
                    formData.endTime +
                    ":00",
                service: formData.service,
                professional: formData.professionalModal,
                paid: formData.paid,
            };

            if (method === "PUT") {
                body.agendamento = selectedReserve;
            }

            if (method === "POST") {
                body.client = formData.client || formData.newClient;
            }

            const response = await fetch(`${ENDPOINT}/admin/agendamento`, {
                method: method,
                mode: "cors",
                headers: {
                    Authorization: loginContext.stateLogin.session,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            setModalOpen(false);
            if (result === "Adicionado") {
                showFeedbackMessage("Agendamento adicionado", "success", 6000);
                getReserves();
                return;
            } else if (result === "Sucesso") {
                showFeedbackMessage("Agendamento alterado", "success", 6000);
                getReserves();
                return;
            } else {
                setAcessDenied(true);
                localStorage.setItem("userToken", "");
                localStorage.setItem("userData", "");
                loginContext.dispatchLogin({
                    isLoggedIn: false,
                    session: null,
                    userData: null,
                });
                return;
            }
        } catch (e) {
            showFeedbackMessage(
                "Houve um erro ao realizar a operação",
                "error",
                6000
            );
        }
    };

    useEffect(() => {
        checkIsLoggedIn();
        // eslint-disable-next-line
    }, []);

    return (
        <>
            <Header></Header>
            <FeedbackMessage
                message={feedbackMessage}
                hideTime={6000}
            ></FeedbackMessage>
            {accessDenied === undefined ? null : !accessDenied ? (
                <div className="background">
                    <div className="container-form">
                        <h1>Agenda</h1>
                        <form className="form">
                            <Controller
                                control={control}
                                rules={{
                                    required: true,
                                    validate: (value) => isValidDate(value),
                                }}
                                render={({
                                    field: { onChange, onBlur, value },
                                }) => (
                                    <ThemeProvider theme={theme}>
                                        <FormControl
                                            error={errors.date ? true : false}
                                            sx={{
                                                mb: 1,
                                                width: "100%",
                                                backgroundColor: "#FFFFFF",
                                                borderRadius: "5px",
                                            }}
                                            variant="outlined"
                                        >
                                            <LocalizationProvider
                                                dateAdapter={AdapterDateFns}
                                            >
                                                <ThemeProvider
                                                    theme={themeDefalut}
                                                >
                                                    <DatePicker
                                                        dayOfWeekFormatter={(
                                                            day
                                                        ) => daysOfWeek[day]}
                                                        inputFormat="dd/MM/yyyy"
                                                        label="Data"
                                                        value={value}
                                                        onBlur={onBlur}
                                                        theme={theme}
                                                        shouldDisableDate={
                                                            isNotAvailable
                                                        }
                                                        onChange={(e) => {
                                                            setValue("date", e);
                                                            if (
                                                                getValues(
                                                                    "date"
                                                                ) &&
                                                                getValues(
                                                                    "professional"
                                                                )
                                                            ) {
                                                                getReserves();
                                                            }
                                                        }}
                                                        renderInput={(
                                                            params
                                                        ) => (
                                                            <ThemeProvider
                                                                theme={theme}
                                                            >
                                                                <TextField
                                                                    {...params}
                                                                    error={
                                                                        errors.date
                                                                            ? true
                                                                            : false
                                                                    }
                                                                />
                                                            </ThemeProvider>
                                                        )}
                                                    />
                                                </ThemeProvider>
                                            </LocalizationProvider>
                                        </FormControl>
                                    </ThemeProvider>
                                )}
                                name="date"
                            ></Controller>
                            {errors.date?.type === "required" && (
                                <span className="fieldError">
                                    Selecione uma data
                                </span>
                            )}
                            {errors.date?.type === "validate" && (
                                <span className="fieldError">
                                    Selecione uma data válida
                                </span>
                            )}
                            <Controller
                                control={control}
                                render={({ field: { value } }) => (
                                    <FormControl
                                        sx={{
                                            mb: 1,
                                            mt: 1,
                                            width: "100%",
                                            backgroundColor: "#FFFFFF",
                                            borderRadius: "5px",
                                        }}
                                        variant="outlined"
                                    >
                                        <InputLabel
                                            sx={{ fontSize: "1.3rem" }}
                                            id="professional"
                                        >
                                            Profissional
                                        </InputLabel>
                                        <Select
                                            labelId="professional"
                                            id="professional-select"
                                            value={professionalSelected}
                                            label="Profissional"
                                            sx={{ fontSize: "1.3rem" }}
                                            onChange={(event) => {
                                                let employee =
                                                    event.target.value;
                                                setValue(
                                                    "professional",
                                                    employee
                                                );
                                                setProfessionalSelected(
                                                    employee
                                                );
                                                let employeeName =
                                                    employees.filter((e) => {
                                                        return (
                                                            e.id ===
                                                            event.target.value
                                                        );
                                                    });
                                                setNameProfessionalSelected(
                                                    employeeName[0].nome
                                                );
                                                clearErrors("professional");
                                                if (
                                                    getValues("date") &&
                                                    getValues("professional")
                                                ) {
                                                    getReserves();
                                                }
                                            }}
                                        >
                                            {employees
                                                ? employees.map(
                                                      (professional, index) => {
                                                          return (
                                                              <MenuItem
                                                                  sx={{
                                                                      fontSize:
                                                                          "1.3rem",
                                                                  }}
                                                                  key={index}
                                                                  value={
                                                                      professional.id
                                                                  }
                                                              >
                                                                  {
                                                                      professional.nome
                                                                  }
                                                              </MenuItem>
                                                          );
                                                      }
                                                  )
                                                : null}
                                        </Select>
                                    </FormControl>
                                )}
                                name="professional"
                            ></Controller>
                        </form>
                    </div>
                    {reserves?.length ? (
                        <div className="reserves">
                            {reserves.map((reserve) => {
                                let id = reserve.id.toString();
                                return (
                                    <Paper
                                        elevation={3}
                                        key={id}
                                        sx={{ width: "280px" }}
                                    >
                                        <Card
                                            sx={{
                                                boxShadow: "none",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                height: "100%",
                                            }}
                                        >
                                            <CardContent>
                                                <Typography
                                                    sx={{
                                                        fontSize: 18,
                                                        color: "#000000",
                                                    }}
                                                    gutterBottom
                                                >
                                                    {`Horário: ${formatDate(
                                                        reserve.dataInicio
                                                    )} - ${formatDate(
                                                        reserve.dataFim
                                                    )}`}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: 18,
                                                    }}
                                                    gutterBottom
                                                >
                                                    {`Cliente: ${reserve.cliente}`}
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        fontSize: 18,
                                                    }}
                                                    gutterBottom
                                                >{`Serviço: ${reserve.servico}`}</Typography>
                                            </CardContent>
                                            <CardActions
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    gap: "10px",
                                                }}
                                            >
                                                {console.log(
                                                    new Date() <
                                                        new Date(
                                                            reserve.dataFim
                                                        ),
                                                    new Date(reserve.dataFim),
                                                    new Date()
                                                )}
                                                {new Date() <
                                                    new Date(
                                                        reserve.dataFim
                                                    ) && (
                                                    <Tooltip title="Cancelar">
                                                        <IconButton
                                                            color="error"
                                                            onClick={(e) => {
                                                                handleClickDelete(
                                                                    id
                                                                );
                                                            }}
                                                        >
                                                            <DeleteIcon color="error" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        onClick={() => {
                                                            handleClickEdition(
                                                                id
                                                            );
                                                        }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </CardActions>
                                        </Card>
                                    </Paper>
                                );
                            })}
                        </div>
                    ) : (
                        alreadySearched && <h1>Não há agendamentos</h1>
                    )}
                    <Tooltip title="Adicionar">
                        <IconButton
                            sx={{
                                position: "fixed",
                                zIndex: 40,
                                bottom: "20px",
                                right: 0,
                            }}
                            onClick={() => {
                                if (!services.length) {
                                    getServices();
                                }
                                setSelectedReserve("");
                                setValue("dateEdition", "");
                                setValue("beginTime", "");
                                setValue("endTime", "");
                                setValue("service", "");
                                setValue("client", "");
                                setValue("clientNotRegistered", false);
                                setValue("professionalModal", "");
                                setValue("paid", false);
                                clearErrors();
                                setAddNewClient(false);
                                setModalTitle("Adicionar agendamento");
                                if (!clients.length) {
                                    getClients();
                                }
                                setModalOpen(true);
                            }}
                        >
                            <AddCircleIcon
                                sx={{
                                    fontSize: { xs: "3rem", md: "4rem" },
                                }}
                                color="primary"
                            />
                        </IconButton>
                    </Tooltip>

                    {modalOpen ? (
                        <Modal
                            keepMounted
                            open={modalOpen}
                            onClose={() => setModalOpen(false)}
                        >
                            <Box sx={modal}>
                                <Typography
                                    sx={{ marginBottom: "20px" }}
                                    variant="h5"
                                    component="h2"
                                >
                                    {modalTitle}
                                </Typography>
                                {modalTitle === "Cancelar agendamento" && (
                                    <>
                                        <Typography
                                            sx={{ marginBottom: "20px" }}
                                            variant="h5"
                                            component="h5"
                                        >
                                            Deseja cancelar o seguinte
                                            agendamento?
                                        </Typography>
                                        <Typography>
                                            {`Horário: ${reserve.date} (${reserve.beginTime} - ${reserve.endTime})`}
                                        </Typography>
                                        <Typography>
                                            {`Cliente: ${reserve.client}`}
                                        </Typography>
                                        <Typography>
                                            {`Serviço: ${reserve.service}`}
                                        </Typography>
                                        <Typography>
                                            {`Profissional: ${nameProfessionalSelected}`}
                                        </Typography>
                                        <div className="options-modal">
                                            <Button
                                                variant="contained"
                                                size="medium"
                                                color="info"
                                                onClick={() => {
                                                    deleteReserve();
                                                }}
                                            >
                                                Sim
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="medium"
                                                color="error"
                                                onClick={() => {
                                                    setModalOpen(false);
                                                }}
                                            >
                                                Fechar
                                            </Button>
                                        </div>
                                    </>
                                )}
                                {modalTitle !== "Cancelar agendamento" && (
                                    <div className="edition-area">
                                        <form
                                            onSubmit={handleSubmit((data) => {
                                                sendReserve(data);
                                            })}
                                        >
                                            <div className="form-data">
                                                <div className="form-div">
                                                    <Controller
                                                        sx={{
                                                            marginBottom: 1,
                                                        }}
                                                        control={control}
                                                        rules={{
                                                            required: true,
                                                            validate: (value) =>
                                                                isValidDate(
                                                                    value
                                                                ) &&
                                                                (new Date(
                                                                    value
                                                                ) >=
                                                                    new Date().setHours(
                                                                        0,
                                                                        0,
                                                                        0,
                                                                        0
                                                                    ) ||
                                                                    new Date(
                                                                        value
                                                                    ).toLocaleString(
                                                                        "pt-BR",
                                                                        {
                                                                            timeZone:
                                                                                "America/Sao_Paulo",
                                                                        }
                                                                    ) ===
                                                                        new Date(
                                                                            getValues(
                                                                                "date"
                                                                            )
                                                                        ).toLocaleString(
                                                                            "pt-BR",
                                                                            {
                                                                                timeZone:
                                                                                    "America/Sao_Paulo",
                                                                            }
                                                                        )),
                                                        }}
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                onBlur,
                                                                value,
                                                            },
                                                        }) => (
                                                            <LocalizationProvider
                                                                dateAdapter={
                                                                    AdapterDateFns
                                                                }
                                                            >
                                                                <DatePicker
                                                                    dayOfWeekFormatter={(
                                                                        day
                                                                    ) =>
                                                                        daysOfWeek[
                                                                            day
                                                                        ]
                                                                    }
                                                                    inputFormat="dd/MM/yyyy"
                                                                    label="Data"
                                                                    value={
                                                                        value
                                                                    }
                                                                    minDate={new Date().setHours(
                                                                        0,
                                                                        0,
                                                                        0,
                                                                        0
                                                                    )}
                                                                    shouldDisableDate={
                                                                        isNotAvailable
                                                                    }
                                                                    onChange={
                                                                        onChange
                                                                    }
                                                                    renderInput={(
                                                                        params
                                                                    ) => (
                                                                        <TextField
                                                                            {...params}
                                                                            variant="standard"
                                                                            error={
                                                                                errors.dateEdition
                                                                                    ? true
                                                                                    : false
                                                                            }
                                                                        />
                                                                    )}
                                                                />
                                                            </LocalizationProvider>
                                                        )}
                                                        name="dateEdition"
                                                    ></Controller>
                                                    {errors.dateEdition
                                                        ?.type ===
                                                        "required" && (
                                                        <span className="fieldError">
                                                            Selecione uma data
                                                        </span>
                                                    )}
                                                    {errors.dateEdition
                                                        ?.type ===
                                                        "validate" && (
                                                        <span className="fieldError">
                                                            Selecione uma data
                                                            válida
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="form-div">
                                                    <Controller
                                                        sx={{
                                                            marginBottom: 1,
                                                        }}
                                                        control={control}
                                                        rules={{
                                                            required: true,
                                                            pattern:
                                                                /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
                                                            validate: (value) =>
                                                                new Date().setHours(
                                                                    getValues(
                                                                        "endTime"
                                                                    ).split(
                                                                        ":"
                                                                    )[0],
                                                                    getValues(
                                                                        "endTime"
                                                                    ).split(
                                                                        ":"
                                                                    )[1]
                                                                ) >
                                                                    new Date().setHours(
                                                                        getValues(
                                                                            "beginTime"
                                                                        ).split(
                                                                            ":"
                                                                        )[0],
                                                                        getValues(
                                                                            "beginTime"
                                                                        ).split(
                                                                            ":"
                                                                        )[1]
                                                                    ) ||
                                                                getValues(
                                                                    "endTime"
                                                                ) === "",
                                                        }}
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                onBlur,
                                                                value,
                                                            },
                                                        }) => (
                                                            <TextField
                                                                value={value}
                                                                onChange={
                                                                    onChange
                                                                }
                                                                onBlur={onBlur}
                                                                maxLength="5"
                                                                label={
                                                                    "Horário início"
                                                                }
                                                                variant="standard"
                                                                error={Boolean(
                                                                    errors?.beginTime
                                                                )}
                                                            />
                                                        )}
                                                        name="beginTime"
                                                    ></Controller>
                                                    {errors.beginTime?.type ===
                                                        "required" && (
                                                        <span className="fieldError">
                                                            Informe o horário
                                                        </span>
                                                    )}
                                                    {errors.beginTime?.type ===
                                                        "pattern" && (
                                                        <span className="fieldError">
                                                            Digite a hora no
                                                            formato HH:MM
                                                        </span>
                                                    )}
                                                    {errors.beginTime?.type ===
                                                        "validate" && (
                                                        <span className="fieldError">
                                                            O horário de fim
                                                            deve ser maior que o
                                                            horário de início
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="form-div">
                                                    <Controller
                                                        sx={{
                                                            marginBottom: 1,
                                                        }}
                                                        control={control}
                                                        rules={{
                                                            required: true,
                                                            pattern:
                                                                /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/,
                                                            validate: (value) =>
                                                                new Date().setHours(
                                                                    getValues(
                                                                        "endTime"
                                                                    ).split(
                                                                        ":"
                                                                    )[0],
                                                                    getValues(
                                                                        "endTime"
                                                                    ).split(
                                                                        ":"
                                                                    )[1]
                                                                ) >
                                                                    new Date().setHours(
                                                                        getValues(
                                                                            "beginTime"
                                                                        ).split(
                                                                            ":"
                                                                        )[0],
                                                                        getValues(
                                                                            "beginTime"
                                                                        ).split(
                                                                            ":"
                                                                        )[1]
                                                                    ) ||
                                                                getValues(
                                                                    "beginTime"
                                                                ) === "",
                                                        }}
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                onBlur,
                                                                value,
                                                            },
                                                        }) => (
                                                            <TextField
                                                                label={
                                                                    "Horário fim"
                                                                }
                                                                maxLength="5"
                                                                variant="standard"
                                                                value={value}
                                                                onChange={
                                                                    onChange
                                                                }
                                                                onBlur={onBlur}
                                                                error={Boolean(
                                                                    errors?.endTime
                                                                )}
                                                            />
                                                        )}
                                                        name="endTime"
                                                    ></Controller>
                                                    {errors.endTime?.type ===
                                                        "required" && (
                                                        <span className="fieldError">
                                                            Informe o horário
                                                        </span>
                                                    )}
                                                    {errors.endTime?.type ===
                                                        "pattern" && (
                                                        <span className="fieldError">
                                                            Digite a hora no
                                                            formato HH:MM
                                                        </span>
                                                    )}
                                                    {errors.endTime?.type ===
                                                        "validate" && (
                                                        <span className="fieldError">
                                                            O horário de fim
                                                            deve ser maior que o
                                                            horário de início
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="form-div">
                                                    <Controller
                                                        sx={{
                                                            marginBottom: 1,
                                                        }}
                                                        control={control}
                                                        rules={{
                                                            required: true,
                                                        }}
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                onBlur,
                                                                value,
                                                            },
                                                        }) => (
                                                            <FormControl>
                                                                <InputLabel
                                                                    id="service"
                                                                    sx={{
                                                                        left: "-15px",
                                                                        top: "5px",
                                                                    }}
                                                                    error={Boolean(
                                                                        errors?.service
                                                                    )}
                                                                >
                                                                    Serviço
                                                                </InputLabel>
                                                                <Select
                                                                    sx={{
                                                                        textOverflow:
                                                                            "ellipsis",
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                        overflow:
                                                                            "hidden",
                                                                        maxWidth:
                                                                            {
                                                                                md: "200px",
                                                                            },
                                                                    }}
                                                                    labelId="service"
                                                                    variant="standard"
                                                                    id="service-select"
                                                                    value={
                                                                        value
                                                                    }
                                                                    onChange={
                                                                        onChange
                                                                    }
                                                                    error={Boolean(
                                                                        errors?.service
                                                                    )}
                                                                >
                                                                    {services.map(
                                                                        (
                                                                            service
                                                                        ) => {
                                                                            return (
                                                                                <MenuItem
                                                                                    key={
                                                                                        service.id
                                                                                    }
                                                                                    value={
                                                                                        service.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        service.nome
                                                                                    }
                                                                                </MenuItem>
                                                                            );
                                                                        }
                                                                    )}
                                                                </Select>
                                                                {errors.service
                                                                    ?.type ===
                                                                    "required" && (
                                                                    <span className="fieldError">
                                                                        Selecione
                                                                        o
                                                                        serviço
                                                                    </span>
                                                                )}
                                                            </FormControl>
                                                        )}
                                                        name="service"
                                                    ></Controller>
                                                </div>
                                                <div className="form-div">
                                                    <Controller
                                                        sx={{
                                                            marginBottom: 1,
                                                        }}
                                                        control={control}
                                                        rules={{
                                                            required: true,
                                                        }}
                                                        render={({
                                                            field: {
                                                                value,
                                                                onChange,
                                                            },
                                                        }) => (
                                                            <FormControl variant="standard">
                                                                <InputLabel
                                                                    id="professionalModal"
                                                                    error={Boolean(
                                                                        errors?.professionalModal
                                                                    )}
                                                                >
                                                                    Profissional
                                                                </InputLabel>
                                                                <Select
                                                                    sx={{
                                                                        textOverflow:
                                                                            "ellipsis",
                                                                        whiteSpace:
                                                                            "nowrap",
                                                                        overflow:
                                                                            "hidden",
                                                                        maxWidth:
                                                                            {
                                                                                md: "200px",
                                                                            },
                                                                    }}
                                                                    labelId="professionalModal"
                                                                    id="professional-select-modal"
                                                                    value={
                                                                        value
                                                                    }
                                                                    label="Profissional"
                                                                    onChange={
                                                                        onChange
                                                                    }
                                                                    error={Boolean(
                                                                        errors?.professionalModal
                                                                    )}
                                                                >
                                                                    {employees
                                                                        ? employees.map(
                                                                              (
                                                                                  professional,
                                                                                  index
                                                                              ) => {
                                                                                  return (
                                                                                      <MenuItem
                                                                                          key={
                                                                                              index
                                                                                          }
                                                                                          value={
                                                                                              professional.id
                                                                                          }
                                                                                      >
                                                                                          {
                                                                                              professional.nome
                                                                                          }
                                                                                      </MenuItem>
                                                                                  );
                                                                              }
                                                                          )
                                                                        : null}
                                                                </Select>
                                                                {errors
                                                                    .professionalModal
                                                                    ?.type ===
                                                                    "required" && (
                                                                    <span className="fieldError">
                                                                        Selecione
                                                                        o
                                                                        profissional
                                                                    </span>
                                                                )}
                                                            </FormControl>
                                                        )}
                                                        name="professionalModal"
                                                    ></Controller>
                                                </div>
                                                <div className="checkbox-form">
                                                    <Controller
                                                        sx={{
                                                            marginBottom: 1,
                                                        }}
                                                        control={control}
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                onBlur,
                                                                value,
                                                            },
                                                        }) => (
                                                            <FormControlLabel
                                                                sx={{
                                                                    alignItems:
                                                                        "flex-end",
                                                                    m: {
                                                                        xs: "0",
                                                                    },
                                                                }}
                                                                control={
                                                                    <Checkbox
                                                                        sx={{
                                                                            p: 0,
                                                                            mr: 1,
                                                                        }}
                                                                        checked={
                                                                            value
                                                                        }
                                                                        onChange={
                                                                            onChange
                                                                        }
                                                                    />
                                                                }
                                                                label="Pago"
                                                            />
                                                        )}
                                                        name="paid"
                                                    />
                                                </div>
                                                {modalTitle ===
                                                    "Adicionar agendamento" && (
                                                    <>
                                                        {!addNewClient && (
                                                            <div className="form-div">
                                                                <Controller
                                                                    sx={{
                                                                        marginBottom: 1,
                                                                        minWidth:
                                                                            "50px",
                                                                    }}
                                                                    control={
                                                                        control
                                                                    }
                                                                    rules={{
                                                                        required:
                                                                            !addNewClient,
                                                                    }}
                                                                    render={({
                                                                        field: {
                                                                            onChange,
                                                                            onBlur,
                                                                            value,
                                                                        },
                                                                    }) => (
                                                                        <FormControl>
                                                                            <InputLabel
                                                                                sx={{
                                                                                    left: "-15px",
                                                                                    top: "5px",
                                                                                }}
                                                                                id="client"
                                                                                error={Boolean(
                                                                                    errors?.client
                                                                                )}
                                                                            >
                                                                                Cliente
                                                                            </InputLabel>
                                                                            <Select
                                                                                sx={{
                                                                                    textOverflow:
                                                                                        "ellipsis",
                                                                                    whiteSpace:
                                                                                        "nowrap",
                                                                                    overflow:
                                                                                        "hidden",
                                                                                    maxWidth:
                                                                                        {
                                                                                            md: "200px",
                                                                                        },
                                                                                }}
                                                                                labelId="client"
                                                                                id="client"
                                                                                variant="standard"
                                                                                error={Boolean(
                                                                                    errors?.client
                                                                                )}
                                                                                value={
                                                                                    value
                                                                                }
                                                                                label="Cliente"
                                                                                onChange={
                                                                                    onChange
                                                                                }
                                                                                onBlur={
                                                                                    onBlur
                                                                                }
                                                                            >
                                                                                {clients.length &&
                                                                                    clients.map(
                                                                                        (
                                                                                            client,
                                                                                            index
                                                                                        ) => {
                                                                                            return (
                                                                                                <MenuItem
                                                                                                    key={
                                                                                                        index
                                                                                                    }
                                                                                                    value={
                                                                                                        client.id
                                                                                                    }
                                                                                                >
                                                                                                    {`${client.nome} (${client.email})`}
                                                                                                </MenuItem>
                                                                                            );
                                                                                        }
                                                                                    )}
                                                                            </Select>
                                                                        </FormControl>
                                                                    )}
                                                                    name="client"
                                                                ></Controller>
                                                                {errors.client
                                                                    ?.type ===
                                                                    "required" && (
                                                                    <span className="fieldError">
                                                                        Informe
                                                                        o
                                                                        cliente
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="checkbox-form">
                                                            <Controller
                                                                sx={{
                                                                    marginBottom: 1,
                                                                }}
                                                                control={
                                                                    control
                                                                }
                                                                render={({
                                                                    field: {
                                                                        onChange,
                                                                        onBlur,
                                                                        value,
                                                                    },
                                                                }) => (
                                                                    <FormControlLabel
                                                                        sx={{
                                                                            alignItems:
                                                                                "flex-end",
                                                                            m: {
                                                                                xs: "0",
                                                                            },
                                                                        }}
                                                                        control={
                                                                            <Checkbox
                                                                                sx={{
                                                                                    p: 0,
                                                                                    mr: 1,
                                                                                }}
                                                                                value={
                                                                                    value
                                                                                }
                                                                                onChange={(
                                                                                    event
                                                                                ) => {
                                                                                    setAddNewClient(
                                                                                        event
                                                                                            .target
                                                                                            .checked
                                                                                    );
                                                                                    setValue(
                                                                                        "clientNotRegistered",
                                                                                        event
                                                                                            .target
                                                                                            .checked
                                                                                    );
                                                                                    setValue(
                                                                                        "client",
                                                                                        ""
                                                                                    );
                                                                                }}
                                                                            />
                                                                        }
                                                                        label="Não encontrei o cliente"
                                                                    />
                                                                )}
                                                                name="clientNotRegistered"
                                                            />
                                                        </div>
                                                        {addNewClient && (
                                                            <div className="form-div">
                                                                <Controller
                                                                    maxLength="60"
                                                                    sx={{
                                                                        marginBottom: 1,
                                                                    }}
                                                                    control={
                                                                        control
                                                                    }
                                                                    rules={{
                                                                        required: true,
                                                                        pattern:
                                                                            /^[a-zA-Z]*( [a-zA-Z]*)+$/,
                                                                        validate:
                                                                            (
                                                                                value
                                                                            ) =>
                                                                                value.trim() !==
                                                                                "",
                                                                    }}
                                                                    render={({
                                                                        field: {
                                                                            onChange,
                                                                            onBlur,
                                                                            value,
                                                                        },
                                                                    }) => (
                                                                        <TextField
                                                                            value={
                                                                                value
                                                                            }
                                                                            onChange={
                                                                                onChange
                                                                            }
                                                                            onBlur={
                                                                                onBlur
                                                                            }
                                                                            label={
                                                                                "Cliente"
                                                                            }
                                                                            maxLength="60"
                                                                            variant="standard"
                                                                            error={
                                                                                errors.newClient
                                                                                    ? true
                                                                                    : false
                                                                            }
                                                                        />
                                                                    )}
                                                                    name="newClient"
                                                                ></Controller>
                                                                {errors
                                                                    .newClient
                                                                    ?.type ===
                                                                    "required" ||
                                                                    (errors
                                                                        .newClient
                                                                        ?.type ===
                                                                        "validate" && (
                                                                        <span className="fieldError">
                                                                            Informe
                                                                            o
                                                                            cliente
                                                                        </span>
                                                                    ))}
                                                                {errors
                                                                    .newClient
                                                                    ?.type ===
                                                                    "pattern" && (
                                                                    <span className="fieldError">
                                                                        Digite o
                                                                        nome
                                                                        completo,
                                                                        apenas
                                                                        com
                                                                        letras
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className="options-modal">
                                                <input
                                                    type="submit"
                                                    value={
                                                        modalTitle.split(
                                                            " "
                                                        )[0] === "Editar"
                                                            ? "Salvar"
                                                            : "Adicionar"
                                                    }
                                                ></input>
                                                <Button
                                                    variant="contained"
                                                    size="medium"
                                                    color="error"
                                                    onClick={() => {
                                                        setModalOpen(false);
                                                    }}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </Box>
                        </Modal>
                    ) : null}
                </div>
            ) : (
                <NotAllowed />
            )}
        </>
    );
};

const theme = createTheme({
    typography: {
        htmlFontSize: 13,
    },
});

const themeDefalut = createTheme({
    typography: {},
});

const modal = {
    position: "absolute",
    bgcolor: "#FFFFFF",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: 200,
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
};

export default Agenda;
