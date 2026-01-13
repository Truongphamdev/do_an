import { z } from "zod";

export const TableSchema = z.object({
  number: z
    .preprocess(
      (val) => val === "" ? undefined : val,
      z.coerce
        .number({
          required_error: "Vui lòng nhập số bàn.",
          invalid_type_error: "Số bàn phải là số.",
        })
        .int("Số bàn phải là số nguyên.")
        .positive("Số bàn phải lớn hơn 0.")
    ),

  capacity: z
    .preprocess(
      (val) => val === "" ? undefined : val,
      z.coerce
        .number({
          required_error: "Vui lòng nhập sức chứa.",
          invalid_type_error: "Sức chứa phải là số.",
        })
        .int("Sức chứa phải là số nguyên.")
        .positive("Sức chứa phải lớn hơn 0.")
    ),
});

export type TableFormInput = z.input<typeof TableSchema>;
export type TableFormOutput = z.output<typeof TableSchema>;
