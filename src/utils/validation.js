import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
  remember: z.boolean().optional(),
});

export const forgotSchema = z.object({
  email: z.string().trim().email("Email tidak valid."),
});

export const resetSchema = z
  .object({
    token: z.string().trim().min(32, "Token reset tidak valid."),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .regex(/[A-Z]/, "Password harus mengandung huruf besar.")
      .regex(/[a-z]/, "Password harus mengandung huruf kecil.")
      .regex(/[0-9]/, "Password harus mengandung angka."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama.",
  });

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Nama lengkap minimal 2 karakter."),
    email: z.string().trim().email("Email tidak valid."),
    password: z.string().min(8, "Password minimal 8 karakter."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama.",
  });

export const activationTokenSchema = z.object({
  token: z.string().trim().min(32, "Token aktivasi tidak valid."),
});
