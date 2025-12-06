import { useState, useEffect } from "react";
import { CategoryApi, type CategoryInterface } from "../api/category.api";

export const useCategories = () => {
    const [ categories, setCategories ] = useState<CategoryInterface[]>([]);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await CategoryApi.getAll();
                setCategories(data);
            } catch (err: any) {
                console.log("Lỗi khi lấy danh sách danh mục thất bại: ", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return { categories, setCategories, loading };
}