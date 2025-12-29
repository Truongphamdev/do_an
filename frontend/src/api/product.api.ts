import api from "./axiosClient";

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: number;
    category_name?: string;
    status: "available" | "unavailable",
    created_at?: string;
    updated_at?: string;

    // image dùng cho chức năng upload
    image?: string;
    // image_url dùng cho hiển thị
    image_url?: string;
}

export interface ProductImage {
    uri: string;
    type?: string;
    fileName?: string;
}

// utility types tạo kiểu con thích hợp cho create/update
type ProductCreate = Omit<Product, "id" | "created_at" | "updated_at" | "status" > & { image?: ProductImage };
type ProductUpdate = Partial<ProductCreate>;

export const ProductApi = {
    getAll: async () => {
        const { data } = await api.get<Product[]>("/products/");
        return data;
    },

    getById: async (id: number) => {
        const { data } = await api.get<Product>(`/products/${id}`);
        return data;
    },

    create: async (payload: ProductCreate) => {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("description", payload.description);
        formData.append("price", String(payload.price));
        formData.append("category", payload.category);

        if (payload.image) {
            formData.append("image", {
                uri: payload.image.uri,
                name: payload.image.fileName || "image.jpg",
                type: payload.image.type || "image/jpeg",
            } as any);
        }

        const { data } = await api.post<Product>(
            "/products/",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return data;
    },

    update: async (productId: number, payload: ProductUpdate) => {
        if(payload.image) {
            // trường hợp có ảnh mới
            const formData = new FormData();
            formData.append("name", payload.name);
            formData.append("description", payload.description);
            formData.append("price", String(payload.price));
            formData.append("category", payload.category);

            formData.append("image", {
                uri: payload.image.uri,
                name: payload.image.fileName || "image.jpg",
                type: payload.image.type || "image/jpeg",
            } as any);

            const { data } = await api.put<Product>(
                `/products/${productId}/`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return data;
        } else {
            // trường hợp không có ảnh mới
            const { data } = await api.put<Product>(`/products/${productId}/`, payload);
            return data;
        }
    },

    updateStatus: async (id: number, status: "available" | "unavailable") => {
        const { data } = await api.put<Product>(`/products/${id}/status/`, { status });
        return data;
    },

    remove: async (id: number) => {
        await api.delete(`/products/${id}/`);
    },

    // Api cho phần search, filter
    getList: async (params?: {
        search?: string;
        category?: number;
        status?: "available" | "unavailable";
        min_price?: number | string;
        max_price?: number | string;
    }) => {
        const { data: newList } = await api.get<Product[]>("/products/", {
            params,
        });
        return newList;
    }
}
