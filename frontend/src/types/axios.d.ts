/**
 * Chức năng:
 * - Gắn thêm _skipAuthRefresh vào tất cả request axios
 */
import axios from "axios";

declare module "axios" {
    export interface AxiosRequestConfig {
        _skipAuthRefresh?: boolean;
    }
}