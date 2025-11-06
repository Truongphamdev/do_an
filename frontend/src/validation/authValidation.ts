import { z } from "zod"

export const registerSchema = z.object({
    username: z.string().trim()
        .min(3, { message: "Tên tài khoản phải có ít nhất 3 ký tự" }),
    first_name: z.string().trim()
        .min(2, { message: "Họ phải có ít nhất 2 ký tự" }),
    last_name: z.string().trim()
        .min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    email: z.string().trim()
        .email({ message: "Email không hợp lệ" }),
    password: z.string().trim()
        .nonempty({ message: "Vui lòng nhập mật khẩu"})
        .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
        .regex(/[A-Z]/, { message: "Phải có ít nhất 1 chữ in hoa" })
        .regex(/[a-z]/, { message: "Phải có ít nhất 1 chữ thường" })
        .regex(/[0-9]/, { message: "Phải có ít nhất 1 chữ số" }),
    role: z.string()
        .min(1, "Vui lòng chọn vai trò"),
});

export const loginSchema = z.object({
    email: z.string().trim()
        .email({ message: "Email không hợp lệ" }),
    password: z.string().trim()
        .nonempty({ message: "Vui lòng nhập mật khẩu"}),
})

export type registerForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;