import api from "./axiosClient";

export interface ProductInterface {
    id: number;
    name: string;
    description: string;
    price: number;
    category: number;
    category_name?: string;
    status: "available" | "unavailable",
    created_at?: string;
    updated_at?: string;

    // cấu hình khi dữ liệu được trả về
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
type ProductCreate = Omit<ProductInterface, "id" | "created_at" | "updated_at" | "category_id" | "status" > & { image?: ProductImage };
type ProductUpdate = Partial<ProductCreate>;

export const ProductApi = {
    async getAll(): Promise<ProductInterface[]> {
        const { data: products } = await api.get<ProductInterface[]>("/products/");
        return products;
    },

    async getById(id: number): Promise<ProductInterface> {
        const { data: product } = await api.get<ProductInterface>(`/products/${id}`);
        return product;
    },

    async create(payload: ProductCreate): Promise<ProductInterface> {
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

        const { data: newProduct } = await api.post<ProductInterface>(
            "/products/",
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );
        return newProduct;
    },

    async update(productId: number, payload: ProductUpdate): Promise<ProductInterface> {
        let updatedProduct: ProductInterface;

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

            const { data } = await api.put<ProductInterface>(
                `/products/${productId}/`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            updatedProduct = data;
        } else {
            // trường hợp không có ảnh mới
            const { data } = await api.put<ProductInterface>(`/products/${productId}/`, payload);
            updatedProduct = data;
        }
        return updatedProduct;
    },

    async updateStatus(id: number, status: "available" | "unavailable"): Promise<ProductInterface> {
        const { data: updatedProduct } = await api.put<ProductInterface>(`/products/${id}/status/`, { status });
        return updatedProduct;
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/products/${id}/`);
    },

    // Api cho phần search, filter
    async getList(params?: {
        search?: string;
        category?: number;
        status?: "available" | "unavailable";
        min_price?: number | string;
        max_price?: number | string;
    }): Promise<ProductInterface[]> {
        const { data: newList } = await api.get<ProductInterface[]>("/products/", {
            params,
        });
        return newList;
    }
}
