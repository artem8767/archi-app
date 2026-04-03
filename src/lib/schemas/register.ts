import { z } from "zod";

export const registerRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Вкажіть email")
    .email("Некоректний формат email"),
  phone: z
    .string()
    .trim()
    .min(8, "Телефон занадто короткий (мінімум 8 символів)")
    .max(40, "Телефон занадто довгий"),
  password: z
    .string()
    .min(8, "Пароль має бути не коротший за 8 символів")
    .max(128, "Пароль занадто довгий"),
  name: z
    .string()
    .trim()
    .min(1, "Вкажіть ім'я — так інші бачитимуть вас у чаті та коментарях")
    .max(120, "Ім'я занадто довге"),
});

export type RegisterRequestInput = z.input<typeof registerRequestSchema>;
export type RegisterRequest = z.output<typeof registerRequestSchema>;
