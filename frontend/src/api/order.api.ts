import api from "./axiosClient";

export interface OrderItem {
    product: {
        id: number;
        name: string;
        price: string;
        description?: string;
        status?: string;
        category?: number;
        created_at?: string;
    };
    quantity: number;
    price: string;
    description?: string;
}

export interface OrderInterface {
    id: number;
    table_number: number;
    table_status: "available" | "occupied" | "reserved";
    items: OrderItem[];
    total_amount: string;
    status: "pending" | "preparing" | "served" | "paid";
    created_at?: string;
}

export const OrderApi = {
    create: async (payload: {
        table: number;
        cartitems: number[];
    }) => {
        const { data } = await api.post<OrderInterface>("orders", payload);
        return data;
    },

    getAdminOrders: async () => {
        const { data } = await api.get<OrderInterface[]>("admin/orders");
        return data;
    },

    getOrders: async () => {
        const { data } = await api.get<OrderInterface[]>("orders");
        return data;
    },

    checkPaymentStatus: async (orderId: number) => {
        const { data } = await api.get(`payment/status/${orderId}/`);
        return data;
    },

    getInvoice: async (orderId: number) => {
        const { data } = await api.get(`invoices/${orderId}/`);
        return data;
    },
};
