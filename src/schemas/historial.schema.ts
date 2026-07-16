import { z } from "zod"

export const getHistorialSchema = z.object({
  tipo: z.enum(["prestamo", "reserva", "todos"]).default("todos"),
  estado: z.string().optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  busqueda: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
})

type GetHistorialInput = z.infer<typeof getHistorialSchema>

export { GetHistorialInput }
