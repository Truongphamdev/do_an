import z from "zod";

export const categorySchema = z.object({
    name: z.string().trim()
        .nonempty({ message: "Vui lòng nhập tên danh mục" })
        .min(2, { message: "Ten danh mục phải có ít nhất 2 ký tự" }),
    description: z.string().trim()
        .nonempty({ message: "Vui lòng nhập mô tả cho danh mục" }),
});

export type categoryForm = z.infer<typeof categorySchema>;