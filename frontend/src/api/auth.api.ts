import api from "./axiosClient";

export interface Register {
    email: string;
    password: string;
    username: string;
    first_name: string;
    last_name: string;
    role: 'waiter' | 'chef' | 'cashier' | 'customer';
    phone?: string;
    address?: string;
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
    async register(payload: Register): Promise<AuthResponse> {
        const { data: response } = await api.post<AuthResponse>("/register", payload);
        return response;
    },

    async login(payload: Login): Promise<AuthResponse> {
        const { data: response } = await api.post<AuthResponse>("/login", payload);
        return response;
    },

    async refreshToken(refresh: string): Promise<{ access: string }> {
        const { data: newToken } = await api.post<{ access: string }>("/token/refresh/", {refresh});
        return newToken;
    },
};