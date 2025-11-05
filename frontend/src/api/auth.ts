import api from "./axiosClient";

interface RegisterData {
    email: string;
    password: string;
    username: string;
}

interface LoginData {
    email: string;
    password: string;
}

export const authApi = {
    register: (data: RegisterData) => api.post("/register", data),
    login: (data: LoginData) => api.post("/login", data),
    refreshToken: (data: {refresh: string}) => api.post("/token/refresh/", data),
};