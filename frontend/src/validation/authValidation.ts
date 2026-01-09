import { z } from "zod"

// export const registerSchema = z.object({
//     username: z.string().trim()
//         .nonempty({ message: "Vui lòng nhập tên tài khoản"})
//         .min(3, { message: "Tên tài khoản phải có ít nhất 3 ký tự" }),
//     first_name: z.string().trim()
//         .nonempty({ message: "Vui lòng nhập họ"})
//         .min(2, { message: "Họ phải có ít nhất 2 ký tự" }),
//     last_name: z.string().trim()
//         .nonempty({ message: "Vui lòng nhập tên"})
//         .min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
//     email: z.string().trim()
//         .nonempty({ message: "Vui lòng nhập email"})
//         .email({ message: "Email không hợp lệ" }),
//     password: z.string().trim()
//         .nonempty({ message: "Vui lòng nhập mật khẩu"})
//         .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
//         .regex(/[A-Z]/, { message: "Phải có ít nhất 1 chữ in hoa" })
//         .regex(/[a-z]/, { message: "Phải có ít nhất 1 chữ thường" })
//         .regex(/[0-9]/, { message: "Phải có ít nhất 1 chữ số" })
//         .regex(/[@$!%*?&]/, { message: "Phải có ít nhất 1 ký tự đặc biệt (!@#$%&*?)" }),
//     role: z.enum(['waiter', 'chef', 'cashier', 'customer'], {
//         errorMap: () => ({ message: "Vai trò không hợp lệ!"})
//     }),
//     phone: z.string().trim()
//         .optional()
//         .refine(
//             (v) => !v || /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(v),
//             { message: "Số điện thoại không hợp lệ" }
//         ),
//     address: z.string().trim()
//         .optional(),
// });

export const registerBaseSchema = z.object({
    username: z.string().trim().min(3, { message: "Tên tài khoản phải có ít nhất 3 ký tự" }).optional(),
    first_name: z.string().trim().min(2, { message: "Họ phải có ít nhất 2 ký tự"}),
    last_name: z.string().trim().min(2, { message: "Tên phải có ít nhất 2 ký tự"}),
    email: z.string().trim().email({ message: "Email không hợp lệ!"}).optional(),
    password: z.string().trim().optional(),
    role: z.enum(['waiter', 'chef', 'cashier', 'customer']).optional(),
    phone: z.string().trim().optional().refine(
        value => !value || /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/.test(value),
        { message: "Số điện thoại không hợp lệ!"}
    ),
    address: z.string().trim().optional(),
});

export const registerSchema = (isEditing: boolean) => {
    return registerBaseSchema.superRefine((data, ctx) => {
        // ===== ADD STAFF || REGISTER =====
        if (!isEditing) {
            // username
            if (!data.username) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['username'],
                    message: "Vui lòng nhập tên tài khoản!",
                });
            }
            // email
            if (!data.email) ({
                code: z.ZodIssueCode.custom,
                path: ['email'],
                message: "Vui lòng nhập email!",
            })
            // role
            if (!data.role) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['role'],
                    message: "Vui lòng nhập vai trò!",
                });
            }
            // password
            if (!data.password) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['password'],
                    message: "Vui lòng nhập mật khẩu!",
                });
                return;
            }

            // === REGISTER PASSWORD RULE ===
            if (data.password.length < 8) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['password'],
                    message: "Mật khẩu phải có ít nhất 8 kí tự!",
                });
            }

            if (!/[A-Z]/.test(data.password)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['password'],
                    message: "Mật khẩu phải có ít nhất 1 chữ in hoa!",
                });
            }

            if (!/[a-z]/.test(data.password)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['password'],
                    message: "Mật khẩu phải có ít nhất 1 chữ thường!",
                });
            }

            if (!/[0-9]/.test(data.password)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['password'],
                    message: "Mật khẩu phải có ít nhất 1 chữ số!",
                });
            }

            if (!/[@$!%*?&]/.test(data.password)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['password'],
                    message: "Mật khẩu phải có ít nhất 1 kí tự đặc biệt!",
                });
            }
        }

        // ===== EDIT STAFF =====
        // không cần làm gì thêm
        // password, username, role → không bắt buộc
    })
};

export const loginSchema = z.object({
    email: z.string().trim()
        .nonempty({ message: "Vui lòng nhập email"})
        .email({ message: "Email không hợp lệ" }),
    password: z.string().trim()
        .nonempty({ message: "Vui lòng nhập mật khẩu"}),
})

export type registerForm = z.infer<typeof registerBaseSchema>;
export type LoginForm = z.infer<typeof loginSchema>;