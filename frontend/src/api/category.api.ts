import api from "./axiosClient";

export interface Category {
    id?: number;
    name: string;
    descriptions?: string;
    created_at?: string;
    updated_at?: string;
}

// utility types tạo kiểu con thích hợp cho create/update
type CategoryCreate = Omit<Category, "id" | "created_at" | "updated_at">;
type CategoryUpdate = Partial<CategoryCreate>;

export const CategoryApi = {
    async getAll(): Promise<Category[]> {
        const { data: categories } = await api.get<Category[]>("/categories");
        return categories;
    },

    async create(payload: CategoryCreate): Promise<Category> {
        const { data: newCategory } = await api.post<Category>("/categories", payload);
        return newCategory;
    },

    async update(id: number, payload: CategoryUpdate): Promise<Category> {
        const { data: updatedCategory } = await api.put<Category>(`/categories/${id}`, payload);
        return updatedCategory;
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/categories/${id}`);
    },
}