"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoria = exports.updateCategoria = exports.createCategoria = exports.getCategoriaById = exports.getAllCategorias = void 0;
const prisma_1 = require("../lib/prisma");
const categoria_schema_1 = require("../schemas/categoria.schema");
const zod_1 = require("zod");
/**
 * GET /api/categorias
 * Obtener todas las categorías con sus subcategorías
 */
const getAllCategorias = async (req, res) => {
    try {
        const categorias = await prisma_1.prisma.categoria.findMany({
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
    }
    catch (error) {
        console.error("Error en getAllCategorias:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener categorías",
        });
    }
};
exports.getAllCategorias = getAllCategorias;
/**
 * GET /api/categorias/:id
 * Obtener una categoría específica con sus subcategorías
 */
const getCategoriaById = async (req, res) => {
    try {
        const { id } = categoria_schema_1.getCategoriaSchema.parse(req.params);
        const categoria = await prisma_1.prisma.categoria.findUnique({
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
        console.error("Error en getCategoriaById:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener categoría",
        });
    }
};
exports.getCategoriaById = getCategoriaById;
/**
 * POST /api/categorias
 * Crear una nueva categoría
 */
const createCategoria = async (req, res) => {
    try {
        const data = categoria_schema_1.createCategoriaSchema.parse(req.body);
        const categoria = await prisma_1.prisma.categoria.create({
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
exports.createCategoria = createCategoria;
/**
 * PUT /api/categorias/:id
 * Actualizar una categoría
 */
const updateCategoria = async (req, res) => {
    try {
        const { id } = categoria_schema_1.getCategoriaSchema.parse(req.params);
        const data = categoria_schema_1.updateCategoriaSchema.parse(req.body);
        // Verificar que existe
        const existingCategoria = await prisma_1.prisma.categoria.findUnique({
            where: { id },
        });
        if (!existingCategoria) {
            res.status(404).json({
                success: false,
                error: "Categoría no encontrada",
            });
            return;
        }
        const categoria = await prisma_1.prisma.categoria.update({
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
exports.updateCategoria = updateCategoria;
/**
 * DELETE /api/categorias/:id
 * Eliminar una categoría (soft delete con estado=false)
 */
const deleteCategoria = async (req, res) => {
    try {
        const { id } = categoria_schema_1.getCategoriaSchema.parse(req.params);
        // Verificar que existe
        const existingCategoria = await prisma_1.prisma.categoria.findUnique({
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
        const subcategoriasWithMaterials = await prisma_1.prisma.subCategoria.findMany({
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
        const categoria = await prisma_1.prisma.categoria.update({
            where: { id },
            data: { estado: false },
        });
        res.status(200).json({
            success: true,
            data: categoria,
            message: "Categoría eliminada exitosamente",
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
        console.error("Error en deleteCategoria:", error);
        res.status(500).json({
            success: false,
            error: "Error al eliminar categoría",
        });
    }
};
exports.deleteCategoria = deleteCategoria;
