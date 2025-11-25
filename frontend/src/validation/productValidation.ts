import z from "zod";

export const ProductSchema = z.object({
    name: z.string().trim()
        .nonempty({ message: "Vui lòng nhập tên món." })
        .min(2, { message: "Tên món phải có ít nhất 2 kí tự."}),
    description: z.string().trim()
        .nonempty({ message: "Vui lòng nhập mô tả món." })
        .min(2, { message: "Mô tả món phải có ít nhất 2 kí tự."}),
    price: z.coerce.number({
        required_error: "Vui lòng nhập giá món.",
        invalid_type_error: "Giá món phải là một số, không phải chuỗi.",
    }).positive({ message: "Giá món phải lớn hơn 0." }),
    category_id: z.coerce.number({
        required_error: "Vui lòng chọn danh mục.",
        invalid_type_error: "Danh mục ko hợp lệ.",
    }).int().positive(),
    image: z.object({
        uri: z.string().nonempty({ message: "Vui lòng chọn ảnh." }),
        type: z.string().optional(),
        fileName: z.string().optional(),
    }).optional(),
});

export type productForm = z.infer<typeof ProductSchema>;