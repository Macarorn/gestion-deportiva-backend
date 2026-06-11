import { z } from "zod";

export const createEscenarioSchema = z.object({
  nombre: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .max(500, "Descripción no puede exceder 500 caracteres")
    .optional(),
  ubicacion: z
    .string()
    .min(3, "Ubicación debe tener al menos 3 caracteres")
    .max(100, "Ubicación no puede exceder 100 caracteres"),
  capacidad_maxima: z
    .number()
    .int()
    .positive("Capacidad debe ser un número positivo"),
  estado: z.boolean().default(true).optional(),
  horario_disponibilidad: z
    .string()
    .max(100, "Horario no puede exceder 100 caracteres")
    .optional(),
  observaciones: z
    .string()
    .max(500, "Observaciones no pueden exceder 500 caracteres")
    .optional(),
});

export const updateEscenarioSchema = z.object({
  nombre: z
    .string()
    .min(3, "Nombre debe tener al menos 3 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .optional(),
  descripcion: z
    .string()
    .max(500, "Descripción no puede exceder 500 caracteres")
    .optional(),
  ubicacion: z
    .string()
    .min(3, "Ubicación debe tener al menos 3 caracteres")
    .max(100, "Ubicación no puede exceder 100 caracteres")
    .optional(),
  capacidad_maxima: z
    .number()
    .int()
    .positive("Capacidad debe ser un número positivo")
    .optional(),
  estado: z.boolean().optional(),
  horario_disponibilidad: z
    .string()
    .max(100, "Horario no puede exceder 100 caracteres")
    .optional(),
  observaciones: z
    .string()
    .max(500, "Observaciones no pueden exceder 500 caracteres")
    .optional(),
});

export const getEscenarioSchema = z.object({
  id: z.number().int().positive("ID debe ser un número positivo"),
});

export type CreateEscenarioInput = z.infer<typeof createEscenarioSchema>;
export type UpdateEscenarioInput = z.infer<typeof updateEscenarioSchema>;
export type GetEscenarioInput = z.infer<typeof getEscenarioSchema>;
