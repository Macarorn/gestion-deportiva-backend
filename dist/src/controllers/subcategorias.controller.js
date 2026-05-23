"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategoria = exports.updateSubCategoria = exports.createSubCategoria = exports.getSubCategoriasByCategoria = exports.getSubCategoriaById = exports.getAllSubCategorias = void 0;
const prisma_1 = require("../lib/prisma");
const subCategoria_schema_1 = require("../schemas/subCategoria.schema");
const zod_1 = require("zod");
/**
 * GET /api/subcategorias
 * Obtener todas las subcategorías con sus materiales
 */
const getAllSubCategorias = async (req, res) => {
    try {
        const subcategorias = await prisma_1.prisma.subCategoria.findMany({
            include: {
                categoria: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
                materiales: {
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
    }
    catch (error) {
        console.error("Error en getAllSubCategorias:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener subcategorías",
        });
    }
};
exports.getAllSubCategorias = getAllSubCategorias;
/**
 * GET /api/subcategorias/:id
 * Obtener una subcategoría específica con sus materiales
 */
const getSubCategoriaById = async (req, res) => {
    try {
        const { id } = subCategoria_schema_1.getSubCategoriaSchema.parse(req.params);
        const subcategoria = await prisma_1.prisma.subCategoria.findUnique({
            where: { id },
            include: {
                categoria: {
                    select: {
                        id: true,
                        nombre: true,
                    },
                },
                materiales: {
                    include: {
                        elementos: {
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
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
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
exports.getSubCategoriaById = getSubCategoriaById;
/**
 * GET /api/categorias/:categoriaId/subcategorias
 * Obtener subcategorías de una categoría específica
 */
const getSubCategoriasByCategoria = async (req, res) => {
    try {
        const categoriaId = req.params.categoriaId;
        const id = parseInt(categoriaId);
        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                error: "categoriaId debe ser un número válido",
            });
            return;
        }
        // Verificar que existe la categoría
        const categoria = await prisma_1.prisma.categoria.findUnique({
            where: { id },
        });
        if (!categoria) {
            res.status(404).json({
                success: false,
                error: "Categoría no encontrada",
            });
            return;
        }
        const subcategorias = await prisma_1.prisma.subCategoria.findMany({
            where: { categoriaId: id },
            include: {
                materiales: {
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
    }
    catch (error) {
        console.error("Error en getSubCategoriasByCategoria:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener subcategorías",
        });
    }
};
exports.getSubCategoriasByCategoria = getSubCategoriasByCategoria;
/**
 * POST /api/subcategorias
 * Crear una nueva subcategoría
 */
const createSubCategoria = async (req, res) => {
    try {
        const data = subCategoria_schema_1.createSubCategoriaSchema.parse(req.body);
        // Verificar que existe la categoría
        const categoria = await prisma_1.prisma.categoria.findUnique({
            where: { id: data.categoriaId },
        });
        if (!categoria) {
            res.status(404).json({
                success: false,
                error: "Categoría no encontrada",
            });
            return;
        }
        const subcategoria = await prisma_1.prisma.subCategoria.create({
            data,
            include: {
                categoria: true,
                materiales: true,
            },
        });
        res.status(201).json({
            success: true,
            data: subcategoria,
            message: "Subcategoría creada exitosamente",
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
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
exports.createSubCategoria = createSubCategoria;
/**
 * PUT /api/subcategorias/:id
 * Actualizar una subcategoría
 */
const updateSubCategoria = async (req, res) => {
    try {
        const { id } = subCategoria_schema_1.getSubCategoriaSchema.parse(req.params);
        const data = subCategoria_schema_1.updateSubCategoriaSchema.parse(req.body);
        // Verificar que existe
        const existingSubCategoria = await prisma_1.prisma.subCategoria.findUnique({
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
        if (data.categoriaId && data.categoriaId !== existingSubCategoria.categoriaId) {
            const newCategoria = await prisma_1.prisma.categoria.findUnique({
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
        const subcategoria = await prisma_1.prisma.subCategoria.update({
            where: { id },
            data,
            include: {
                categoria: true,
                materiales: true,
            },
        });
        res.status(200).json({
            success: true,
            data: subcategoria,
            message: "Subcategoría actualizada exitosamente",
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
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
exports.updateSubCategoria = updateSubCategoria;
/**
 * DELETE /api/subcategorias/:id
 * Eliminar una subcategoría (soft delete con estado=false)
 */
const deleteSubCategoria = async (req, res) => {
    try {
        const { id } = subCategoria_schema_1.getSubCategoriaSchema.parse(req.params);
        // Verificar que existe
        const existingSubCategoria = await prisma_1.prisma.subCategoria.findUnique({
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
        const materialesCount = await prisma_1.prisma.material.count({
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
        const subcategoria = await prisma_1.prisma.subCategoria.update({
            where: { id },
            data: { estado: false },
        });
        res.status(200).json({
            success: true,
            data: subcategoria,
            message: "Subcategoría eliminada exitosamente",
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
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
exports.deleteSubCategoria = deleteSubCategoria;
