import api from "./axiosClient";

export interface RNfile {
    uri: string;
    fileName?: string;
    type?: string;
}

export interface ImageInterface {
    id: number;
    image: RNfile | string;
    is_primary: boolean;
    create_at?: string;
    image_url?: string;
}

function isRNfile(image: string | RNfile): image is RNfile {
    return (image as RNfile).uri !== undefined;
}

type ImageCreate = Omit<ImageInterface, "id" | "create_at" | "image_url">;
type ImageUpdate = Partial<ImageCreate>;

export const ImageApi = {
    getByProduct: async (productId: number) => {
        const { data } = await api.get<ImageInterface[]>(`/products/${productId}/images`);
        return data;
    },

    create: async (productId: number, payload: ImageCreate) => {
        if (!isRNfile(payload.image)) throw new Error("Hình ảnh phải là một đối tượng RNFile để tải lên.");

        const formData = new FormData();
        formData.append("is_primary", String(payload.is_primary));
        formData.append("image", {
            uri: payload.image.uri,
            name: payload.image.fileName || "image.jpg",
            type: payload.image.type || "image/jpeg",
        });
        const { data } = await api.post<ImageInterface>(
            `/products/${productId}/images`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                _skipAuthRefresh: true,
            }
        );
        return data;
    },

    update: async (productId: number, id: number, payload: ImageUpdate) => {

        if (payload.image && isRNfile(payload.image)) {
            const formData = new FormData();

            // Kiểm tra để tránh undefined thuộc tính is_primary
            if (payload.is_primary !== undefined) formData.append("is_primary", String(payload.is_primary));

            formData.append("image", {
                uri: payload.image.uri,
                name: payload.image.fileName || "image.jpg",
                type: payload.image.type || "image/jpeg",
            });
            const { data } = await api.put<ImageInterface>(
                `/products/${productId}/images/${id}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    _skipAuthRefresh: true,
                } 
            );
            return data;
        } else {
            const body: any = {};
            // Kiểm tra để tránh undefined thuộc tính is_primary
            if (payload.is_primary !== undefined) body.is_primary = payload.is_primary;

            const { data } = await api.put<ImageInterface>(`/products/${productId}/images/${id}`, body);
            return data;
        }
    },

    remove: async (productId: number, id: number) => {
        await api.delete(`/products/${productId}/images/${id}`);
    },
}