import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import NotAllowed from "../components/NotAllowed";
import { Context } from "../context";
const ENDPOINT = process.env.REACT_APP_ENDPOINT;

const Home = () => {
    const [accessDenied, setAcessDenied] = useState();

    const loginContext = useContext(Context);
    const history = useNavigate();

    const checkIsLoggedIn = () => {
        try {
            // const token = localStorage.getItem("userToken");
            // let user = localStorage.getItem("userData");
            // if (user) {
            //     user = JSON.parse(user);
            // }
            // if (!token || !user.id || !user.name) {
            //     setAcessDenied(true);
            //     return false;
            // }

            fetch(`${ENDPOINT}/admin/permission`, {
                method: "GET",
                mode: "cors",
                headers: {
                    Authorization: loginContext.stateLogin.session,
                    Accept: "application/json",
                    "Content-Type": "application/json;charset=UTF-8",
                },
            })
                .then((res) => res.json())
                .then(
                    (result) => {
                        if (result.error) {
                            setAcessDenied(true);
                            // localStorage.setItem("userToken", "");
                            // localStorage.setItem("userData", "");
                            // loginContext.dispatchLogin({
                            //     isLoggedIn: false,
                            //     session: null,
                            //     userData: null,
                            // });
                            // history("/login");
                            return;
                        } else {
                            setAcessDenied(false);
                        }
                    },
                    (error) => {
                        console.error(error);
                    }
                );
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        checkIsLoggedIn();
        // if (!isAuthorized) {
        //     history('/login')
        // }
    }, []);

    return (
        <>
            <Header></Header>
            {accessDenied === undefined ? null : !accessDenied ? (
                <></>
            ) : (
                <NotAllowed />
            )}
        </>
    );
};

export default Home;
