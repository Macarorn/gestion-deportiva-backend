import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { ZodError } from "zod";
import {
  createReservaSchema,
  editReservaSchema,
  paramsReservaSchema,
  queryReservaSchema,
  activateReservaSchema,
  finalizeReservaSchema,
  cancelReservaSchema,
} from "../schemas/reserva.schema";

const prisma = new PrismaClient();

async function generateNumeroReserva(): Promise<string> {
  const count = await prisma.reserva.count();
  const num = (count + 1).toString().padStart(4, "0");
  return `RES-${num}`;
}

function formatZodError(err: ZodError): string[] {
  return err.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });
}

function normalizeTime(v: any): string {
  if (typeof v !== "string") return v;
  const parts = v.split(":");
  if (parts.length !== 2) return v;
  return parts[0].padStart(2, "0") + ":" + parts[1].padStart(2, "0");
}

function sanitizeHoras(body: any) {
  if (body.hora_inicio) body.hora_inicio = normalizeTime(body.hora_inicio);
  if (body.hora_fin) body.hora_fin = normalizeTime(body.hora_fin);
}

/** Calcula el día de la semana desde un string YYYY-MM-DD sin timezone issues */
function getDayOfWeek(fechaStr: string): string {
  const [y, m, d] = fechaStr.split("-").map(Number);
  const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const fecha = new Date(y, m - 1, d);
  return dias[fecha.getDay()];
}

/** Convierte "HH:mm" a minutos desde medianoche */
function toMinutes(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function formatHora(hora: string): string {
  const [h, m] = hora.split(":");
  const hour = parseInt(h);
  const suffix = hour >= 12 ? "p.m." : "a.m.";
  const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${hour12}:${m} ${suffix}`;
}

/** Verifica si la reserva está dentro del horario de disponibilidad del escenario */
function isWithinHorario(
  horario: any,
  fechaStr: string,
  horaInicio: string,
  horaFin: string
): { ok: boolean; error?: string } {
  if (!horario) return { ok: true };
  if (typeof horario === "string") { try { horario = JSON.parse(horario); } catch { return { ok: true }; } }
  if (typeof horario !== "object") return { ok: true };

  const diaSemana = getDayOfWeek(fechaStr);

  const slotsDelDia = horario[diaSemana];
  if (!slotsDelDia || !Array.isArray(slotsDelDia) || slotsDelDia.length === 0) {
    return {
      ok: false,
      error: `El escenario no está disponible los ${diaSemana}`,
    };
  }

  const inicioMin = toMinutes(horaInicio);
  const finMin = toMinutes(horaFin);

  for (const slot of slotsDelDia) {
    const slotInicio = toMinutes(slot.inicio);
    const slotFin = toMinutes(slot.fin);

    if (inicioMin >= slotInicio && finMin <= slotFin) {
      return { ok: true };
    }
  }

  const slotsStr = slotsDelDia
    .map((s: any) => `${formatHora(s.inicio)} - ${formatHora(s.fin)}`)
    .join(", ");
  return {
    ok: false,
    error: `Horario no disponible el ${diaSemana}. Franjas: ${slotsStr}`,
  };
}

/** Verifica si hay solapamiento con otra reserva en el mismo escenario */
async function hasOverlap(
  escenarioId: number,
  fechaStr: string,
  horaInicio: string,
  horaFin: string,
  excludeId?: number
): Promise<{ ok: boolean; error?: string }> {
  const inicioMin = toMinutes(horaInicio);
  const finMin = toMinutes(horaFin);

  const existing = await prisma.$queryRaw<any[]>`
    SELECT id, numero_reserva, hora_inicio, hora_fin
    FROM reserva
    WHERE escenarioId = ${escenarioId}
      AND DATE(fecha) = ${fechaStr}
      AND estado NOT IN ('cancelada')
      ${excludeId ? Prisma.sql`AND id != ${excludeId}` : Prisma.sql``}
  `;

  for (const conflicting of existing) {
    const cInicio = toMinutes(conflicting.hora_inicio);
    const cFin = toMinutes(conflicting.hora_fin);

    if (inicioMin < cFin && finMin > cInicio) {
      return {
        ok: false,
        error: `Conflicto con reserva ${conflicting.numero_reserva} (${formatHora(conflicting.hora_inicio)} - ${formatHora(conflicting.hora_fin)})`,
      };
    }
  }

  return { ok: true };
}

/** GET /reservas */
export const getReservas = async (req: Request, res: Response) => {
  try {
    const query = queryReservaSchema.parse(req.query);
    const { page, limit, escenarioId, usuarioId, estado, fecha_desde, fecha_hasta, busqueda } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (escenarioId) where.escenarioId = escenarioId;
    if (usuarioId) where.usuarioId = usuarioId;
    if (estado) where.estado = estado;
    if (fecha_desde || fecha_hasta) {
      where.fecha = {};
      if (fecha_desde) where.fecha.gte = new Date(fecha_desde);
      if (fecha_hasta) where.fecha.lte = new Date(fecha_hasta);
    }
    if (busqueda) {
      where.OR = [
        { numero_reserva: { contains: busqueda } },
        { escenario: { nombre: { contains: busqueda } } },
        { usuario: { nombre: { contains: busqueda } } },
      ];
    }

    const [reservas, total] = await Promise.all([
      prisma.reserva.findMany({
        where,
        skip,
        take: limit,
        include: {
          escenario: { select: { id: true, nombre: true, ubicacion: true } },
          usuario: { select: { id: true, nombre: true, apellido: true, correo: true } },
        },
        orderBy: [{ fecha: "desc" }, { hora_inicio: "desc" }],
      }),
      prisma.reserva.count({ where }),
    ]);

    res.json({
      success: true,
      data: reservas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: formatZodError(err) });
      return;
    }
    console.error("Error al obtener reservas:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

/** GET /reservas/:id */
export const getReservaById = async (req: Request, res: Response) => {
  try {
    const { id } = paramsReservaSchema.parse(req.params);

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        escenario: { select: { id: true, nombre: true, ubicacion: true, capacidad_maxima: true, horario_disponibilidad: true } },
        usuario: { select: { id: true, nombre: true, apellido: true, correo: true, telefono: true } },
      },
    });

    if (!reserva) {
      res.status(404).json({ success: false, error: "Reserva no encontrada" });
      return;
    }

    res.json({ success: true, data: reserva });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: formatZodError(err) });
      return;
    }
    console.error("Error al obtener reserva:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

/** POST /reservas */
export const createReserva = async (req: Request, res: Response) => {
  try {
    sanitizeHoras(req.body);
    const data = createReservaSchema.parse(req.body);

    const escenario = await prisma.escenario.findUnique({
      where: { id: data.escenarioId },
    });
    if (!escenario) {
      res.status(404).json({ success: false, error: "Escenario no encontrado" });
      return;
    }
    if (!escenario.estado) {
      res.status(400).json({ success: false, error: "El escenario no está activo" });
      return;
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
    });
    if (!usuario) {
      res.status(404).json({ success: false, error: "Usuario no encontrado" });
      return;
    }

    const [year, month, day] = data.fecha.split("-").map(Number);
    const fecha = new Date(year, month - 1, day);

    // Validar que la fecha no sea pasada (comparar strings YYYY-MM-DD)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (data.fecha < todayStr) {
      res.status(400).json({ success: false, error: "No se pueden crear reservas para fechas pasadas" });
      return;
    }

    // Si es hoy, validar que la hora de inicio no haya pasado
    if (data.fecha === todayStr) {
      const inicioMin = toMinutes(data.hora_inicio);
      const actualMin = now.getHours() * 60 + now.getMinutes();

      if (inicioMin <= actualMin) {
        res.status(400).json({
          success: false,
          error: `La hora de inicio ya pasó. Son las ${formatHora(`${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`)}. Elija una hora futura`,
        });
        return;
      }
    }

    const horarioCheck = isWithinHorario(
      escenario.horario_disponibilidad,
      data.fecha,
      data.hora_inicio,
      data.hora_fin
    );
    if (!horarioCheck.ok) {
      res.status(400).json({ success: false, error: horarioCheck.error });
      return;
    }

    const overlapCheck = await hasOverlap(
      data.escenarioId,
      data.fecha,
      data.hora_inicio,
      data.hora_fin
    );
    if (!overlapCheck.ok) {
      res.status(409).json({ success: false, error: overlapCheck.error });
      return;
    }

    const numero_reserva = await generateNumeroReserva();

    const reserva = await prisma.reserva.create({
      data: {
        numero_reserva,
        escenarioId: data.escenarioId,
        usuarioId: data.usuarioId,
        fecha,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        estado: "pendiente",
        observaciones: data.observaciones,
      },
      include: {
        escenario: { select: { id: true, nombre: true, ubicacion: true } },
        usuario: { select: { id: true, nombre: true, apellido: true, correo: true } },
      },
    });

    res.status(201).json({ success: true, data: reserva });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: formatZodError(err) });
      return;
    }
    console.error("Error al crear reserva:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

/** PATCH /reservas/:id/activate */
export const activateReserva = async (req: Request, res: Response) => {
  try {
    const { id } = paramsReservaSchema.parse(req.params);
    const data = activateReservaSchema.parse(req.body);

    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) {
      res.status(404).json({ success: false, error: "Reserva no encontrada" });
      return;
    }
    if (reserva.estado !== "pendiente") {
      res.status(400).json({
        success: false,
        error: `No se puede activar una reserva con estado "${reserva.estado}". Solo se pueden activar reservas pendientes`,
      });
      return;
    }

    const updated = await prisma.reserva.update({
      where: { id },
      data: { estado: "activa", observaciones: data.observaciones || reserva.observaciones },
      include: {
        escenario: { select: { id: true, nombre: true, ubicacion: true } },
        usuario: { select: { id: true, nombre: true, apellido: true, correo: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: formatZodError(err) });
      return;
    }
    console.error("Error al activar reserva:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

/** PATCH /reservas/:id/finalize */
export const finalizeReserva = async (req: Request, res: Response) => {
  try {
    const { id } = paramsReservaSchema.parse(req.params);
    const data = finalizeReservaSchema.parse(req.body);

    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) {
      res.status(404).json({ success: false, error: "Reserva no encontrada" });
      return;
    }
    if (reserva.estado !== "activa") {
      res.status(400).json({
        success: false,
        error: `No se puede finalizar una reserva con estado "${reserva.estado}". Solo se pueden finalizar reservas activas`,
      });
      return;
    }

    const updated = await prisma.reserva.update({
      where: { id },
      data: { estado: "finalizada", observaciones_cierre: data.observaciones_cierre },
      include: {
        escenario: { select: { id: true, nombre: true, ubicacion: true } },
        usuario: { select: { id: true, nombre: true, apellido: true, correo: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: formatZodError(err) });
      return;
    }
    console.error("Error al finalizar reserva:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

/** PATCH /reservas/:id/cancel */
export const cancelReserva = async (req: Request, res: Response) => {
  try {
    const { id } = paramsReservaSchema.parse(req.params);
    const data = cancelReservaSchema.parse(req.body);

    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) {
      res.status(404).json({ success: false, error: "Reserva no encontrada" });
      return;
    }
    if (reserva.estado !== "pendiente") {
      res.status(400).json({
        success: false,
        error: `No se puede cancelar una reserva con estado "${reserva.estado}". Solo se pueden cancelar reservas pendientes`,
      });
      return;
    }

    const updated = await prisma.reserva.update({
      where: { id },
      data: { estado: "cancelada", observaciones_cancelacion: data.observaciones },
      include: {
        escenario: { select: { id: true, nombre: true, ubicacion: true } },
        usuario: { select: { id: true, nombre: true, apellido: true, correo: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: formatZodError(err) });
      return;
    }
    console.error("Error al cancelar reserva:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

/** PUT /reservas/:id/edit */
export const editReserva = async (req: Request, res: Response) => {
  try {
    sanitizeHoras(req.body);
    const { id } = paramsReservaSchema.parse(req.params);
    const data = editReservaSchema.parse(req.body);

    const reserva = await prisma.reserva.findUnique({ where: { id } });
    if (!reserva) {
      res.status(404).json({ success: false, error: "Reserva no encontrada" });
      return;
    }
    if (reserva.estado !== "pendiente") {
      res.status(400).json({
        success: false,
        error: `Solo se pueden editar reservas pendientes. Estado actual: "${reserva.estado}"`,
      });
      return;
    }

    const escenario = await prisma.escenario.findUnique({ where: { id: reserva.escenarioId } });
    if (!escenario) {
      res.status(404).json({ success: false, error: "Escenario no encontrado" });
      return;
    }

    const nuevaFechaStr = data.fecha || (() => {
      const d = new Date(reserva.fecha);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })();
    const nuevaHoraInicio = data.hora_inicio || reserva.hora_inicio;
    const nuevaHoraFin = data.hora_fin || reserva.hora_fin;

    // Validar fecha no pasada (string comparison)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (nuevaFechaStr < todayStr) {
      res.status(400).json({ success: false, error: "No se pueden asignar fechas pasadas" });
      return;
    }

    // Si es hoy, validar hora
    if (nuevaFechaStr === todayStr) {
      const inicioMin = toMinutes(nuevaHoraInicio);
      const actualMin = now.getHours() * 60 + now.getMinutes();
      if (inicioMin <= actualMin) {
        res.status(400).json({ success: false, error: `La hora de inicio ya pasó. Elija una hora futura` });
        return;
      }
    }

    // Validar horario
    const horarioCheck = isWithinHorario(escenario.horario_disponibilidad, nuevaFechaStr, nuevaHoraInicio, nuevaHoraFin);
    if (!horarioCheck.ok) {
      res.status(400).json({ success: false, error: horarioCheck.error });
      return;
    }

    // Validar solapamiento
    const overlapCheck = await hasOverlap(reserva.escenarioId, nuevaFechaStr, nuevaHoraInicio, nuevaHoraFin, id);
    if (!overlapCheck.ok) {
      res.status(409).json({ success: false, error: overlapCheck.error });
      return;
    }

    const [yUpd, mUpd, dUpd] = nuevaFechaStr.split("-").map(Number);
    const fechaUpd = new Date(yUpd, mUpd - 1, dUpd);

    const updated = await prisma.reserva.update({
      where: { id },
      data: {
        ...(data.fecha && { fecha: fechaUpd }),
        ...(data.hora_inicio && { hora_inicio: data.hora_inicio }),
        ...(data.hora_fin && { hora_fin: data.hora_fin }),
        ...(data.observaciones !== undefined && { observaciones: data.observaciones }),
      },
      include: {
        escenario: { select: { id: true, nombre: true, ubicacion: true } },
        usuario: { select: { id: true, nombre: true, apellido: true, correo: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: formatZodError(err) });
      return;
    }
    console.error("Error al editar reserva:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};
