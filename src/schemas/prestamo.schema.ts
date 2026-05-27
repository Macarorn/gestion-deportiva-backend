import { z } from "zod"

export const createPrestamoSchema = z.object({
  usuarioId: z.number().int().positive("Usuario es requerido"),
  usuarioSolicitanteId: z.number().int().positive().optional(),
  aprendizId: z.number().int().positive().optional(),
  detalles: z.array(
    z.object({
      materialId: z.number().int().positive("Material es requerido"),
      elementoId: z.number().int().positive().optional(),
      cantidad_solicitada: z.number().int().positive("Cantidad debe ser mayor a 0"),
      observaciones: z.string().optional()
    })
  ).min(1, "Debe incluir al menos un material"),
  fecha_prestamo: z.string().datetime(),
  fecha_devolucion_esperada: z.string().datetime(),
  hora_entrega: z.string().optional(),
  observaciones: z.string().optional()
}).refine((data) => {
  const fechaPrestamo = new Date(data.fecha_prestamo);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const prestamoDateOnly = new Date(fechaPrestamo.getFullYear(), fechaPrestamo.getMonth(), fechaPrestamo.getDate());
  return prestamoDateOnly >= today;
}, {
  message: "La fecha de préstamo no puede ser una fecha pasada",
  path: ["fecha_prestamo"],
}).refine((data) => {
  const fechaPrestamo = new Date(data.fecha_prestamo);
  const fechaDevolucion = new Date(data.fecha_devolucion_esperada);
  return fechaDevolucion > fechaPrestamo;
}, {
  message: "La fecha de devolución esperada debe ser posterior a la fecha de préstamo",
  path: ["fecha_devolucion_esperada"],
}).refine((data) => {
  const fechaDevolucion = new Date(data.fecha_devolucion_esperada);
  const now = new Date();
  // Normalizar a inicio del día para permitir préstamos que vencen hoy
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const devolucionDateOnly = new Date(fechaDevolucion.getFullYear(), fechaDevolucion.getMonth(), fechaDevolucion.getDate());
  return devolucionDateOnly >= today;
}, {
  message: "La fecha de devolución esperada no puede ser una fecha pasada",
  path: ["fecha_devolucion_esperada"],
})

export const activarPrestamoSchema = z.object({
  detalles: z.array(
    z.object({
      detalle_id: z.number().int(),
      cantidad_entregada: z.number().int().min(0)
    })
  )
})

export const devolverPrestamoSchema = z.object({
  detalles: z.array(
    z.object({
      detalle_id: z.number().int(),
      cantidad_devuelta: z.number().int().min(0),
      cantidad_danada: z.number().int().min(0).default(0),
      cantidad_faltante: z.number().int().min(0).default(0),
      elementoId: z.number().int().positive().optional(),
      elementosConNovedad: z.array(
        z.object({
          elementoId: z.number().int().positive(),
          estado: z.enum(["devuelto", "dañado", "faltante"]),
          descripcion: z.string().optional(),
        })
      ).optional(),
      novedades: z.array(
        z.object({
          tipo: z.enum(["daño", "pérdida"]),
          descripcion: z.string().min(1),
          cantidad_afectada: z.number().int().positive(),
          elementoId: z.number().int().positive().optional(),
        })
      ).optional()
    })
  ),
  observaciones: z.string().optional()
})

export const cancelarPrestamoSchema = z.object({
  motivo: z.string().optional()
})

export const getPrestamosSchema = z.object({
  estado: z.enum(["pendiente", "activo", "devuelto", "vencido", "cancelado"]).optional(),
  usuarioId: z.coerce.number().int().positive().optional(),
  busqueda: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10)
})

export const getPrestamoByIdSchema = z.object({
  id: z.number().int().positive("ID debe ser un número positivo")
})

type CreatePrestamoInput = z.infer<typeof createPrestamoSchema>
type ActivarPrestamoInput = z.infer<typeof activarPrestamoSchema>
type DevolverPrestamoInput = z.infer<typeof devolverPrestamoSchema>
type CancelarPrestamoInput = z.infer<typeof cancelarPrestamoSchema>
type GetPrestamosInput = z.infer<typeof getPrestamosSchema>
type GetPrestamoByIdInput = z.infer<typeof getPrestamoByIdSchema>

export { 
  CreatePrestamoInput, 
  ActivarPrestamoInput, 
  DevolverPrestamoInput, 
  CancelarPrestamoInput,
  GetPrestamosInput,
  GetPrestamoByIdInput
}
