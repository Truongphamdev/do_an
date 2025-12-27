import axios, { AxiosRequestConfig, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "./auth.api";

// Queue để lưu các request khi đang refresh token
interface QueueItem {
    resolve: (token: string) => void;
    reject: (error: any) => void;
}

// Extend AxiosRequestConfig để thêm _retry optional
interface CustomRequestConfig extends AxiosRequestConfig {
    _retry?: boolean; // _retry: để đánh dấu xem reqest này đã thử refresh token 1 lần chưa, tránh lặp vô hạn
    _skipAuthRefresh?: boolean;
}

// Khởi tạo Axios instance
const API_URL = "http://10.0.2.2:8000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Gắn access token tự động vào mỗi request => mỗi khi gọi api thì header Authorization sẽ tự động có token
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Biến dùng cho refresh token và queue
let isRefreshing = false;
let failedQueue: QueueItem[] = [];
// Hàm xử lý queue khi refresh xong hoặc thất bại
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (token) prom.resolve(token);
        else prom.reject(error || new Error("No token"));
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response, // response bình thường thì trả về
    async (error) => {
        const originalRequest = error.config as CustomRequestConfig;

        // Tránh crash khi error.config undefined
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Không refresh token cho request login / refresh
        if (
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh")
        ) {
            return Promise.reject(error);
        }

        // ❌ BỎ QUA refresh cho upload ảnh
        if (originalRequest?._skipAuthRefresh) {
            return Promise.reject(error);
        }

        const isAuthError = error.response?.status === 401

        // Nếu lỗi 401 và chưa retry lần nào
        if (isAuthError && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh, đẩy request vào queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    if (originalRequest.headers) originalRequest.headers.Authorization = "Bearer " + token;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refresh = await AsyncStorage.getItem("refresh_token");
                if (!refresh) throw new Error("No refresh token");

                const response = await authApi.refreshToken(refresh);
                const newAccess = response.access;

                // Lưu token mới và set header mặc định
                await AsyncStorage.setItem("access_token", newAccess);
                api.defaults.headers.common["Authorization"] = "Bearer " + newAccess;

                processQueue(null, newAccess); // Xử lý các request đang queue
                return api(originalRequest); // retry request vừa bị 401
            } catch (err) {
                const axiosError = err as AxiosError<any>;

                const isRefreshTokenExpired =
                    axiosError.response?.data?.code === "token_not_valid" &&
                    axiosError.response?.data?.detail?.toLowerCase().includes("refresh");

                processQueue(err, null);

                // ❗ CHỈ logout khi refresh token cũng hết hạn
                if (isRefreshTokenExpired) {
                    await AsyncStorage.multiRemove([
                        "access_token",
                        "refresh_token",
                        "user_info",
                    ])
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        if (!error.response) {
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
)

export default api
