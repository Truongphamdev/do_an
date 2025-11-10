import api from "./axiosClient";

export interface Category {
    id?: number;
    name: string;
    descriptions?: string;
    created_at?: string;
    updated_at?: string;
}

type CategoryCreate = Omit<Category, "id" | "created_at" | "updated_at">;
type CategoryUpdate = Partial<CategoryCreate>;

export const CategoryApi = {
    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get<Category[]>("/categories");
        return data;
    },

    create: async (body: CategoryCreate): Promise<Category> => {
        const { data } = await api.post<Category>("/categories", body);
        return data;
    },

    update: async (id: number, body: CategoryUpdate): Promise<Category> => {
        const { data } = await api.put<Category>(`/categories/${id}`, body);
        return data;
    },

    remove: async (id: number): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },
}