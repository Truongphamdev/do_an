import api from "./axiosClient";

export interface Category {
    id: number;
    name: string;
    description: string;
    created_at?: string;
    updated_at?: string;
}

// utility types tạo kiểu con thích hợp cho create/update
type CategoryCreate = Omit<Category, "id" | "created_at" | "updated_at">;
type CategoryUpdate = Partial<CategoryCreate>;

export const CategoryApi = {
    getAll: async () => {
        const { data } = await api.get<Category[]>("/categories");
        return data;
    },

    getById: async (id: number) => {
        const { data } = await api.get<Category>(`/categories/${id}`);
        return data;
    },

    create: async (payload: CategoryCreate) => {
        const { data } = await api.post<Category>("/categories", payload);
        return data;
    },

    update: async (id: number, payload: CategoryUpdate) => {
        const { data } = await api.put<Category>(`/categories/${id}`, payload);
        return data;
    },

    remove: async (id: number) => {
        await api.delete(`/categories/${id}`);
    },
}