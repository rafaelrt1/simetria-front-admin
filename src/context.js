import { createContext, useReducer } from "react";

export const Context = createContext();

const reducerLogin = (state, action) => {
    return {
        isLoggedIn: action.isLoggedIn,
        session: action.session,
        userData: action.userData,
    };
};

const getInitialStateLogin = () => {
    return {
        isLoggedIn: localStorage.getItem("userToken") ? true : false,
        session: localStorage.getItem("userToken"),
        userData:
            localStorage.getItem("userData") !== ""
                ? JSON.parse(localStorage.getItem("userData"))
                : null,
    };
};

export function ContextProvider(props) {
    const [stateLogin, dispatchLogin] = useReducer(
        reducerLogin,
        getInitialStateLogin()
    );

    return (
        <Context.Provider value={{ stateLogin, dispatchLogin }}>
            {props.children}
        </Context.Provider>
    );
}
