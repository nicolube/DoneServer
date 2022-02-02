import config from "../config";
import { addMessage, MessageTypes } from "./aleart";

export var settings = {
    apiKey: null,
    login: false,
    username: null,
    password: null,
};;

export const resetSettings = () => {
    settings = {
        apiKey: null,
        login: false,
        username: null,
        password: null,
    };
};

resetSettings();


const handleFetch = async (url, method, data) => {
    try {
        return await fetch(config.apiURL + url, {
            method: "post",
            headers: {
                'Content-Type': 'application/json',
                'username': settings.username,
                'password': settings.password
            },
            body: JSON.stringify(data)
        })
    } catch (e) {
        addMessage("Failed to access backend, try again later!", MessageTypes.DANGER);
    }
};


export const login = async (username, password) => {
    const result = await handleFetch("/user/login", "post", {
        username: username,
        password: password
    });
    if (result === undefined) return;
    if (result.ok) {
        settings.login = true;
        settings.username = username;
        settings.password = password
    }
    return result.ok
};
export const logout = () => {
  resetSettings();
};



export const verify = {
    username: (value) => value.match(/^[\d\w-]{4,24}$/g) !== null,
    password: (value) => value.match(/^[\d\w-?$/!"'+*§]{8,32}$/g) !== null,
}


