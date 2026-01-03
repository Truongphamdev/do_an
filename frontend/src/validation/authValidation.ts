import { z } from "zod"

export const registerSchema = z.object({
    username: z.string().trim()
        .nonempty({ message: "Vui lòng nhập tên tài khoản"})
        .min(3, { message: "Tên tài khoản phải có ít nhất 3 ký tự" }),
    first_name: z.string().trim()
        .nonempty({ message: "Vui lòng nhập họ"})
        .min(2, { message: "Họ phải có ít nhất 2 ký tự" }),
    last_name: z.string().trim()
        .nonempty({ message: "Vui lòng nhập tên"})
        .min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    email: z.string().trim()
        .nonempty({ message: "Vui lòng nhập email"})
        .email({ message: "Email không hợp lệ" }),
    password: z.string().trim()
        .nonempty({ message: "Vui lòng nhập mật khẩu"})
        .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
        .regex(/[A-Z]/, { message: "Phải có ít nhất 1 chữ in hoa" })
        .regex(/[a-z]/, { message: "Phải có ít nhất 1 chữ thường" })
        .regex(/[0-9]/, { message: "Phải có ít nhất 1 chữ số" })
        .regex(/[@$!%*?&]/, { message: "Phải có ít nhất 1 ký tự đặc biệt (!@#$%&*?)" }),
    role: z.string()
        .nonempty({ message: "Vui lòng chọn vai trò"})
        .min(1, "Vui lòng chọn vai trò"),
});

export const baseUserSchema = {
    first_name: z.string().trim()
        .nonempty({ message: "Vui lòng nhập họ"})
        .min(2, { message: "Họ phải có ít nhất 2 ký tự" }),
    last_name: z.string().trim()
        .nonempty({ message: "Vui lòng nhập tên"})
        .min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    role: z.string()
        .nonempty({ message: "Vui lòng chọn vai trò"})
        .min(1, "Vui lòng chọn vai trò"),
    phone: z.string().trim()
        .optional()
        .refine((value) =>
            !value || /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(value),
            { message: "Số điện thoại không hợp lệ" }
        ),
    address: z.string().trim()
        .max(255, "Địa chỉ quá dài")
        .optional(),
}

export const addStaffSchema = z.object({
    username: z.string().trim()
        .nonempty({ message: "Vui lòng nhập tên tài khoản"})
        .min(3, { message: "Tên tài khoản phải có ít nhất 3 ký tự" }),
    email: z.string().trim()
        .nonempty({ message: "Vui lòng nhập email"})
        .email({ message: "Email không hợp lệ" }),
    password: z.string().trim()
        .nonempty({ message: "Vui lòng nhập mật khẩu"})
        .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
        .regex(/[A-Z]/, { message: "Phải có ít nhất 1 chữ in hoa" })
        .regex(/[a-z]/, { message: "Phải có ít nhất 1 chữ thường" })
        .regex(/[0-9]/, { message: "Phải có ít nhất 1 chữ số" })
        .regex(/[@$!%*?&]/, { message: "Phải có ít nhất 1 ký tự đặc biệt (!@#$%&*?)" }),

    ...baseUserSchema,
})

export const editStaffSchema = z.object({
    password: z.string().trim()
        .nonempty({ message: "Vui lòng nhập mật khẩu"})
        .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
        .regex(/[A-Z]/, { message: "Phải có ít nhất 1 chữ in hoa" })
        .regex(/[a-z]/, { message: "Phải có ít nhất 1 chữ thường" })
        .regex(/[0-9]/, { message: "Phải có ít nhất 1 chữ số" })
        .regex(/[@$!%*?&]/, { message: "Phải có ít nhất 1 ký tự đặc biệt (!@#$%&*?)" })
        .optional(),

    ...baseUserSchema,
})

export const loginSchema = z.object({
    email: z.string().trim()
        .nonempty({ message: "Vui lòng nhập email"})
        .email({ message: "Email không hợp lệ" }),
    password: z.string().trim()
        .nonempty({ message: "Vui lòng nhập mật khẩu"}),
})

export type registerForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;

export type addStaffForm = z.infer<typeof addStaffSchema>;
export type editStaffForm = z.infer<typeof editStaffSchema>;