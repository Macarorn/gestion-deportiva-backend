import { z } from "zod";

export const loginSchema = z.object({
  correo: z.string().trim().email("Correo invalido"),
  contrasena: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres"),
  recordar: z.boolean().optional(),
});
