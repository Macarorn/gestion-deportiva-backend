import { z } from "zod";

const timeSlotSchema = z.object({
  inicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
  fin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:MM)"),
});

const horarioSchema = z.object({
  lunes: z.array(timeSlotSchema).optional(),
  martes: z.array(timeSlotSchema).optional(),
  miercoles: z.array(timeSlotSchema).optional(),
  jueves: z.array(timeSlotSchema).optional(),
  viernes: z.array(timeSlotSchema).optional(),
  sabado: z.array(timeSlotSchema).optional(),
  domingo: z.array(timeSlotSchema).optional(),
}).optional().superRefine((data, ctx) => {
  if (!data) return;
  const dias = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"] as const;
  for (const dia of dias) {
    const slots = data[dia];
    if (!slots) continue;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const [inicioH] = slot.inicio.split(":").map(Number);
      const [finH, finM] = slot.fin.split(":").map(Number);
      const [inicioH2, inicioM2] = slot.inicio.split(":").map(Number);
      const inicioMinutos = inicioH2 * 60 + inicioM2;
      const finMinutos = finH * 60 + finM;
      if (inicioH < 5 || inicioH > 22) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `En ${dia}, horario #${i + 1}: la hora de inicio debe estar entre 05:00 y 22:00`,
          path: [dia, i],
        });
      }
      if (finMinutos <= inicioMinutos) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `En ${dia}, horario #${i + 1}: la hora de fin debe ser posterior a la hora de inicio`,
          path: [dia, i],
        });
      }
    }
  }
});

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
  horario_disponibilidad: horarioSchema,
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
  horario_disponibilidad: horarioSchema,
  observaciones: z
    .string()
    .max(500, "Observaciones no pueden exceder 500 caracteres")
    .optional(),
});

export const getEscenarioSchema = z.object({
  id: z.coerce.number().int().positive("ID debe ser un número positivo"),
});

export type CreateEscenarioInput = z.infer<typeof createEscenarioSchema>;
export type UpdateEscenarioInput = z.infer<typeof updateEscenarioSchema>;
export type GetEscenarioInput = z.infer<typeof getEscenarioSchema>;
export type HorarioDisponibilidad = z.infer<typeof horarioSchema>;
