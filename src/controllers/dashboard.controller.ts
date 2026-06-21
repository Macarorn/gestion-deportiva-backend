import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** GET /dashboard/admin */
export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPrestamosActivos,
      totalPrestamosPendientes,
      totalReservasPendientes,
      totalReservasHoy,
      materialesEnPrestamo,
      escenariosDisponibles,
      totalMateriales,
      totalUsuarios,
      prestamosVencidos,
      prestamosPorMes,
      ultimosPrestamos,
      reservasProximas,
    ] = await Promise.all([
      prisma.prestamo.count({ where: { estado: "activo" } }),
      prisma.prestamo.count({ where: { estado: "pendiente" } }),
      prisma.reserva.count({ where: { estado: "pendiente" } }),
      prisma.reserva.count({
        where: {
          estado: { in: ["pendiente", "activa"] },
          fecha: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
      }),
      prisma.prestamodetalle.aggregate({
        where: { prestamo: { estado: "activo" } },
        _sum: { cantidad_entregada: true },
      }),
      prisma.escenario.count({ where: { estado: true } }),
      prisma.material.count({ where: { estado: true } }),
      prisma.usuario.count({ where: { estado: true } }),
      prisma.prestamo.count({ where: { estado: "vencido" } }),
      getPrestamosPorMes(),
      prisma.prestamo.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.reserva.findMany({
        where: {
          estado: { in: ["pendiente", "activa"] },
          fecha: { gte: inicioMes },
        },
        take: 5,
        orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
        include: {
          escenario: { select: { nombre: true } },
          usuario: { select: { nombre: true, apellido: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          prestamosActivos: totalPrestamosActivos,
          prestamosPendientes: totalPrestamosPendientes,
          prestamosVencidos,
          reservasPendientes: totalReservasPendientes,
          reservasHoy: totalReservasHoy,
          materialesEnPrestamo: materialesEnPrestamo._sum.cantidad_entregada || 0,
          escenariosDisponibles,
          totalMateriales,
          totalUsuarios,
        },
        prestamosPorMes,
        ultimosPrestamos,
        reservasProximas,
      },
    });
  } catch (err) {
    console.error("Error dashboard admin:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

/** GET /dashboard/almacenista */
export const getAlmacenistaDashboard = async (_req: Request, res: Response) => {
  try {
    const now = new Date();

    const [
      prestamosPendientesAprobacion,
      prestamosActivos,
      devolucionesHoy,
      prestamosVencidos,
      materialesConNovedad,
      prestamosPendientes,
      reservasHoy,
      ultimasNovedades,
    ] = await Promise.all([
      prisma.prestamo.count({ where: { estado: "pendiente" } }),
      prisma.prestamo.count({ where: { estado: "activo" } }),
      prisma.prestamo.count({
        where: {
          estado: "activo",
          fecha_devolucion_esperada: {
            lte: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          },
        },
      }),
      prisma.prestamo.count({ where: { estado: "vencido" } }),
      prisma.novedad.count(),
      prisma.prestamo.findMany({
        where: { estado: "pendiente" },
        take: 5,
        orderBy: { createdAt: "asc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          usuarioSolicitante: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.reserva.findMany({
        where: {
          estado: { in: ["pendiente", "activa"] },
          fecha: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
          },
        },
        orderBy: { hora_inicio: "asc" },
        include: {
          escenario: { select: { nombre: true } },
          usuario: { select: { nombre: true, apellido: true } },
        },
      }),
      prisma.novedad.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          prestamo: { select: { numero_prestamo: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          prestamosPendientesAprobacion,
          prestamosActivos,
          devolucionesHoy,
          prestamosVencidos,
          materialesConNovedad,
        },
        prestamosPendientes,
        reservasHoy,
        ultimasNovedades,
      },
    });
  } catch (err) {
    console.error("Error dashboard almacenista:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

/** GET /dashboard/instructor */
export const getInstructorDashboard = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const usuarioId = user.id;
    const now = new Date();

    const [
      misPrestamosActivos,
      misReservasProximas,
      misPrestamosVencidos,
      materialesEnMiPoder,
      ultimosMisPrestamos,
      proximasReservas,
    ] = await Promise.all([
      prisma.prestamo.count({ where: { usuarioId, estado: "activo" } }),
      prisma.reserva.count({
        where: {
          usuarioId,
          estado: { in: ["pendiente", "activa"] },
          fecha: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
        },
      }),
      prisma.prestamo.count({ where: { usuarioId, estado: "vencido" } }),
      prisma.prestamodetalle.aggregate({
        where: { prestamo: { usuarioId, estado: "activo" } },
        _sum: { cantidad_entregada: true },
      }),
      prisma.prestamo.findMany({
        where: { usuarioId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.reserva.findMany({
        where: {
          usuarioId,
          estado: { in: ["pendiente", "activa"] },
          fecha: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
        },
        take: 5,
        orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
        include: {
          escenario: { select: { nombre: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          misPrestamosActivos,
          misReservasProximas,
          misPrestamosVencidos,
          materialesEnMiPoder: materialesEnMiPoder._sum.cantidad_entregada || 0,
        },
        ultimosMisPrestamos,
        proximasReservas,
      },
    });
  } catch (err) {
    console.error("Error dashboard instructor:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

/** Helper: préstamos agrupados por mes (últimos 6 meses) */
async function getPrestamosPorMes() {
  const meses: { mes: string; cantidad: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const fin = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59);

    const count = await prisma.prestamo.count({
      where: {
        createdAt: { gte: inicio, lte: fin },
      },
    });

    const label = fecha.toLocaleDateString("es-CO", { month: "short", year: "2-digit" });
    meses.push({ mes: label, cantidad: count });
  }

  return meses;
}
