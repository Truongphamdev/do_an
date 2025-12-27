export const getBackendErrorMessage = (err: any) => {
    const data = err?.response?.data;

    if (!data) return "Có lỗi xảy ra!";

    if (typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const value = data[firstKey];

        if (Array.isArray(value)) return value[0];
        if (typeof value === "string") return value;
    }

    if (typeof data === "string") return data;

    return "Có lỗi xảy ra!";
};