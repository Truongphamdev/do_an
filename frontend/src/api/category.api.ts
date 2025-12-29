import api from "./axiosClient";

export interface CategoryInterface {
    id: number;
    name: string;
    description: string;
    created_at?: string;
    updated_at?: string;
}

// utility types tạo kiểu con thích hợp cho create/update
type CategoryCreate = Omit<CategoryInterface, "id" | "created_at" | "updated_at">;
type CategoryUpdate = Partial<CategoryCreate>;

export const CategoryApi = {
    getAll: async () => {
        const { data } = await api.get<CategoryInterface[]>("/categories");
        return data;
    },

    getById: async (id: number) => {
        const { data } = await api.get<CategoryInterface>(`/categories/${id}`);
        return data;
    },

    create: async (payload: CategoryCreate) => {
        const { data } = await api.post<CategoryInterface>("/categories", payload);
        return data;
    },

    update: async (id: number, payload: CategoryUpdate) => {
        const { data } = await api.put<CategoryInterface>(`/categories/${id}`, payload);
        return data;
    },

    remove: async (id: number) => {
        await api.delete(`/categories/${id}`);
    },
}