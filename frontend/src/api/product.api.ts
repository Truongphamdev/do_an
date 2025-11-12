import api from "./axiosClient";

export interface Product {
    id?: number;
    name: string;
    description: string;
    price: number;
    category: number;
    created_at?: string;
    updated_at?: string;
    image?: any;
}

// utility types tạo kiểu con thích hợp cho create/update
type ProductCreate = Omit<Product, "id" | "created_at" | "updated_at" >;
type ProductUpdate = Partial<ProductCreate>;

export const ProductApi = {
    async getAll(): Promise<Product[]> {
        const { data: products } = await api.get<Product[]>("/products");
        return products;
    },

    async getById(id: number): Promise<Product> {
        const { data: product } = await api.get<Product>(`/products/${id}`);
        return product;
    },

    async create(payload: ProductCreate): Promise<Product> {
        const formData = new FormData();
        formData.append("name", payload.name);
        formData.append("description", payload.description);
        formData.append("price", String(payload.price));
        formData.append("category", String(payload.category));

        if (payload.image) {
            formData.append("image", {
                uri: payload.image.url,
                name: payload.image.fileName || "image.jpg",
                type: payload.image.type || "image/jpeg",
            } as any);
        }

        const { data: image } = await api.post<Product>("/products", formData);
        return image;
    },

    async update(id: number, payload: ProductUpdate): Promise<Product> {
        let updatedProduct: Product;

        if(payload.image) {
            // trường hợp có ảnh mới
            const formData = new FormData();
            formData.append("name", payload.name);
            formData.append("description", payload.description);
            formData.append("price", String(payload.price));
            formData.append("category", String(payload.category));

            formData.append("image", {
                uri: payload.image.url,
                name: payload.image.fileName || "image.jpg",
                type: payload.image.type || "image.jpeg",
            } as any);

            const { data } = await api.put<Product>(`/products/${id}`, formData);
            updatedProduct = data;
        } else {
            // trường hợp không có ảnh mới
            const { data } = await api.put<Product>(`/products/${id}`, payload);
            updatedProduct = data;
        }
        return updatedProduct;
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/products/${id}`);
    },
}
