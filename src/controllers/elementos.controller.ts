import { Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import {
  createElementoSchema,
  getElementoSchema,
  updateElementoSchema,
} from "../schemas/elemento.schema";

/**
 * Función auxiliar para recalcular las cantidades de un material basado en sus elementos
 */
async function recalcularCantidadesMaterial(materialId: number) {
  const elementos = await prisma.elemento.findMany({
    where: { materialId },
  });

  console.log(`[recalcularCantidadesMaterial] Material ID: ${materialId}`);
  console.log(`[recalcularCantidadesMaterial] Elementos:`, elementos.map(e => ({ id: e.id, nombre_serial: e.nombre_serial, estado: e.estado })));

  const cantidad_total = elementos.length;
  const cantidad_disponible = elementos.filter(e => e.estado === "disponible").length;
  const cantidad_prestada = elementos.filter(e => e.estado === "prestado").length;
  const cantidad_danada = elementos.filter(e => e.estado === "dañado").length;
  const cantidad_mantenimiento = elementos.filter(e => e.estado === "mantenimiento").length;

  console.log(`[recalcularCantidadesMaterial] Cantidades calculadas:`, {
    cantidad_total,
    cantidad_disponible,
    cantidad_prestada,
    cantidad_danada,
    cantidad_mantenimiento,
  });

  await prisma.material.update({
    where: { id: materialId },
    data: {
      cantidad_total,
      cantidad_disponible,
      cantidad_prestada,
      cantidad_danada,
      cantidad_mantenimiento,
    },
  });

  console.log(`[recalcularCantidadesMaterial] Material actualizado`);
}

/**
 * GET /api/elementos
 * Obtener todos los elementos
 */
export const getAllElementos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const elementos = await prisma.elemento.findMany({
      include: {
        material: {
          select: {
            id: true,
            nombre: true,
            subCategoria: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
      orderBy: { nombre_serial: "asc" },
    });

    res.status(200).json({
      success: true,
      data: elementos,
      total: elementos.length,
    });
  } catch (error) {
    console.error("Error en getAllElementos:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener elementos",
    });
  }
};

/**
 * GET /api/elementos/:id
 * Obtener un elemento específico
 */
export const getElementoById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getElementoSchema.parse({ id: parseInt(String(req.params.id)) });

    const elemento = await prisma.elemento.findUnique({
      where: { id },
      include: {
        material: {
          include: {
            subCategoria: {
              include: {
                categoria: true,
              },
            },
          },
        },
      },
    });

    if (!elemento) {
      res.status(404).json({
        success: false,
        error: "Elemento no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: elemento,
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
    console.error("Error en getElementoById:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener elemento",
    });
  }
};

/**
 * GET /api/materiales/:materialId/elementos
 * Obtener elementos de un material específico
 */
export const getElementosByMaterial = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const materialId = req.params.materialId as string;
    const id = parseInt(materialId);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: "materialId debe ser un número válido",
      });
      return;
    }

    // Verificar que existe el material
    const material = await prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      res.status(404).json({
        success: false,
        error: "Material no encontrado",
      });
      return;
    }

    const elementos = await prisma.elemento.findMany({
      where: { materialId: id },
      orderBy: { nombre_serial: "asc" },
    });

    res.status(200).json({
      success: true,
      data: elementos,
      total: elementos.length,
    });
  } catch (error) {
    console.error("Error en getElementosByMaterial:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener elementos",
    });
  }
};

/**
 * GET /api/elementos/estado/:estado
 * Obtener elementos por estado (disponible, prestado, dañado, perdido)
 */
export const getElementosByEstado = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const estado = req.params.estado as string;
    const validStates = ["disponible", "prestado", "dañado", "perdido"];

    if (!validStates.includes(estado)) {
      res.status(400).json({
        success: false,
        error: `Estado debe ser uno de: ${validStates.join(", ")}`,
      });
      return;
    }

    const elementos = await prisma.elemento.findMany({
      where: { estado },
      include: {
        material: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { nombre_serial: "asc" },
    });

    res.status(200).json({
      success: true,
      data: elementos,
      total: elementos.length,
    });
  } catch (error) {
    console.error("Error en getElementosByEstado:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener elementos",
    });
  }
};

/**
 * POST /api/elementos
 * Crear un nuevo elemento
 */
export const createElemento = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = createElementoSchema.parse(req.body);

    // Verificar que existe el material
    const material = await prisma.material.findUnique({
      where: { id: data.materialId },
    });

    if (!material) {
      res.status(404).json({
        success: false,
        error: "Material no encontrado",
      });
      return;
    }

    const elemento = await prisma.elemento.create({
      data,
      include: {
        material: {
          include: {
            subCategoria: {
              include: {
                categoria: true,
              },
            },
          },
        },
      },
    });

    // Recalcular cantidades del material padre
    await recalcularCantidadesMaterial(data.materialId);

    res.status(201).json({
      success: true,
      data: elemento,
      message: "Elemento creado exitosamente",
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

    // Manejo de elemento duplicado (serial único por material)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({
        success: false,
        error: "Ya existe un elemento con este serial en este material",
      });
      return;
    }

    console.error("Error en createElemento:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear elemento",
    });
  }
};

/**
 * PUT /api/elementos/:id
 * Actualizar un elemento
 */
export const updateElemento = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getElementoSchema.parse({ id: parseInt(String(req.params.id)) });
    const data = updateElementoSchema.parse(req.body);

    // Verificar que existe
    const existingElemento = await prisma.elemento.findUnique({
      where: { id },
    });

    if (!existingElemento) {
      res.status(404).json({
        success: false,
        error: "Elemento no encontrado",
      });
      return;
    }

    // Si se cambia materialId, verificar que existe
    if (data.materialId && data.materialId !== existingElemento.materialId) {
      const newMaterial = await prisma.material.findUnique({
        where: { id: data.materialId },
      });
      if (!newMaterial) {
        res.status(404).json({
          success: false,
          error: "Nuevo material no encontrado",
        });
        return;
      }
    }

    const elemento = await prisma.elemento.update({
      where: { id },
      data,
      include: {
        material: {
          include: {
            subCategoria: {
              include: {
                categoria: true,
              },
            },
          },
        },
      },
    });

    // Recalcular cantidades del material padre
    await recalcularCantidadesMaterial(existingElemento.materialId);

    res.status(200).json({
      success: true,
      data: elemento,
      message: "Elemento actualizado exitosamente",
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

    // Manejo de serial duplicado
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({
        success: false,
        error: "Ya existe un elemento con este serial en el material destino",
      });
      return;
    }

    console.error("Error en updateElemento:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar elemento",
    });
  }
};

/**
 * DELETE /api/elementos/:id
 * Eliminar un elemento (solo si está disponible)
 */
export const deleteElemento = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getElementoSchema.parse({ id: parseInt(String(req.params.id)) });

    // Verificar que existe
    const existingElemento = await prisma.elemento.findUnique({
      where: { id },
    });

    if (!existingElemento) {
      res.status(404).json({
        success: false,
        error: "Elemento no encontrado",
      });
      return;
    }

    // No permitir eliminar si está prestado
    if (existingElemento.estado === "prestado") {
      res.status(400).json({
        success: false,
        error: "No se puede eliminar un elemento prestado",
      });
      return;
    }

    // Eliminar elemento
    await prisma.elemento.delete({
      where: { id },
    });

    // Recalcular cantidades del material padre
    await recalcularCantidadesMaterial(existingElemento.materialId);

    res.status(200).json({
      success: true,
      message: "Elemento eliminado exitosamente",
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

    console.error("Error en deleteElemento:", error);
    res.status(500).json({
      success: false,
      error: "Error al eliminar elemento",
    });
  }
};
