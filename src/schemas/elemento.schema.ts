import { z } from "zod";

export const createElementoSchema = z.object({
  materialId: z
    .number()
    .int()
    .positive("materialId debe ser un número positivo"),
  nombre_serial: z
    .string()
    .min(1, "nombre_serial es requerido")
    .max(100, "nombre_serial no puede exceder 100 caracteres"),
  estado: z
    .enum(["disponible", "dañado", "mantenimiento", "prestado"], {
      message: "Estado debe ser: disponible, dañado, mantenimiento o prestado"
    })
    .default("disponible"),
  observaciones: z
    .string()
    .max(500, "observaciones no puede exceder 500 caracteres")
    .optional()
    .nullable(),
});

export const updateElementoSchema = z.object({
  materialId: z
    .number()
    .int()
    .positive("materialId debe ser un número positivo")
    .optional(),
  nombre_serial: z
    .string()
    .min(1, "nombre_serial es requerido")
    .max(100, "nombre_serial no puede exceder 100 caracteres")
    .optional(),
  estado: z.enum(["disponible", "dañado", "mantenimiento", "prestado"], {
    message: "Estado debe ser: disponible, dañado, mantenimiento o prestado"
  }).optional(),
  observaciones: z
    .string()
    .max(500, "observaciones no puede exceder 500 caracteres")
    .optional()
    .nullable(),
});

export const getElementoSchema = z.object({
  id: z.coerce.number().int().positive("ID debe ser un número positivo"),
});

export type CreateElementoInput = z.infer<typeof createElementoSchema>;
export type UpdateElementoInput = z.infer<typeof updateElementoSchema>;
export type GetElementoInput = z.infer<typeof getElementoSchema>;
