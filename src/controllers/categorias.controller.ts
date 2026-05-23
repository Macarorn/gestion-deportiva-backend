import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createCategoriaSchema, updateCategoriaSchema, getCategoriaSchema } from "../schemas/categoria.schema";
import { ZodError } from "zod";

/**
 * GET /api/categorias
 * Obtener todas las categorías con sus subcategorías
 */
export const getAllCategorias = async (req: Request, res: Response): Promise<void> => {
  try {
    const categorias = await prisma.categoria.findMany({
      include: {
        subCategorias: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            estado: true,
            _count: {
              select: { materiales: true },
            },
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    res.status(200).json({
      success: true,
      data: categorias,
      total: categorias.length,
    });
  } catch (error) {
    console.error("Error en getAllCategorias:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener categorías",
    });
  }
};

/**
 * GET /api/categorias/:id
 * Obtener una categoría específica con sus subcategorías
 */
export const getCategoriaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = getCategoriaSchema.parse(req.params);

    const categoria = await prisma.categoria.findUnique({
      where: { id },
      include: {
        subCategorias: {
          include: {
            materiales: {
              select: {
                id: true,
                nombre: true,
                cantidad_total: true,
                cantidad_disponible: true,
                cantidad_prestada: true,
                estado: true,
              },
            },
          },
        },
      },
    });

    if (!categoria) {
      res.status(404).json({
        success: false,
        error: "Categoría no encontrada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: categoria,
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
    console.error("Error en getCategoriaById:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener categoría",
    });
  }
};

/**
 * POST /api/categorias
 * Crear una nueva categoría
 */
export const createCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createCategoriaSchema.parse(req.body);

    const categoria = await prisma.categoria.create({
      data,
      include: {
        subCategorias: true,
      },
    });

    res.status(201).json({
      success: true,
      data: categoria,
      message: "Categoría creada exitosamente",
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

    // Manejo de categoría duplicada
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({
        success: false,
        error: "Ya existe una categoría con este nombre",
      });
      return;
    }

    console.error("Error en createCategoria:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear categoría",
    });
  }
};

/**
 * PUT /api/categorias/:id
 * Actualizar una categoría
 */
export const updateCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = getCategoriaSchema.parse(req.params);
    const data = updateCategoriaSchema.parse(req.body);

    // Verificar que existe
    const existingCategoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!existingCategoria) {
      res.status(404).json({
        success: false,
        error: "Categoría no encontrada",
      });
      return;
    }

    const categoria = await prisma.categoria.update({
      where: { id },
      data,
      include: {
        subCategorias: true,
      },
    });

    res.status(200).json({
      success: true,
      data: categoria,
      message: "Categoría actualizada exitosamente",
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

    // Manejo de nombre duplicado
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      res.status(409).json({
        success: false,
        error: "Ya existe una categoría con este nombre",
      });
      return;
    }

    console.error("Error en updateCategoria:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar categoría",
    });
  }
};

/**
 * DELETE /api/categorias/:id
 * Eliminar una categoría (soft delete con estado=false)
 */
export const deleteCategoria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = getCategoriaSchema.parse(req.params);

    // Verificar que existe
    const existingCategoria = await prisma.categoria.findUnique({
      where: { id },
    });

    if (!existingCategoria) {
      res.status(404).json({
        success: false,
        error: "Categoría no encontrada",
      });
      return;
    }

    // Verificar si tiene subcategorías con materiales
    const subcategoriasWithMaterials = await prisma.subCategoria.findMany({
      where: { categoriaId: id },
      include: { materiales: { select: { id: true } } },
    });

    const hasAnyMaterials = subcategoriasWithMaterials.some((sub) => sub.materiales.length > 0);

    if (hasAnyMaterials) {
      res.status(400).json({
        success: false,
        error: "No se puede eliminar categoría con materiales asociados",
      });
      return;
    }

    // Soft delete: cambiar estado a false
    const categoria = await prisma.categoria.update({
      where: { id },
      data: { estado: false },
    });

    res.status(200).json({
      success: true,
      data: categoria,
      message: "Categoría eliminada exitosamente",
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

    console.error("Error en deleteCategoria:", error);
    res.status(500).json({
      success: false,
      error: "Error al eliminar categoría",
    });
  }
};
