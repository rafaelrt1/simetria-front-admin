import {
    Button,
    Checkbox,
    FormControlLabel,
    Modal,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import NotAllowed from "../components/NotAllowed";
import EnhancedTable from "../components/Table";
import { Context } from "../context";
const ENDPOINT = process.env.REACT_APP_ENDPOINT;

const Funcionarios = () => {
    const [accessDenied, setAcessDenied] = useState();
    const [employees, setEmployees] = useState([]);
    const [employee, setEmployee] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalText, setModalText] = useState("");
    const [active, setActive] = useState(false);

    const {
        register,
        clearErrors,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm();

    const onSubmit = (data) => {
        if (data.name) editEmployee(data);
    };

    const loginContext = useContext(Context);
    const history = useNavigate();

    // const formConfigs = [{ label: "Nome", type: "string" }];

    const changeModalOpen = (value) => {
        setModalOpen(value);
    };

    const handleChange = (event) => {
        setActive(event.target.checked);
    };

    const handleEdition = (id) => {
        if (!id) {
            setEmployee("");
            // setValue("active", 1);
            setValue("name", "");
            return;
        }
        setEmployee(id);
        clearErrors("name");
        const selectedValue = employees.filter((data) => {
            return data.id === id;
        })[0];
        setActive(Boolean(selectedValue.ativo));
        setValue("name", selectedValue.nome);
    };

    const getEmployees = async () => {
        const request = await fetch(`${ENDPOINT}/admin/funcionarios`, {
            method: "GET",
            mode: "cors",
            headers: {
                Authorization: loginContext.stateLogin.session,
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
            },
        });
        const response = await request.json();
        if (response.erro) {
            setAcessDenied(true);
            localStorage.setItem("userToken", "");
            localStorage.setItem("userData", "");
            loginContext.dispatchLogin({
                isLoggedIn: false,
                session: null,
                userData: null,
            });
            history("/login");
            return;
        } else {
            setAcessDenied(false);
            setEmployees(response);
        }
    };

    useEffect(() => {
        handleSubmit(onSubmit)();
        getEmployees();
    }, []);

    const deleteEmployees = async (itemsToDelete) => {
        try {
            const request = await fetch(`${ENDPOINT}/admin/funcionarios`, {
                method: "DELETE",
                mode: "cors",
                headers: {
                    Authorization: loginContext.stateLogin.session,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify({ itemsToDelete: itemsToDelete }),
            });
            const response = await request.json();
            setModalOpen(false);
            if (response.erro) {
                setAcessDenied(true);
                localStorage.setItem("userToken", "");
                localStorage.setItem("userData", "");
                loginContext.dispatchLogin({
                    isLoggedIn: false,
                    session: null,
                    userData: null,
                });
                history("/login");
                return;
            } else {
                setAcessDenied(false);
                setEmployees(response);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const editEmployee = async (data) => {
        try {
            let body = data;
            body.active = active ? 1 : 0;
            if (employee) {
                body.id = employee;
            }
            const method = employee ? "PUT" : "POST";
            const request = await fetch(`${ENDPOINT}/admin/funcionario`, {
                method: method,
                mode: "cors",
                headers: {
                    Authorization: loginContext.stateLogin.session,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
                body: JSON.stringify(body),
            });
            const response = await request.json();
            setModalOpen(false);
            if (Array.isArray(response) && !response.error) {
                setEmployees(response);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const addEmployee = () => {
        try {
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <Header></Header>
            {accessDenied === undefined ? null : !accessDenied ? (
                <div className="table">
                    {employees?.length ? (
                        <>
                            <EnhancedTable
                                setModalText={setModalText}
                                items={employees}
                                editionHandler={editEmployee}
                                deleteHandler={deleteEmployees}
                                addHandler={addEmployee}
                                handleEdition={handleEdition}
                                tableMainTitle={"Funcionários"}
                                // form={control}
                                // field={field}
                                // fieldState={fieldState}
                                setValue={setValue}
                                errors={errors}
                                // handleSubmit={handleSubmit}
                                checkboxGroupItems={[]}
                                changeModalOpen={changeModalOpen}
                                // getValues={getValues}
                                // formConfigs={formConfigs}
                                headCells={[
                                    {
                                        id: "name",
                                        dataType: "string",
                                        numeric: false,
                                        disablePadding: true,
                                        label: "Nome",
                                    },
                                    {
                                        id: "active",
                                        dataType: "checkbox",
                                        numeric: false,
                                        disablePadding: true,
                                        label: "Ativo",
                                    },
                                ]}
                            ></EnhancedTable>
                        </>
                    ) : (
                        <p>Nenhum profissional cadastrado</p>
                    )}
                    <div>
                        {modalOpen ? (
                            <Modal
                                keepMounted
                                open={modalOpen}
                                onClose={() => setModalOpen(false)}
                                // aria-labelledby="keep-mounted-modal-title"
                                // aria-describedby="keep-mounted-modal-description"
                            >
                                <Box sx={modal}>
                                    <Typography
                                        sx={{ marginBottom: "20px" }}
                                        // id="keep-mounted-modal-title"
                                        variant="h5"
                                        component="h2"
                                    >
                                        {modalText}
                                    </Typography>
                                    <div className="edition-area">
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <div className="form-data">
                                                <FormControlLabel
                                                    label="Ativo"
                                                    labelPlacement="top"
                                                    control={
                                                        <Switch
                                                            checked={active}
                                                            onChange={(event) =>
                                                                setActive(
                                                                    event.target
                                                                        .checked
                                                                )
                                                            }
                                                            // {...register(
                                                            //     "active",
                                                            //     {}
                                                            // )}
                                                        />
                                                    }
                                                />
                                                <div>
                                                    <TextField
                                                        label={"Nome*"}
                                                        variant="standard"
                                                        {...register("name", {
                                                            required: true,
                                                            maxLength: 20,
                                                            pattern:
                                                                /^[A-Za-z ]+$/i,
                                                        })}
                                                        error={Boolean(
                                                            errors?.name
                                                        )}
                                                    />
                                                    {errors?.name?.type ===
                                                        "required" && (
                                                        <p className="fieldError">
                                                            Preencha este campo
                                                        </p>
                                                    )}
                                                    {errors?.name?.type ===
                                                        "maxLength" && (
                                                        <p className="fieldError">
                                                            Não pode ter mais de
                                                            20 letras
                                                        </p>
                                                    )}
                                                    {errors?.name?.type ===
                                                        "pattern" && (
                                                        <p className="fieldError">
                                                            São permitidas
                                                            apenas letras
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="options-modal">
                                                <input type="submit" />
                                                {/* <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="medium"
                                                    color="success"
                                                    disabled={Boolean(
                                                        errors?.name
                                                    )}
                                                    onClick={() => {
                                                        console.log(
                                                            handleSubmit(
                                                                onSubmit
                                                            )
                                                        );
                                                        editEmployee();
                                                    }}
                                                >
                                                    {modalText.split(" ")[0] ===
                                                    "Editar"
                                                        ? "Salvar"
                                                        : "Adicionar"}
                                                </Button> */}
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
                                        {/* {Object.keys(getValues()).map(
                                            (field, index) => {
                                                return (
                                                    <div
                                                        key={index + "-edition"}
                                                    >
                                                        {formConfigs[index]
                                                            .type ===
                                                        "string" ? (
                                                            <div
                                                                key={
                                                                    index +
                                                                    "-string"
                                                                }
                                                            >
                                                                <Controller
                                                                    control={
                                                                        control
                                                                    }
                                                                    rules={
                                                                        formConfigs[
                                                                            index
                                                                        ]
                                                                            .rules ||
                                                                        null
                                                                    }
                                                                    render={({
                                                                        field: {
                                                                            onChange,
                                                                            onBlur,
                                                                            value,
                                                                        },
                                                                    }) => (
                                                                        <TextField
                                                                            id={
                                                                                field
                                                                            }
                                                                            label={
                                                                                formConfigs[
                                                                                    index
                                                                                ]
                                                                                    .label
                                                                            }
                                                                            variant="standard"
                                                                            maxLength={
                                                                                60
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                setValue(
                                                                                    field,
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                );
                                                                            }}
                                                                            defaultValue={
                                                                                getValues()[
                                                                                    field
                                                                                ] ||
                                                                                ""
                                                                            }
                                                                            // value={value}
                                                                        />
                                                                    )}
                                                                    name={field}
                                                                ></Controller>
                                                                {errors?.field && (
                                                                    <span>
                                                                        This
                                                                        field is
                                                                        required
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : formConfigs[index]
                                                              .type ===
                                                          "checkbox group" ? (
                                                            <div className="group-checkbox">
                                                                <span>
                                                                    {
                                                                        formConfigs[
                                                                            index
                                                                        ].label
                                                                    }
                                                                    :
                                                                </span>
                                                                {checkboxGroupItems.map(
                                                                    (item) => {
                                                                        return (
                                                                            <div
                                                                                key={`${index} ${item.nome} checkbox group`}
                                                                            >
                                                                                <Controller
                                                                                    control={
                                                                                        control
                                                                                    }
                                                                                    rules={
                                                                                        formConfigs[
                                                                                            index
                                                                                        ]
                                                                                            .rules ||
                                                                                        null
                                                                                    }
                                                                                    render={({
                                                                                        field: {
                                                                                            onChange,
                                                                                            onBlur,
                                                                                        },
                                                                                    }) => (
                                                                                        <div className="modal-checkbox">
                                                                                            <label
                                                                                                htmlFor={
                                                                                                    field
                                                                                                }
                                                                                            >
                                                                                                {
                                                                                                    item.nome
                                                                                                }
                                                                                            </label>
                                                                                            <Checkbox
                                                                                                sx={{
                                                                                                    padding:
                                                                                                        "0 9px",
                                                                                                }}
                                                                                                checked={Boolean(
                                                                                                    getValues()[
                                                                                                        field
                                                                                                    ]
                                                                                                )}
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                    name={
                                                                                        field
                                                                                    }
                                                                                ></Controller>
                                                                                {errors?.field && (
                                                                                    <span>
                                                                                        This
                                                                                        field
                                                                                        is
                                                                                        required
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div
                                                                key={
                                                                    index +
                                                                    "-checkbox"
                                                                }
                                                            >
                                                                <Controller
                                                                    control={
                                                                        control
                                                                    }
                                                                    rules={
                                                                        formConfigs[
                                                                            index
                                                                        ]
                                                                            .rules ||
                                                                        null
                                                                    }
                                                                    render={({
                                                                        field: {
                                                                            onChange,
                                                                            onBlur,
                                                                        },
                                                                    }) => (
                                                                        <div className="modal-checkbox">
                                                                            <label
                                                                                htmlFor={
                                                                                    field
                                                                                }
                                                                            >
                                                                                {
                                                                                    formConfigs[
                                                                                        index
                                                                                    ]
                                                                                        .label
                                                                                }
                                                                            </label>
                                                                            <Checkbox
                                                                                sx={{
                                                                                    padding:
                                                                                        "0 9px",
                                                                                }}
                                                                                checked={Boolean(
                                                                                    getValues()[
                                                                                        field
                                                                                    ]
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    name={field}
                                                                ></Controller>
                                                                {errors?.field && (
                                                                    <span>
                                                                        This
                                                                        field is
                                                                        required
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        )} */}
                                    </div>
                                </Box>
                            </Modal>
                        ) : null}
                    </div>
                </div>
            ) : (
                <NotAllowed />
            )}
        </>
    );
};

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

export default Funcionarios;
