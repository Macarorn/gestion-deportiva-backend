import { z } from "zod";

const toAMPM = (h: number, m: number) => {
  const suffix = h >= 12 ? "p.m." : "a.m.";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const horaValidator = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (use HH:mm)");

export const createReservaSchema = z
  .object({
    escenarioId: z.coerce.number().int().positive("Escenario requerido"),
    usuarioId: z.coerce.number().int().positive("Usuario requerido"),
    fecha: z.string().min(1, "La fecha es requerida"),
    hora_inicio: horaValidator,
    hora_fin: horaValidator,
    observaciones: z.string().optional(),
  })
  .refine(
    (data) => {
      const [hI, mI] = data.hora_inicio.split(":").map(Number);
      const [hF, mF] = data.hora_fin.split(":").map(Number);
      const inicioMin = hI * 60 + mI;
      const finMin = hF * 60 + mF;
      return finMin > inicioMin;
    },
    { message: "La hora de fin debe ser posterior a la hora de inicio", path: ["hora_fin"] }
  )
  .refine(
    (data) => {
      const [hI, mI] = data.hora_inicio.split(":").map(Number);
      const [hF, mF] = data.hora_fin.split(":").map(Number);
      const inicioMin = hI * 60 + mI;
      const finMin = hF * 60 + mF;
      return finMin - inicioMin >= 15;
    },
    { message: "La reserva debe durar al menos 15 minutos", path: ["hora_fin"] }
  );

export const updateReservaSchema = z.object({
  observaciones: z.string().optional(),
  observaciones_cierre: z.string().optional(),
});

export const editReservaSchema = z
  .object({
    fecha: z.string().min(1, "La fecha es requerida").optional(),
    hora_inicio: horaValidator.optional(),
    hora_fin: horaValidator.optional(),
    observaciones: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.hora_inicio || !data.hora_fin) return true;
      const [hI, mI] = data.hora_inicio.split(":").map(Number);
      const [hF, mF] = data.hora_fin.split(":").map(Number);
      return (hF * 60 + mF) > (hI * 60 + mI);
    },
    { message: "La hora de fin debe ser posterior a la hora de inicio", path: ["hora_fin"] }
  )
  .refine(
    (data) => {
      if (!data.hora_inicio || !data.hora_fin) return true;
      const [hI, mI] = data.hora_inicio.split(":").map(Number);
      const [hF, mF] = data.hora_fin.split(":").map(Number);
      return (hF * 60 + mF) - (hI * 60 + mI) >= 15;
    },
    { message: "La reserva debe durar al menos 15 minutos", path: ["hora_fin"] }
  );

export const activateReservaSchema = z.object({
  observaciones: z.string().optional(),
});

export const finalizeReservaSchema = z.object({
  observaciones_cierre: z
    .string()
    .min(1, "Las observaciones de cierre son requeridas al finalizar la reserva"),
});

export const cancelReservaSchema = z.object({
  observaciones: z.string().optional(),
});

export const paramsReservaSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const queryReservaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  escenarioId: z.coerce.number().int().positive().optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  estado: z.string().optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
  busqueda: z.string().optional(),
});

export type CreateReservaInput = z.infer<typeof createReservaSchema>;
export type UpdateReservaInput = z.infer<typeof updateReservaSchema>;
export type ActivateReservaInput = z.infer<typeof activateReservaSchema>;
export type FinalizeReservaInput = z.infer<typeof finalizeReservaSchema>;
export type CancelReservaInput = z.infer<typeof cancelReservaSchema>;
export type ParamsReserva = z.infer<typeof paramsReservaSchema>;
export type QueryReserva = z.infer<typeof queryReservaSchema>;
