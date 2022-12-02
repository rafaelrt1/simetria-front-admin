import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import NotAllowed from "../components/NotAllowed";
import EnhancedTable from "../components/Table";
import { Context } from "../context";
const ENDPOINT = process.env.REACT_APP_ENDPOINT;

const Servicos = () => {
    const [accessDenied, setAcessDenied] = useState();
    const [services, setServices] = useState([]);
    const [employees, setEmployees] = useState([]);

    const history = useNavigate();
    const loginContext = useContext(Context);

    const {
        control,
        field,
        fieldState,
        handleSubmit,
        getValues,
        setValue,
        formState: { isValid, isDirty, errors },
    } = useForm({
        defaultValues: {
            name: "",
            minPrice: "",
            maxPrice: "",
            duration: "",
            complement: "",
            instructions: "",
            profissionais: "",
            payable: "",
            active: "",
        },
    });

    const formConfigs = [
        { label: "Nome", type: "string", rules: { required: true } },
        { label: "Preço Mínimo", type: "string", rules: { required: true } },
        { label: "Preço Máximo", type: "string" },
        { label: "Duração", type: "string", rules: { required: true } },
        { label: "Complemento", type: "string" },
        { label: "Instruções", type: "string" },
        {
            label: "Profissionais",
            type: "checkbox group",
            rules: { required: true },
        },
        { label: "Pagável", type: "checkbox" },
        { label: "Ativo", type: "checkbox" },
    ];

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

    const handleEdition = (id) => {
        if (!id) {
            setValue("id", "");
            setValue("name", "");
            return;
        }
        // console.log(services);
        const selectedValue = services.filter((data) => {
            return data.idServico === id;
        })[0];
        // console.log(id, selectedValue);
        setValue("name", selectedValue.nome);
        setValue("minPrice", selectedValue.precoMinimo);
        setValue("maxPrice", selectedValue.precoMaximo);
        setValue("duration", selectedValue.duracaoMinima);
        setValue("complement", selectedValue.complemento);
        setValue("instructions", selectedValue.instrucoes);
        setValue("payable", selectedValue.pagavel);
        setValue("active", selectedValue.ativo);
    };

    const formatTime = (time) => {
        const hours = parseInt(time.split(":")[0]);
        const minutes = parseInt(time.split(":")[1]);
        let formattedTime = "";
        if (hours) {
            formattedTime += hours + "h";
        }
        if (minutes) {
            formattedTime = minutes + "m";
        }
        return formattedTime;
    };

    const formatPrice = (price) => {
        if (!price) return null;
        else {
            price = parseInt(price);
            return Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 2,
            }).format(price);
        }
    };

    const formatProfessionals = (professionals) => {
        let professionalsFormatted = "";
        professionals.forEach((professional, index) => {
            if (
                index === professionals.length - 1 ||
                professionals.length === 1
            ) {
                professionalsFormatted += professional.nome;
            }
            if (professionals.length > 1 && index < professionals.length - 2) {
                professionalsFormatted += professional.nome + ", ";
            }
            if (
                professionals.length > 2 &&
                index === professionals.length - 2
            ) {
                professionalsFormatted += professional.nome + " e ";
            }
        });
        return professionalsFormatted;
    };

    const formatServices = (response) => {
        let result = [];
        response.forEach((data) => {
            let obj = {
                idServico: data.idServico,
                nome: data.nome,
                precoMinimo: formatPrice(data.precoMinimo),
                precoMaximo: formatPrice(data.precoMaximo),
                duracaoMinima: formatTime(data.duracaoMinima),
                complemento: data.complemento || null,
                instrucoes: data.instrucoes || null,
                pagavel: data.pagavel,
                ativo: data.ativo,
                profissionais: formatProfessionals(data.profissionais),
            };
            result.push(obj);
        });
        return result;
    };

    const getServices = async () => {
        const token = localStorage.getItem("userToken");
        let user = localStorage.getItem("userData");
        if (user) {
            user = JSON.parse(user);
        }
        if (!token || !user.id || !user.name) {
            setAcessDenied(true);
            return false;
        }

        const request = await fetch(`${ENDPOINT}/admin/servicos`, {
            method: "GET",
            mode: "cors",
            headers: {
                Authorization: token,
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
            const formatedServices = formatServices(response);
            setServices(formatedServices);
        }
    };

    useEffect(() => {
        getServices();
        getEmployees();
    }, []);

    return (
        <>
            <Header></Header>
            {accessDenied === undefined ? null : !accessDenied ? (
                <div className="table">
                    {services?.length ? (
                        <EnhancedTable
                            items={services}
                            // editionHandler={editEmployee}
                            // deleteHandler={deleteEmployee}
                            // addHandler={addEmployee}
                            handleEdition={handleEdition}
                            tableMainTitle={"Serviços"}
                            form={control}
                            handleSubmit={handleSubmit}
                            checkboxGroupItems={employees}
                            getValues={getValues}
                            setValue={setValue}
                            field={field}
                            fieldState={fieldState}
                            formConfigs={formConfigs}
                            headCells={[
                                {
                                    id: "nome",
                                    dataType: "string",
                                    numeric: false,
                                    disablePadding: true,
                                    label: "Nome",
                                },
                                {
                                    id: "precoMinimo",
                                    dataType: "string",
                                    numeric: true,
                                    disablePadding: true,
                                    label: "Preço Mínimo",
                                },
                                {
                                    id: "precoMaximo",
                                    dataType: "string",
                                    numeric: true,
                                    disablePadding: true,
                                    label: "Preço Máximo",
                                },
                                {
                                    id: "duracaoMinima",
                                    dataType: "string",
                                    numeric: false,
                                    disablePadding: false,
                                    label: "Duração",
                                },
                                {
                                    id: "complemento",
                                    dataType: "string",
                                    numeric: false,
                                    disablePadding: true,
                                    label: "Complemento",
                                },
                                {
                                    id: "instrucoes",
                                    dataType: "string",
                                    numeric: false,
                                    disablePadding: true,
                                    label: "Instruções",
                                },
                                {
                                    id: "pagavel",
                                    dataType: "checkbox",
                                    numeric: false,
                                    disablePadding: true,
                                    label: "Pagável",
                                },
                                {
                                    id: "ativo",
                                    dataType: "checkbox",
                                    numeric: false,
                                    disablePadding: true,
                                    label: "Ativo",
                                },
                                {
                                    id: "profissionais",
                                    dataType: "string",
                                    numeric: false,
                                    disablePadding: true,
                                    label: "Profissionais",
                                },
                            ]}
                        ></EnhancedTable>
                    ) : (
                        <p>Nenhum serviço cadastrado</p>
                    )}
                </div>
            ) : (
                <NotAllowed />
            )}
        </>
    );
};

export default Servicos;
