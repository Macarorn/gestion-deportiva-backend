import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hoyDate(): Date {
  const d = new Date();
  return new Date(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T12:00:00`);
}

function hoyStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function mesInicioDate(): Date {
  const d = new Date();
  return new Date(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01T12:00:00`);
}

/** GET /dashboard/admin */
export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const hoy = hoyDate();
    const mesInicio = mesInicioDate();

    const [
      totalPrestamosActivos,
      prestamosActivosLista,
      totalPrestamosPendientes,
      prestamosPendientesLista,
      totalReservasHoy,
      reservasHoyLista,
      materialesEnPrestamo,
      materialesEnPrestamoLista,
      prestamosVencidosHoy,
      prestamosVencidosHoyLista,
      prestamosPorVencer,
      prestamosPorVencerLista,
      materialesConNovedad,
      novedadesLista,
      prestamosPorMes,
      prestamosPorDia,
      reservasPorDia,
      materialesMasPrestados,
      reservasPorEscenario,
    ] = await Promise.all([
      prisma.prestamo.count({ where: { estado: "activo" } }),
      prisma.prestamo.findMany({
        where: { estado: "activo" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.prestamo.count({ where: { estado: "pendiente" } }),
      prisma.prestamo.findMany({
        where: { estado: "pendiente" },
        take: 10,
        orderBy: { createdAt: "asc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.reserva.count({
        where: {
          estado: { in: ["pendiente", "activa"] },
          fecha: hoy,
        },
      }),
      prisma.reserva.findMany({
        where: {
          estado: { in: ["pendiente", "activa"] },
          fecha: hoy,
        },
        take: 10,
        orderBy: { hora_inicio: "asc" },
        include: {
          escenario: { select: { nombre: true } },
          usuario: { select: { nombre: true, apellido: true } },
        },
      }),
      prisma.prestamodetalle.aggregate({
        where: { prestamo: { estado: "activo" } },
        _sum: { cantidad_entregada: true },
      }),
      prisma.prestamodetalle.findMany({
        where: { prestamo: { estado: "activo" } },
        include: {
          material: { select: { nombre: true } },
          prestamo: { select: { numero_prestamo: true, usuario: { select: { nombre: true, apellido: true } } } },
        },
        orderBy: { id: "desc" },
      }),
      prisma.prestamo.count({
        where: {
          estado: "activo",
          fecha_devolucion_esperada: { lte: hoy },
        },
      }),
      prisma.prestamo.findMany({
        where: {
          estado: "activo",
          fecha_devolucion_esperada: { lte: hoy },
        },
        take: 10,
        orderBy: { fecha_devolucion_esperada: "asc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.prestamo.count({
        where: {
          estado: "activo",
          fecha_devolucion_esperada: {
            gt: hoy,
            lte: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.prestamo.findMany({
        where: {
          estado: "activo",
          fecha_devolucion_esperada: {
            gt: hoy,
            lte: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
          },
        },
        take: 10,
        orderBy: { fecha_devolucion_esperada: "asc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.novedad.count(),
      prisma.novedad.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          prestamo: { select: { numero_prestamo: true } },
        },
      }),
      getPrestamosPorMes(),
      getActividadPorDia("prestamo"),
      getActividadPorDia("reserva"),
      getMaterialesMasPrestados(),
      getReservasPorEscenario(),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          prestamosActivos: totalPrestamosActivos,
          prestamosPendientes: totalPrestamosPendientes,
          prestamosVencidosHoy,
          prestamosPorVencer,
          reservasHoy: totalReservasHoy,
          materialesEnPrestamo: materialesEnPrestamo._sum.cantidad_entregada || 0,
          materialesConNovedad,
        },
        materialesEnPrestamoLista,
        prestamosActivosLista,
        prestamosPendientesLista,
        reservasHoyLista,
        prestamosVencidosHoyLista,
        prestamosPorVencerLista,
        novedadesLista,
        prestamosPorMes,
        prestamosPorDia: prestamosPorDia,
        reservasPorDia: reservasPorDia,
        materialesMasPrestados,
        reservasPorEscenario,
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
    const hoy = hoyDate();

    const [
      totalPrestamosPendientes,
      prestamosPendientesLista,
      totalPrestamosActivos,
      prestamosActivosLista,
      devolucionesHoy,
      devolucionesHoyLista,
      prestamosPorVencer,
      prestamosPorVencerLista,
      materialesConNovedad,
      novedadesLista,
      reservasHoy,
      reservasHoyLista,
      prestamosPorDia,
      reservasPorDia,
    ] = await Promise.all([
      prisma.prestamo.count({ where: { estado: "pendiente" } }),
      prisma.prestamo.findMany({
        where: { estado: "pendiente" },
        take: 10,
        orderBy: { createdAt: "asc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          usuario_solicitante: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.prestamo.count({ where: { estado: "activo" } }),
      prisma.prestamo.findMany({
        where: { estado: "activo" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.prestamo.count({
        where: {
          estado: "activo",
          fecha_devolucion_esperada: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      prisma.prestamo.findMany({
        where: {
          estado: "activo",
          fecha_devolucion_esperada: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        take: 10,
        orderBy: { fecha_devolucion_esperada: "asc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.prestamo.count({
        where: {
          estado: "activo",
          fecha_devolucion_esperada: {
            gt: hoy,
            lte: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.prestamo.findMany({
        where: {
          estado: "activo",
          fecha_devolucion_esperada: {
            gt: hoy,
            lte: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
          },
        },
        take: 10,
        orderBy: { fecha_devolucion_esperada: "asc" },
        include: {
          usuario: { select: { nombre: true, apellido: true } },
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.novedad.count(),
      prisma.novedad.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          prestamo: { select: { numero_prestamo: true } },
        },
      }),
      prisma.reserva.count({
        where: {
          estado: { in: ["pendiente", "activa"] },
          fecha: hoy,
        },
      }),
      prisma.reserva.findMany({
        where: {
          estado: { in: ["pendiente", "activa"] },
          fecha: hoy,
        },
        take: 10,
        orderBy: { hora_inicio: "asc" },
        include: {
          escenario: { select: { nombre: true } },
          usuario: { select: { nombre: true, apellido: true } },
        },
      }),
      getActividadPorDia("prestamo"),
      getActividadPorDia("reserva"),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          prestamosPendientesAprobacion: totalPrestamosPendientes,
          prestamosActivos: totalPrestamosActivos,
          devolucionesHoy,
          prestamosPorVencer,
          materialesConNovedad,
          reservasHoy,
        },
        prestamosPendientesLista,
        prestamosActivosLista,
        devolucionesHoyLista,
        prestamosPorVencerLista,
        novedadesLista,
        reservasHoy,
        reservasHoyLista,
        prestamosPorDia,
        reservasPorDia,
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
    const hoy = hoyDate();

    const [
      totalMisPrestamosActivos,
      misPrestamosActivosLista,
      totalMisReservasProximas,
      misReservasProximasLista,
      misPrestamosVencidosHoy,
      misPrestamosVencidosHoyLista,
      materialesEnMiPoder,
      misPrestamosPorDia,
      misReservasPorDia,
    ] = await Promise.all([
      prisma.prestamo.count({ where: { usuarioId, estado: "activo" } }),
      prisma.prestamo.findMany({
        where: { usuarioId, estado: "activo" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.reserva.count({
        where: {
          usuarioId,
          estado: { in: ["pendiente", "activa"] },
          fecha: { gte: hoy },
        },
      }),
      prisma.reserva.findMany({
        where: {
          usuarioId,
          estado: { in: ["pendiente", "activa"] },
          fecha: { gte: hoy },
        },
        take: 10,
        orderBy: [{ fecha: "asc" }, { hora_inicio: "asc" }],
        include: {
          escenario: { select: { nombre: true } },
        },
      }),
      prisma.prestamo.count({
        where: {
          usuarioId,
          estado: "activo",
          fecha_devolucion_esperada: { lte: hoy },
        },
      }),
      prisma.prestamo.findMany({
        where: {
          usuarioId,
          estado: "activo",
          fecha_devolucion_esperada: { lte: hoy },
        },
        take: 10,
        orderBy: { fecha_devolucion_esperada: "asc" },
        include: {
          prestamodetalle: { include: { material: { select: { nombre: true } } } },
        },
      }),
      prisma.prestamodetalle.aggregate({
        where: { prestamo: { usuarioId, estado: "activo" } },
        _sum: { cantidad_entregada: true },
      }),
      getActividadPorDiaInstructor("prestamo", usuarioId),
      getActividadPorDiaInstructor("reserva", usuarioId),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          misPrestamosActivos: totalMisPrestamosActivos,
          misReservasProximas: totalMisReservasProximas,
          misPrestamosVencidosHoy,
          materialesEnMiPoder: materialesEnMiPoder._sum.cantidad_entregada || 0,
        },
        misPrestamosActivosLista,
        misReservasProximasLista,
        misPrestamosVencidosHoyLista,
        misPrestamosPorDia,
        misReservasPorDia,
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

async function getActividadPorDia(tipo: "prestamo" | "reserva") {
  const dias: { dia: string; cantidad: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(now);
    fecha.setDate(fecha.getDate() - i);
    const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0);
    const fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59);

    let count: number;
    if (tipo === "prestamo") {
      count = await prisma.prestamo.count({ where: { createdAt: { gte: inicio, lte: fin } } });
    } else {
      count = await prisma.reserva.count({ where: { createdAt: { gte: inicio, lte: fin } } });
    }

    const label = fecha.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" });
    dias.push({ dia: label, cantidad: count });
  }

  return dias;
}

async function getMaterialesMasPrestados() {
  const resultado = await prisma.prestamodetalle.groupBy({
    by: ["materialId"],
    _sum: { cantidad_entregada: true },
    orderBy: { _sum: { cantidad_entregada: "desc" } },
    take: 6,
  });

  const materiales = await prisma.material.findMany({
    where: { id: { in: resultado.map((r) => r.materialId) } },
    select: { id: true, nombre: true },
  });

  const materialMap = new Map(materiales.map((m) => [m.id, m.nombre]));

  return resultado
    .filter((r) => materialMap.has(r.materialId))
    .map((r) => ({
      nombre: materialMap.get(r.materialId)!,
      cantidad: r._sum.cantidad_entregada || 0,
    }));
}

async function getReservasPorEscenario() {
  const now = new Date();
  const inicioSemana = new Date(now);
  inicioSemana.setDate(inicioSemana.getDate() - 7);
  inicioSemana.setHours(0, 0, 0, 0);

  const resultado = await prisma.reserva.groupBy({
    by: ["escenarioId"],
    _count: { id: true },
    where: { createdAt: { gte: inicioSemana } },
    orderBy: { _count: { id: "desc" } },
  });

  const escenarios = await prisma.escenario.findMany({
    where: { id: { in: resultado.map((r) => r.escenarioId) } },
    select: { id: true, nombre: true },
  });

  const escenarioMap = new Map(escenarios.map((e) => [e.id, e.nombre]));

  return resultado
    .filter((r) => escenarioMap.has(r.escenarioId))
    .map((r) => ({
      nombre: escenarioMap.get(r.escenarioId)!,
      cantidad: r._count.id,
    }));
}

async function getActividadPorDiaInstructor(tipo: "prestamo" | "reserva", usuarioId: number) {
  const dias: { dia: string; cantidad: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(now);
    fecha.setDate(fecha.getDate() - i);
    const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0);
    const fin = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 23, 59, 59);

    let count: number;
    if (tipo === "prestamo") {
      count = await prisma.prestamo.count({ where: { usuarioId, createdAt: { gte: inicio, lte: fin } } });
    } else {
      count = await prisma.reserva.count({ where: { usuarioId, createdAt: { gte: inicio, lte: fin } } });
    }

    const label = fecha.toLocaleDateString("es-CO", { weekday: "short", day: "numeric" });
    dias.push({ dia: label, cantidad: count });
  }

  return dias;
}
