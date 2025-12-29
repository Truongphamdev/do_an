import api from "./axiosClient";

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string | null;
    address?: string | null;
    role: "waiter" | "chef" | "cashier" | "customer";
    is_active: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    date_joined:  string;
    last_login?: string | null;
}

type staffRole = "waiter" | "chef" | "cashier";

export const UserApi = {
    getAll: async () => {
        const {data} = await api.get<User[]>("admin/users");
        return data;
    },

    getById: async (id: number) => {
        const { data } = await api.get<User>(`admin/users/${id}`);
        return data;
    },

    getMe: async () => {
        const { data } = await api.get<User>("admin/users/me/");
        return data;
    },

    enableUser: async (id: number) => {
        return api.patch(`admin/users/${id}/enable/`);
    },

    disableUser: async (id: number) => {
        return api.patch(`admin/users/${id}/disable/`);
    },

    changeRole: (id: number, role: staffRole) => {
        return api.patch(`admin/users/${id}/change_role/`, { role });
    },
}