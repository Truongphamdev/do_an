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
    async getByProduct(productId: number): Promise<ImageInterface[]> {
        const { data: images } = await api.get<ImageInterface[]>(`/products/${productId}/images`);
        return images;
    },

    async create(productId: number, payload: ImageCreate): Promise<ImageInterface> {
        if (!isRNfile(payload.image)) throw new Error("Hình ảnh phải là một đối tượng RNFile để tải lên.");

        const formData = new FormData();
        formData.append("is_primary", String(payload.is_primary));
        formData.append("image", {
            uri: payload.image.uri,
            name: payload.image.fileName || "image.jpg",
            type: payload.image.type || "image/jpeg",
        });
        const { data: image } = await api.post<ImageInterface>(
            `/products/${productId}/images`,
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" },
                _skipAuthRefresh: true,
            } 
        );
        return image;
    },

    async update(productId: number, id: number, payload: ImageUpdate): Promise<ImageInterface> {
        let updatedImage: ImageInterface;

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
            updatedImage = data;
        } else {
            const body: any = {};
            // Kiểm tra để tránh undefined thuộc tính is_primary
            if (payload.is_primary !== undefined) body.is_primary = payload.is_primary;

            const { data } = await api.put<ImageInterface>(`/products/${productId}/images/${id}`, body);
            updatedImage = data;
        }

        return updatedImage;
    },

    async remove(productId: number, id: number): Promise<void> {
        await api.delete(`/products/${productId}/images/${id}`);
    },
}