import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createEscenarioSchema, updateEscenarioSchema, getEscenarioSchema } from "../schemas/escenario.schema";
import { ZodError } from "zod";

/**
 * GET /api/escenarios
 * Obtener todos los escenarios con filtros y paginación
 */
export const getAllEscenarios = async (req: Request, res: Response): Promise<void> => {
  try {
    const { busqueda, estado, ubicacion, pagina = "1", limit = "10" } = req.query;

    const page = parseInt(pagina as string) || 1;
    const itemsPerPage = parseInt(limit as string) || 10;
    const skip = (page - 1) * itemsPerPage;

    // Construir filtros
    const where: any = {};

    if (busqueda) {
      where.nombre = {
        contains: busqueda as string,
      };
    }

    if (estado !== undefined) {
      where.estado = estado === "true";
    }

    if (ubicacion) {
      where.ubicacion = {
        contains: ubicacion as string,
      };
    }

    // Obtener escenarios con paginación
    const [escenarios, total] = await Promise.all([
      prisma.escenario.findMany({
        where,
        skip,
        take: itemsPerPage,
        orderBy: { nombre: "asc" },
      }),
      prisma.escenario.count({ where }),
    ]);

    const totalPages = Math.ceil(total / itemsPerPage);

    res.status(200).json({
      success: true,
      data: escenarios,
      total,
      paginacion: {
        pagina: page,
        totalPaginas: totalPages,
        total: total,
      },
    });
  } catch (error) {
    console.error("Error en getAllEscenarios:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener escenarios",
    });
  }
};

/**
 * GET /api/escenarios/:id
 * Obtener un escenario específico
 */
export const getEscenarioById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = getEscenarioSchema.parse(req.params);

    const escenario = await prisma.escenario.findUnique({
      where: { id },
    });

    if (!escenario) {
      res.status(404).json({
        success: false,
        error: "Escenario no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: escenario,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }
    console.error("Error en getEscenarioById:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener escenario",
    });
  }
};

/**
 * POST /api/escenarios
 * Crear un nuevo escenario
 */
export const createEscenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createEscenarioSchema.parse(req.body);

    const escenario = await prisma.escenario.create({
      data,
    });

    res.status(201).json({
      success: true,
      data: escenario,
      message: "Escenario creado exitosamente",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }

    console.error("Error en createEscenario:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear escenario",
    });
  }
};

/**
 * PUT /api/escenarios/:id
 * Actualizar un escenario
 */
export const updateEscenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = getEscenarioSchema.parse(req.params);
    const data = updateEscenarioSchema.parse(req.body);

    // Verificar que existe
    const existingEscenario = await prisma.escenario.findUnique({
      where: { id },
    });

    if (!existingEscenario) {
      res.status(404).json({
        success: false,
        error: "Escenario no encontrado",
      });
      return;
    }

    const escenario = await prisma.escenario.update({
      where: { id },
      data,
    });

    res.status(200).json({
      success: true,
      data: escenario,
      message: "Escenario actualizado exitosamente",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }

    console.error("Error en updateEscenario:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar escenario",
    });
  }
};

/**
 * PATCH /api/escenarios/:id/inactivar
 * Inactivar un escenario (soft delete)
 */
export const inactivarEscenario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = getEscenarioSchema.parse(req.params);

    // Verificar que existe
    const existingEscenario = await prisma.escenario.findUnique({
      where: { id },
    });

    if (!existingEscenario) {
      res.status(404).json({
        success: false,
        error: "Escenario no encontrado",
      });
      return;
    }

    if (!existingEscenario.estado) {
      res.status(400).json({
        success: false,
        error: "El escenario ya está inactivo",
      });
      return;
    }

    const escenario = await prisma.escenario.update({
      where: { id },
      data: { estado: false },
    });

    res.status(200).json({
      success: true,
      data: escenario,
      message: "Escenario inactivado exitosamente",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }

    console.error("Error en inactivarEscenario:", error);
    res.status(500).json({
      success: false,
      error: "Error al inactivar escenario",
    });
  }
};
