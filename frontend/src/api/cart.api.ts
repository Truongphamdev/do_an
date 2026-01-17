import api from "./axiosClient";
import { ProductInterface } from "./product.api";

export interface CartItemInterface {
    id: number;
    cart: number;
    product: ProductInterface;
    quantity: number;
    total: number;
    note?: string | null;
    created_at?: string;
}

export interface CartInterface {
    id: number;
    table: number;
    status: 'active' | 'locked';
    cart_items: CartItemInterface[];
    created_at?: string;
}

type CartItemCreate = {
    cart: number;
    product: number;
    quantity: number;
    note?: string;
};

type CartItemUpdate = {
    quantity?: number;
    note?: string;
};

export const CartApi = {
    getCart: async (id: number) => {
        const { data } = await api.get<CartInterface>("/carts", { params: { table: id} });
        return data;
    },

    createCart: async (id: number) => {
        const { data } = await api.post<CartInterface>("/carts/open", { table: id });
        return data;
    },

    createItem: async (payload: CartItemCreate) => {
        const { data } = await api.post<CartItemInterface>("/cart-items", payload);
        return data;
    },

    updateItem: async (id: number, payload: CartItemUpdate) => {
        const { data } = await api.put<CartItemInterface>(`/cart-items/${id}`, payload );
        return data;
    },

    removeItem: async (id: number) => {
        await api.delete(`/cart-items/${id}`);
    },
};
