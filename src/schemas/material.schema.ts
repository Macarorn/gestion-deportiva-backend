import { z } from "zod";

export const createMaterialSchema = z.object({
  nombre: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "Descripción no puede exceder 500 caracteres")
    .optional(),
  subCategoriaId: z
    .number()
    .int()
    .positive("subCategoriaId debe ser un número positivo"),
  cantidad_total: z
    .number()
    .int()
    .min(0, "cantidad_total debe ser >= 0")
    .default(0)
    .optional(),
  cantidad_disponible: z
    .number()
    .int()
    .min(0, "cantidad_disponible debe ser >= 0")
    .default(0)
    .optional(),
  cantidad_prestada: z
    .number()
    .int()
    .min(0, "cantidad_prestada debe ser >= 0")
    .default(0)
    .optional(),
  cantidad_danada: z
    .number()
    .int()
    .min(0, "cantidad_danada debe ser >= 0")
    .default(0)
    .optional(),
  cantidad_mantenimiento: z
    .number()
    .int()
    .min(0, "cantidad_mantenimiento debe ser >= 0")
    .default(0)
    .optional(),
  requiere_serial: z
    .boolean()
    .default(false)
    .optional(),
  estado: z
    .enum(["activo", "inactivo", "mantenimiento"])
    .default("activo")
    .optional(),
  fotografia: z
    .string()
    .optional()
    .nullable(),
  observaciones: z
    .string()
    .max(500, "observaciones no puede exceder 500 caracteres")
    .optional()
    .nullable(),
  elementos: z.array(z.object({
    nombre_serial: z.string().min(1, "nombre_serial es requerido"),
    estado: z.string().default("disponible"),
  })).optional(),
});

export const updateMaterialSchema = z.object({
  nombre: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .optional(),
  descripcion: z
    .string()
    .max(500, "Descripción no puede exceder 500 caracteres")
    .optional(),
  subCategoriaId: z
    .number()
    .int()
    .positive("subCategoriaId debe ser un número positivo")
    .optional(),
  cantidad_total: z
    .number()
    .int()
    .min(0, "cantidad_total debe ser >= 0")
    .optional(),
  cantidad_disponible: z
    .number()
    .int()
    .min(0, "cantidad_disponible debe ser >= 0")
    .optional(),
  cantidad_prestada: z
    .number()
    .int()
    .min(0, "cantidad_prestada debe ser >= 0")
    .optional(),
  cantidad_danada: z
    .number()
    .int()
    .min(0, "cantidad_danada debe ser >= 0")
    .optional(),
  cantidad_mantenimiento: z
    .number()
    .int()
    .min(0, "cantidad_mantenimiento debe ser >= 0")
    .optional(),
  requiere_serial: z
    .boolean()
    .optional(),
  estado: z.enum(["activo", "inactivo", "mantenimiento"]).optional(),
  fotografia: z
    .string()
    .optional()
    .nullable(),
  observaciones: z
    .string()
    .max(500, "observaciones no puede exceder 500 caracteres")
    .optional()
    .nullable(),
  elementos: z.array(z.object({
    id: z.number().optional(),
    nombre_serial: z.string().min(1, "nombre_serial es requerido"),
    estado: z.string(),
  })).optional(),
});

export const getMaterialSchema = z.object({
  id: z.coerce.number().int().positive("ID debe ser un número positivo"),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type GetMaterialInput = z.infer<typeof getMaterialSchema>;
