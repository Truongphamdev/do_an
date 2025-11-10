import api from "./axiosClient";

export interface Register {
    email: string;
    password: string;
    username: string;
    first_name: string;
    last_name: string;
    role: string;
}

export interface Login {
    email: string;
    password: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: {
        id: number;
        email: string;
        username: string;
        first_name: string;
        last_name: string;
        role: string;
  };
}

export const authApi = {
    register: async (data: Register): Promise<AuthResponse> => {
        const { data: response } = await api.post<AuthResponse>("/register", data);
        return response;
    },

    login: async (data: Login): Promise<AuthResponse> => {
        const { data: response } = await api.post<AuthResponse>("/login", data);
        return response;
    },

    refreshToken: async (data: { refresh: string }): Promise<{ access: string}> => {
        const { data: response } = await api.post<{ access: string}>("/token/refresh/", data);
        return response;
    },
};