import api from "./axiosClient";

export interface RNfile {
    uri: string;
    fileName?: string;
    type?: string;
}

export interface Image {
    id?: number;
    image: RNfile | string;
    is_primary: boolean;
    create_at?: string;
    image_url?: string;
}

function isRNfile(image: string | RNfile): image is RNfile {
    return (image as RNfile).uri !== undefined;
}

type ImageCreate = Omit<Image, "id" | "create_at" | "image_url">;
type ImageUpdate = Partial<ImageCreate>;

export const ImageApi = {
    async getAll(productId: number): Promise<Image[]> {
        const { data: images } = await api.get<Image[]>(`/products/${productId}/images`);
        return images;
    },

    async create(productId: number, payload: ImageCreate): Promise<Image> {
        if (!isRNfile(payload.image)) throw new Error("Hình ảnh phải là một đối tượng RNFile để tải lên.");

        const formData = new FormData();
        formData.append("is_primary", String(payload.is_primary));
        formData.append("image", {
            uri: payload.image.uri,
            name: payload.image.fileName || "image.jpg",
            type: payload.image.type || "image.jpeg",
        });
        const { data: image } = await api.post<Image>(`/products/${productId}/images`, formData);
        return image;
    },

    async update(id: number, payload: ImageUpdate): Promise<Image> {
        let updatedImage: Image;

        if (payload.image && isRNfile(payload.image)) {
            const formData = new FormData();
            formData.append("is_primary", String(payload.is_primary));
            formData.append("image", {
                uri: payload.image.uri,
                name: payload.image.fileName || "image.jpg",
                type: payload.image.type || "image.jpeg",
            });
            const { data } = await api.post<Image>(`/images/${id}`, formData);
            updatedImage = data;
        } else {
            const body: any = {};
            if (payload.is_primary !== undefined) body.is_primary = payload.is_primary;

            const { data } = await api.put<Image>(`/images/${id}`, body);
            updatedImage = data;
        }

        return updatedImage;
    },

    async remove(id: number): Promise<void> {
        await api.delete(`/images/${id}`);
    },
}