import { Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import {
  createSubCategoriaSchema,
  getSubCategoriaSchema,
  updateSubCategoriaSchema,
} from "../schemas/subCategoria.schema";

/**
 * GET /api/subcategorias
 * Obtener todas las subcategorías con sus materiales
 */
export const getAllSubCategorias = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const subcategorias = await prisma.subcategoria.findMany({
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
        material: {
          select: {
            id: true,
            nombre: true,
            cantidad_total: true,
            cantidad_disponible: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    res.status(200).json({
      success: true,
      data: subcategorias,
      total: subcategorias.length,
    });
  } catch (error) {
    console.error("Error en getAllSubCategorias:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener subcategorías",
    });
  }
};

/**
 * GET /api/subcategorias/:id
 * Obtener una subcategoría específica con sus materiales
 */
export const getSubCategoriaById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getSubCategoriaSchema.parse(req.params);

    const subcategoria = await prisma.subcategoria.findUnique({
      where: { id },
      include: {
        categoria: {
          select: {
            id: true,
            nombre: true,
          },
        },
        material: {
          include: {
            elemento: {
              select: {
                id: true,
                nombre_serial: true,
                estado: true,
              },
            },
          },
        },
      },
    });

    if (!subcategoria) {
      res.status(404).json({
        success: false,
        error: "Subcategoría no encontrada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: subcategoria,
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
    console.error("Error en getSubCategoriaById:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener subcategoría",
    });
  }
};

/**
 * GET /api/categorias/:categoriaId/subcategorias
 * Obtener subcategorías de una categoría específica
 */
export const getSubCategoriasByCategoria = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categoriaId = req.params.categoriaId as string;
    const id = parseInt(categoriaId);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: "categoriaId debe ser un número válido",
      });
      return;
    }

    // Verificar que existe la categoría
    const categoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!categoria) {
      res.status(404).json({
        success: false,
        error: "Categoría no encontrada",
      });
      return;
    }

    const subcategorias = await prisma.subcategoria.findMany({
      where: { categoriaId: id },
      include: {
        material: {
          select: {
            id: true,
            nombre: true,
            cantidad_total: true,
            cantidad_disponible: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    res.status(200).json({
      success: true,
      data: subcategorias,
      total: subcategorias.length,
    });
  } catch (error) {
    console.error("Error en getSubCategoriasByCategoria:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener subcategorías",
    });
  }
};

/**
 * POST /api/subcategorias
 * Crear una nueva subcategoría
 */
export const createSubCategoria = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = createSubCategoriaSchema.parse(req.body);

    // Verificar que existe la categoría
    const categoria = await prisma.categoria.findUnique({
      where: { id: data.categoriaId },
    });

    if (!categoria) {
      res.status(404).json({
        success: false,
        error: "Categoría no encontrada",
      });
      return;
    }

    const subcategoria = await prisma.subcategoria.create({
      data,
      include: {
        categoria: true,
      },
    });

    res.status(201).json({
      success: true,
      data: subcategoria,
      message: "Subcategoría creada exitosamente",
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

    // Manejo de subcategoría duplicada en la categoría
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({
        success: false,
        error: "Ya existe una subcategoría con este nombre en esta categoría",
      });
      return;
    }

    console.error("Error en createSubCategoria:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear subcategoría",
    });
  }
};

/**
 * PUT /api/subcategorias/:id
 * Actualizar una subcategoría
 */
export const updateSubCategoria = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getSubCategoriaSchema.parse(req.params);
    const data = updateSubCategoriaSchema.parse(req.body);

    // Verificar que existe
    const existingSubCategoria = await prisma.subcategoria.findUnique({
      where: { id },
    });

    if (!existingSubCategoria) {
      res.status(404).json({
        success: false,
        error: "Subcategoría no encontrada",
      });
      return;
    }

    // Si se cambia categoriaId, verificar que existe
    if (
      data.categoriaId &&
      data.categoriaId !== existingSubCategoria.categoriaId
    ) {
      const newCategoria = await prisma.categoria.findUnique({
        where: { id: data.categoriaId },
      });
      if (!newCategoria) {
        res.status(404).json({
          success: false,
          error: "Nueva categoría no encontrada",
        });
        return;
      }
    }

    const subcategoria = await prisma.subcategoria.update({
      where: { id },
      data,
      include: {
        categoria: true,
        material: true,
      },
    });

    res.status(200).json({
      success: true,
      data: subcategoria,
      message: "Subcategoría actualizada exitosamente",
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

    // Manejo de nombre duplicado en la categoría
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({
        success: false,
        error: "Ya existe una subcategoría con este nombre en esta categoría",
      });
      return;
    }

    console.error("Error en updateSubCategoria:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar subcategoría",
    });
  }
};

/**
 * DELETE /api/subcategorias/:id
 * Eliminar una subcategoría (soft delete con estado=false)
 */
export const deleteSubCategoria = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getSubCategoriaSchema.parse(req.params);

    // Verificar que existe
    const existingSubCategoria = await prisma.subcategoria.findUnique({
      where: { id },
    });

    if (!existingSubCategoria) {
      res.status(404).json({
        success: false,
        error: "Subcategoría no encontrada",
      });
      return;
    }

    // Verificar si tiene materiales
    const materialesCount = await prisma.material.count({
      where: { subCategoriaId: id },
    });

    if (materialesCount > 0) {
      res.status(400).json({
        success: false,
        error: "No se puede eliminar subcategoría con materiales asociados",
      });
      return;
    }

    // Soft delete: cambiar estado a false
    const subcategoria = await prisma.subcategoria.update({
      where: { id },
      data: { estado: false },
    });

    res.status(200).json({
      success: true,
      data: subcategoria,
      message: "Subcategoría eliminada exitosamente",
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

    console.error("Error en deleteSubCategoria:", error);
    res.status(500).json({
      success: false,
      error: "Error al eliminar subcategoría",
    });
  }
};
