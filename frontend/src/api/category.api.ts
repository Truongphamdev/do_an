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
    async getAll(): Promise<CategoryInterface[]> {
        const { data: categories } = await api.get<CategoryInterface[]>("/categories");
        return categories;
    },

    async getById(id: number): Promise<CategoryInterface> {
        const { data: category } = await api.get<CategoryInterface>(`/categories/${id}`);
        return category;
    },

    async create(payload: CategoryCreate): Promise<CategoryInterface> {
        const { data: newCategory } = await api.post<CategoryInterface>("/categories", payload);
        return newCategory;
    },

    async update(id: number, payload: CategoryUpdate): Promise<CategoryInterface> {
        const { data: updatedCategory } = await api.put<CategoryInterface>(`/categories/${id}`, payload);
        return updatedCategory;
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/categories/${id}`);
    },
}