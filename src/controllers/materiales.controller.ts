import { Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import {
  createMaterialSchema,
  getMaterialSchema,
  updateMaterialSchema,
} from "../schemas/material.schema";

/**
 * GET /api/materiales
 * Obtener todos los materiales con sus elementos
 */
export const getAllMateriales = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { busqueda, subCategoriaId, categoriaId, estado, requiere_serial, page = 1, limit = 10 } = req.query;

    // Construir el filtro where
    const where: any = {};

    // Filtro por búsqueda (nombre)
    if (busqueda && typeof busqueda === "string") {
      where.nombre = {
        contains: busqueda,
      };
    }

    // Filtro por subcategoría
    if (subCategoriaId && !isNaN(Number(subCategoriaId))) {
      where.subCategoriaId = Number(subCategoriaId);
    }

    // Filtro por categoría (a través de subcategoría)
    if (categoriaId && !isNaN(Number(categoriaId))) {
      where.subcategoria = {
        categoriaId: Number(categoriaId),
      };
    }

    // Filtro por estado
    if (estado && typeof estado === "string") {
      where.estado = estado;
    }

    // Filtro por requiere_serial
    if (requiere_serial !== undefined) {
      where.requiere_serial = requiere_serial === "true";
    }

    // Calcular paginación
    const skip = (Number(page) - 1) * Number(limit);

    // Obtener materiales con filtros y paginación
    const [materiales, total] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          subcategoria: {
            select: {
              id: true,
              nombre: true,
              categoria: {
                select: {
                  id: true,
                  nombre: true,
                },
              },
            },
          },
          elemento: {
            select: {
              id: true,
              nombre_serial: true,
              estado: true,
            },
          },
        },
        orderBy: { nombre: "asc" },
        skip,
        take: Number(limit),
      }),
      prisma.material.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: materiales,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("Error en getAllMateriales:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener materiales",
    });
  }
};

/**
 * GET /api/materiales/:id
 * Obtener un material específico con todos sus elementos
 */
export const getMaterialById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getMaterialSchema.parse({ id: parseInt(String(req.params.id)) });

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        subcategoria: {
          include: {
            categoria: true,
          },
        },
        elemento: {
          orderBy: { nombre_serial: "asc" },
        },
      },
    });

    if (!material) {
      res.status(404).json({
        success: false,
        error: "Material no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: material,
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
    console.error("Error en getMaterialById:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener material",
    });
  }
};

/**
 * GET /api/subcategorias/:subCategoriaId/materiales
 * Obtener materiales de una subcategoría específica
 */
export const getMaterialesBySubCategoria = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const subCategoriaId = req.params.subCategoriaId as string;
    const id = parseInt(subCategoriaId);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: "subCategoriaId debe ser un número válido",
      });
      return;
    }

    // Verificar que existe la subcategoría
    const subcategoria_exists = await prisma.subcategoria.findUnique({
      where: { id },
    });

    if (!subcategoria_exists) {
      res.status(404).json({
        success: false,
        error: "Subcategoría no encontrada",
      });
      return;
    }

    const materiales = await prisma.material.findMany({
      where: { subCategoriaId: id },
      include: {
        elemento: {
          select: {
            id: true,
            nombre_serial: true,
            estado: true,
          },
        },
      },
      orderBy: { nombre: "asc" },
    });

    res.status(200).json({
      success: true,
      data: materiales,
      total: materiales.length,
    });
  } catch (error) {
    console.error("Error en getMaterialesBySubCategoria:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener materiales",
    });
  }
};

/**
 * POST /api/materiales
 * Crear un nuevo material
 */
export const createMaterial = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = createMaterialSchema.parse(req.body);

    // Verificar que existe la subcategoría
    const subcategoria = await prisma.subcategoria.findUnique({
      where: { id: data.subCategoriaId },
    });

    if (!subcategoria) {
      res.status(404).json({
        success: false,
        error: "Subcategoría no encontrada",
      });
      return;
    }

    // Validar que cantidades sean consistentes
    if (
      data.cantidad_disponible &&
      data.cantidad_prestada &&
      data.cantidad_total &&
      data.cantidad_disponible + data.cantidad_prestada !== data.cantidad_total
    ) {
      res.status(400).json({
        success: false,
        error:
          "cantidad_disponible + cantidad_prestada debe ser igual a cantidad_total",
      });
      return;
    }

    // Extraer elementos si se proporcionan
    const { elementos, ...materialData } = data;

    // Crear el material con elementos si se proporcionan
    const material = await prisma.material.create({
      data: {
        ...materialData,
        ...(elementos && elementos.length > 0 && {
          elemento: {
            create: elementos.map((el) => ({
              nombre_serial: el.nombre_serial,
              estado: el.estado || "disponible",
            })),
          },
        }),
      },
      include: {
        subcategoria: {
          include: {
            categoria: true,
          },
        },
        elemento: true,
      },
    });

    res.status(201).json({
      success: true,
      data: material,
      message: "Material creado exitosamente",
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

    console.error("Error en createMaterial:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear material",
    });
  }
};

/**
 * PUT /api/materiales/:id
 * Actualizar un material
 */
export const updateMaterial = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getMaterialSchema.parse({ id: parseInt(String(req.params.id)) });
    const data = updateMaterialSchema.parse(req.body);

    // Verificar que existe
    const existingMaterial = await prisma.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      res.status(404).json({
        success: false,
        error: "Material no encontrado",
      });
      return;
    }

    // Si se cambia subCategoriaId, verificar que existe
    if (
      data.subCategoriaId &&
      data.subCategoriaId !== existingMaterial.subCategoriaId
    ) {
      const newSubCategoria = await prisma.subcategoria.findUnique({
        where: { id: data.subCategoriaId },
      });
      if (!newSubCategoria) {
        res.status(404).json({
          success: false,
          error: "Nueva subcategoría no encontrada",
        });
        return;
      }
    }

    // Validar y recalcular cantidades
    const cantidadTotal =
      data.cantidad_total ?? existingMaterial.cantidad_total;
    const cantidadPrestada =
      data.cantidad_prestada ?? existingMaterial.cantidad_prestada;
    const cantidadDanada =
      data.cantidad_danada ?? (existingMaterial as any).cantidad_danada ?? 0;
    const cantidadMantenimiento =
      data.cantidad_mantenimiento ?? (existingMaterial as any).cantidad_mantenimiento ?? 0;

    // Validar que la suma de novedades no supere el stock libre
    const stockLibre = cantidadTotal - cantidadPrestada;
    if (cantidadDanada + cantidadMantenimiento > stockLibre) {
      res.status(400).json({
        success: false,
        error:
          "La suma de unidades dañadas y en mantenimiento no puede superar el stock libre (total - prestados)",
      });
      return;
    }

    // Recalcular cantidad_disponible automáticamente
    const cantidadDisponible = cantidadTotal - cantidadPrestada - cantidadDanada - cantidadMantenimiento;
    data.cantidad_disponible = cantidadDisponible;

    // Manejar actualización de elementos si se proporcionan
    const elementosData = data.elementos;
    const { elementos: _, ...materialData } = data as any;

    const material = await prisma.material.update({
      where: { id },
      data: materialData,
      include: {
        subcategoria: {
          include: {
            categoria: true,
          },
        },
        elemento: true,
      },
    });

    // Actualizar elementos si se proporcionaron
    if (elementosData && elementosData.length > 0) {
      // Obtener IDs de elementos existentes
      const existingElementos = await prisma.elemento.findMany({
        where: { materialId: id },
      });
      const existingIds = new Set(existingElementos.map((e: any) => e.id));

      // Procesar cada elemento
      for (const elemento of elementosData) {
        if (elemento.id) {
          // Actualizar elemento existente
          if (existingIds.has(elemento.id)) {
            await prisma.elemento.update({
              where: { id: elemento.id },
              data: {
                nombre_serial: elemento.nombre_serial,
                estado: elemento.estado,
              },
            });
          }
        } else {
          // Crear nuevo elemento
          await prisma.elemento.create({
            data: {
              materialId: id,
              nombre_serial: elemento.nombre_serial,
              estado: elemento.estado,
            },
          });
        }
      }

      // Eliminar elementos que no están en la nueva lista
      const nuevosIds = new Set(elementosData.filter((e: any) => e.id).map((e: any) => e.id));
      const idsAEliminar = Array.from(existingIds).filter((id: number) => !nuevosIds.has(id));
      
      if (idsAEliminar.length > 0) {
        await prisma.elemento.deleteMany({
          where: {
            id: { in: idsAEliminar },
          },
        });
      }

      // Recargar material con elementos actualizados
      const materialActualizado = await prisma.material.findUnique({
        where: { id },
        include: {
          subcategoria: {
            include: {
              categoria: true,
            },
          },
          elemento: true,
        },
      });

      res.status(200).json({
        success: true,
        data: materialActualizado,
        message: "Material actualizado exitosamente",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: material,
      message: "Material actualizado exitosamente",
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

    console.error("Error en updateMaterial:", error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar material",
    });
  }
};

/**
 * DELETE /api/materiales/:id
 * Eliminar un material (soft delete con estado=inactivo)
 */
export const deleteMaterial = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getMaterialSchema.parse({ id: parseInt(String(req.params.id)) });

    // Verificar que existe
    const existingMaterial = await prisma.material.findUnique({
      where: { id },
    });

    if (!existingMaterial) {
      res.status(404).json({
        success: false,
        error: "Material no encontrado",
      });
      return;
    }

    // No permitir eliminar si hay materiales prestados
    if (existingMaterial.cantidad_prestada > 0) {
      res.status(400).json({
        success: false,
        error: "No se puede eliminar material con items prestados",
      });
      return;
    }

    // Soft delete: cambiar estado a inactivo
    const material = await prisma.material.update({
      where: { id },
      data: { estado: "inactivo" },
    });

    res.status(200).json({
      success: true,
      data: material,
      message: "Material eliminado exitosamente",
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

    console.error("Error en deleteMaterial:", error);
    res.status(500).json({
      success: false,
      error: "Error al eliminar material",
    });
  }
};
