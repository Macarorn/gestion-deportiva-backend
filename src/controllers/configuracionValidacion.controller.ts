import { Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import {
  updateConfiguracionValidacionSchema,
} from "../schemas/configuracionValidacion.schema";

const formatZodError = (err: ZodError) =>
  err.issues.map((e: any) => e.message).join(", ");

export const getConfiguracionValidacion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    let config = await prisma.configuracion_validacion.findFirst();
    if (!config) {
      config = await prisma.configuracion_validacion.create({ data: {} });
    }
    res.json({ success: true, data: config });
  } catch (err: any) {
    console.error("Error al obtener configuracion de validacion:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

export const updateConfiguracionValidacion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = updateConfiguracionValidacionSchema.parse(req.body);

    let config = await prisma.configuracion_validacion.findFirst();
    if (!config) {
      config = await prisma.configuracion_validacion.create({ data: {} });
    }

    const updated = await prisma.configuracion_validacion.update({
      where: { id: config.id },
      data: {
        ...(data.plantilla_pdf !== undefined && { plantilla_pdf: data.plantilla_pdf }),
        ...(data.contacto_nombre !== undefined && { contacto_nombre: data.contacto_nombre }),
        ...(data.contacto_telefono !== undefined && { contacto_telefono: data.contacto_telefono }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ success: false, error: formatZodError(err) });
      return;
    }
    console.error("Error al actualizar configuracion de validacion:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};
