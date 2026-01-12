import api from "./axiosClient";

export interface UserInterface {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string ;
    address?: string ;
    role: "waiter" | "chef" | "cashier" | "customer";
    is_active: boolean;
    is_staff?: boolean;
    is_superuser?: boolean;
    date_joined:  string;
    last_login?: string ;
}

export type staffRole = "waiter" | "chef" | "cashier";
export type userRole = staffRole | "customer";

export const UserApi = {
    getAll: async () => {
        const {data} = await api.get<UserInterface[]>("admin/users");
        return data;
    },

    getById: async (id: number) => {
        const { data } = await api.get<UserInterface>(`admin/users/${id}`);
        return data;
    },

    getMe: async () => {
        const { data } = await api.get<UserInterface>("admin/users/me/");
        return data;
    },

    enable: async (id: number) => {
        return api.patch(`admin/users/${id}/enable/`);
    },

    disable: async (id: number) => {
        return api.patch(`admin/users/${id}/disable/`);
    },

    changeRole: (id: number, role: staffRole) => {
        return api.patch(`admin/users/${id}/change_role/`, { role });
    },

    updateStaff: async (id: number, data: any) => {
        return api.patch(`admin/users/${id}/update_staff/`, data);
    },

    getList: async (params?: {
        search?: string;
        role?: userRole;
        is_active?: boolean;
        sort?: "newest" | "oldest" | "name_asc" | "name_desc";
    }) => {
        const { data } = await api.get<UserInterface[]>("admin/users/", { params });
        return data;
    }
}