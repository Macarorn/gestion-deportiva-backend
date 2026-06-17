import { z } from "zod";

export const createSubCategoriaSchema = z.object({
  nombre: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "Descripción no puede exceder 500 caracteres")
    .optional(),
  categoriaId: z
    .number()
    .int()
    .positive("categoriaId debe ser un número positivo"),
  estado: z.boolean().default(true).optional(),
});

export const updateSubCategoriaSchema = z.object({
  nombre: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .optional(),
  descripcion: z
    .string()
    .max(500, "Descripción no puede exceder 500 caracteres")
    .optional(),
  categoriaId: z
    .number()
    .int()
    .positive("categoriaId debe ser un número positivo")
    .optional(),
  estado: z.boolean().optional(),
});

export const getSubCategoriaSchema = z.object({
  id: z.coerce.number().int().positive("ID debe ser un número positivo"),
});

export type CreateSubCategoriaInput = z.infer<typeof createSubCategoriaSchema>;
export type UpdateSubCategoriaInput = z.infer<typeof updateSubCategoriaSchema>;
export type GetSubCategoriaInput = z.infer<typeof getSubCategoriaSchema>;
