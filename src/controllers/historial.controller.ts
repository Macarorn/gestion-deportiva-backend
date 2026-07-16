import { Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import { getHistorialSchema } from "../schemas/historial.schema";
import { dateFromISO, endOfDayFromISO } from "../lib/dateUtils";

const formatZodError = (err: ZodError) => {
  return err.issues
    .map((e: any) => e.message)
    .join(", ");
};

/**
 * GET /api/historial
 * Devuelve préstamos y reservas mezclados en una línea de tiempo,
 * con filtros por tipo, estado, usuario, rango de fechas y categoría.
 */
export const getHistorial = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const params = getHistorialSchema.parse(req.query);
    const skip = (params.page - 1) * params.limit;
    const resultados: any[] = [];

    // ===== PRÉSTAMOS =====
    if (params.tipo === "prestamo" || params.tipo === "todos") {
      const wherePrestamo: any = {};

      if (params.estado) {
        const estados = params.estado.split(",").map((e: string) => e.trim()).filter(Boolean);
        wherePrestamo.estado = estados.length > 1 ? { in: estados } : estados[0];
      }
      if (params.usuarioId) {
        wherePrestamo.usuarioId = params.usuarioId;
      }
      if (params.fechaDesde || params.fechaHasta) {
        wherePrestamo.fecha_prestamo = {};
        if (params.fechaDesde) wherePrestamo.fecha_prestamo.gte = dateFromISO(params.fechaDesde);
        if (params.fechaHasta) wherePrestamo.fecha_prestamo.lte = endOfDayFromISO(params.fechaHasta);
      }
      if (params.busqueda) {
        wherePrestamo.OR = [
          { numero_prestamo: { contains: params.busqueda } },
          { usuario: { nombre: { contains: params.busqueda } } },
          { usuario: { apellido: { contains: params.busqueda } } },
        ];
      }
      if (params.categoriaId) {
        wherePrestamo.prestamodetalle = {
          some: {
            material: {
              subcategoria: {
                categoriaId: params.categoriaId,
              },
            },
          },
        };
      }

      const prestamos = await prisma.prestamo.findMany({
        where: wherePrestamo,
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, correo: true, tipo_usuario: true },
          },
          usuario_solicitante: {
            select: { id: true, nombre: true, apellido: true, tipo_usuario: true },
          },
          aprendiz: {
            select: { id: true, nombre: true, apellido: true, tipo_usuario: true },
          },
          prestamodetalle: {
            include: {
              material: {
                select: {
                  id: true,
                  nombre: true,
                  requiere_serial: true,
                  subcategoria: {
                    select: {
                      id: true,
                      nombre: true,
                      categoria: {
                        select: { id: true, nombre: true },
                      },
                    },
                  },
                },
              },
              elemento: true,
            },
          },
          novedad: true,
        },
        orderBy: { fecha_prestamo: "desc" },
      });

      for (const p of prestamos) {
        resultados.push({
          tipo: "prestamo",
          id: p.id,
          fecha: p.fecha_prestamo,
          fechaFin: p.fecha_devolucion_esperada,
          estado: p.estado,
          numero: p.numero_prestamo,
          usuario: p.usuario,
          usuario_solicitante: p.usuario_solicitante,
          aprendiz: p.aprendiz,
          detalle: p.prestamodetalle,
          novedad: p.novedad,
          data: p,
        });
      }
    }

    // ===== RESERVAS =====
    if (params.tipo === "reserva" || params.tipo === "todos") {
      const whereReserva: any = {};

      if (params.estado) {
        whereReserva.estado = params.estado;
      }
      if (params.usuarioId) {
        whereReserva.usuarioId = params.usuarioId;
      }
      if (params.fechaDesde || params.fechaHasta) {
        whereReserva.fecha = {};
        if (params.fechaDesde) whereReserva.fecha.gte = dateFromISO(params.fechaDesde);
        if (params.fechaHasta) whereReserva.fecha.lte = endOfDayFromISO(params.fechaHasta);
      }
      if (params.busqueda) {
        whereReserva.OR = [
          { numero_reserva: { contains: params.busqueda } },
          { escenario: { nombre: { contains: params.busqueda } } },
          { usuario: { nombre: { contains: params.busqueda } } },
        ];
      }

      const reservas = await prisma.reserva.findMany({
        where: whereReserva,
        include: {
          escenario: { select: { id: true, nombre: true, ubicacion: true } },
          usuario: { select: { id: true, nombre: true, apellido: true, correo: true, tipo_usuario: true } },
        },
        orderBy: { fecha: "desc" },
      });

      for (const r of reservas) {
        resultados.push({
          tipo: "reserva",
          id: r.id,
          fecha: r.fecha,
          fechaFin: null,
          estado: r.estado,
          numero: r.numero_reserva,
          usuario: r.usuario,
          escenario: r.escenario,
          observaciones: r.observaciones,
          observaciones_cierre: r.observaciones_cierre,
          observaciones_cancelacion: r.observaciones_cancelacion,
          hora_inicio: r.hora_inicio,
          hora_fin: r.hora_fin,
          data: r,
        });
      }
    }

    resultados.sort((a, b) => {
      const fa = new Date(a.fecha).getTime();
      const fb = new Date(b.fecha).getTime();
      return fb - fa;
    });

    const total = resultados.length;
    const paginados = resultados.slice(skip, skip + params.limit);

    res.json({
      success: true,
      data: paginados,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: formatZodError(err) });
      return;
    }
    console.error("Error al obtener historial:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};
