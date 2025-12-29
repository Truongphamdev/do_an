import api from "./axiosClient";

interface UserInterface {
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
    async getAll(): Promise<UserInterface[]> {
        const { data: users } = await api.get<UserInterface[]>("admin/users");
        return users;
    },

    async getById(id: number): Promise<UserInterface> {
        const { data: user } = await api.get<UserInterface>(`admin/users/${id}`);
        return user;
    },

    async getMe(): Promise<UserInterface> {
        const { data: me } = await api.get<UserInterface>("admin/users/me/");
        return me;
    },

    async enableUser(id: number) {
        return api.patch(`admin/users/${id}/enable/`);
    },

    async disableUser(id: number) {
        return api.patch(`admin/users/${id}/disable/`);
    },

    async changeRole(id: number, role: staffRole) {
        return api.patch(`admin/users/${id}/change_role/`, { role });
    }
}