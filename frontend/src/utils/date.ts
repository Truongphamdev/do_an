import dayjs from 'dayjs';

export const formatDateTime = (date?: string) =>
    date ? dayjs(date).format("HH[giờ]:mm[phút]:ss[giây] - DD/MM/YYYY") : "";

export const formatDate = (date?: string) =>
    date ? dayjs(date).format("DD/MM/YYYY") : "";
