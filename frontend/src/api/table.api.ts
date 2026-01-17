import api from "./axiosClient";

export interface TableInterface {
    id: number;
    number: number;
    capacity: number;
    status?: "available" | "occupied" | "reserved";
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

// utility types tạo kiểu con thích hợp cho create/update
type TableCreate = Omit<TableInterface, "id" | "created_at" | "updated_at">;
type TableUpdate = Partial<TableCreate>;

export const TableApi = {
    getList: async (params?: {
        status?: "available" | "occupied" | "reserved";
        is_active?: boolean;
        capacity?: number;
    }) => {
        const { data } = await api.get<TableInterface[]>("tables/", { params });
        return data;
    },

    getById: async (id: number) => {
        const { data } = await api.get<TableInterface>(`tables/${id}/`);
        return data;
    },

    create: async (payload: TableCreate) => {
        const { data } = await api.post<TableInterface>("tables/", payload);
        return data;
    },

    update: async (id: number, payload: TableUpdate) => {
        const { data } = await api.put<TableInterface>(`tables/${id}/`, payload);
        return data;
    },

    remove: async (id: number) => {
        await api.delete(`tables/${id}/`);
    },

    enable: async (id: number) => {
        const { data } = await api.patch<TableInterface>(`tables/${id}/enable/`);
        return data;
    },

    disable: async (id: number) => {
        const { data } = await api.patch<TableInterface>(`tables/${id}/disable/`);
        return data;
    },

    updateStatus: async (id: number, status: "available" | "occupied" | "reserved") => {
        const { data } = await api.patch<TableInterface>(`tables/${id}/update_status/`, { status });
        return data;
    },

    reserved: async (id: number) => {
        const { data } = await api.patch<TableInterface>(`tables/${id}/reserved/`);
        return data;
    },
}