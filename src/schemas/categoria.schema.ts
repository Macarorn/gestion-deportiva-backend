import { z } from "zod";

export const createCategoriaSchema = z.object({
  nombre: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "Descripción no puede exceder 500 caracteres")
    .optional(),
  estado: z.boolean().default(true).optional(),
});

export const updateCategoriaSchema = z.object({
  nombre: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .optional(),
  descripcion: z
    .string()
    .max(500, "Descripción no puede exceder 500 caracteres")
    .optional(),
  estado: z.boolean().optional(),
});

export const getCategoriaSchema = z.object({
  id: z.number().int().positive("ID debe ser un número positivo"),
});

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>;
export type GetCategoriaInput = z.infer<typeof getCategoriaSchema>;
