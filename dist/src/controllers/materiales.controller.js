"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaterial = exports.updateMaterial = exports.createMaterial = exports.getMaterialesBySubCategoria = exports.getMaterialById = exports.getAllMateriales = void 0;
const prisma_1 = require("../lib/prisma");
const material_schema_1 = require("../schemas/material.schema");
const zod_1 = require("zod");
/**
 * GET /api/materiales
 * Obtener todos los materiales con sus elementos
 */
const getAllMateriales = async (req, res) => {
    try {
        const materiales = await prisma_1.prisma.material.findMany({
            include: {
                subCategoria: {
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
                elementos: {
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
    }
    catch (error) {
        console.error("Error en getAllMateriales:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener materiales",
        });
    }
};
exports.getAllMateriales = getAllMateriales;
/**
 * GET /api/materiales/:id
 * Obtener un material específico con todos sus elementos
 */
const getMaterialById = async (req, res) => {
    try {
        const { id } = material_schema_1.getMaterialSchema.parse(req.params);
        const material = await prisma_1.prisma.material.findUnique({
            where: { id },
            include: {
                subCategoria: {
                    include: {
                        categoria: true,
                    },
                },
                elementos: {
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
        console.error("Error en getMaterialById:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener material",
        });
    }
};
exports.getMaterialById = getMaterialById;
/**
 * GET /api/subcategorias/:subCategoriaId/materiales
 * Obtener materiales de una subcategoría específica
 */
const getMaterialesBySubCategoria = async (req, res) => {
    try {
        const subCategoriaId = req.params.subCategoriaId;
        const id = parseInt(subCategoriaId);
        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                error: "subCategoriaId debe ser un número válido",
            });
            return;
        }
        // Verificar que existe la subcategoría
        const subcategoria = await prisma_1.prisma.subCategoria.findUnique({
            where: { id },
        });
        if (!subcategoria) {
            res.status(404).json({
                success: false,
                error: "Subcategoría no encontrada",
            });
            return;
        }
        const materiales = await prisma_1.prisma.material.findMany({
            where: { subCategoriaId: id },
            include: {
                elementos: {
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
    }
    catch (error) {
        console.error("Error en getMaterialesBySubCategoria:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener materiales",
        });
    }
};
exports.getMaterialesBySubCategoria = getMaterialesBySubCategoria;
/**
 * POST /api/materiales
 * Crear un nuevo material
 */
const createMaterial = async (req, res) => {
    try {
        const data = material_schema_1.createMaterialSchema.parse(req.body);
        // Verificar que existe la subcategoría
        const subcategoria = await prisma_1.prisma.subCategoria.findUnique({
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
        if (data.cantidad_disponible &&
            data.cantidad_prestada &&
            data.cantidad_total &&
            data.cantidad_disponible + data.cantidad_prestada !== data.cantidad_total) {
            res.status(400).json({
                success: false,
                error: "cantidad_disponible + cantidad_prestada debe ser igual a cantidad_total",
            });
            return;
        }
        const material = await prisma_1.prisma.material.create({
            data,
            include: {
                subCategoria: {
                    include: {
                        categoria: true,
                    },
                },
                elementos: true,
            },
        });
        res.status(201).json({
            success: true,
            data: material,
            message: "Material creado exitosamente",
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
        console.error("Error en createMaterial:", error);
        res.status(500).json({
            success: false,
            error: "Error al crear material",
        });
    }
};
exports.createMaterial = createMaterial;
/**
 * PUT /api/materiales/:id
 * Actualizar un material
 */
const updateMaterial = async (req, res) => {
    try {
        const { id } = material_schema_1.getMaterialSchema.parse(req.params);
        const data = material_schema_1.updateMaterialSchema.parse(req.body);
        // Verificar que existe
        const existingMaterial = await prisma_1.prisma.material.findUnique({
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
        if (data.subCategoriaId && data.subCategoriaId !== existingMaterial.subCategoriaId) {
            const newSubCategoria = await prisma_1.prisma.subCategoria.findUnique({
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
        // Validar que cantidades sean consistentes si se actualizan
        const cantidadTotal = data.cantidad_total ?? existingMaterial.cantidad_total;
        const cantidadDisponible = data.cantidad_disponible ?? existingMaterial.cantidad_disponible;
        const cantidadPrestada = data.cantidad_prestada ?? existingMaterial.cantidad_prestada;
        if (cantidadDisponible + cantidadPrestada !== cantidadTotal) {
            res.status(400).json({
                success: false,
                error: "cantidad_disponible + cantidad_prestada debe ser igual a cantidad_total",
            });
            return;
        }
        const material = await prisma_1.prisma.material.update({
            where: { id },
            data,
            include: {
                subCategoria: {
                    include: {
                        categoria: true,
                    },
                },
                elementos: true,
            },
        });
        res.status(200).json({
            success: true,
            data: material,
            message: "Material actualizado exitosamente",
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
        console.error("Error en updateMaterial:", error);
        res.status(500).json({
            success: false,
            error: "Error al actualizar material",
        });
    }
};
exports.updateMaterial = updateMaterial;
/**
 * DELETE /api/materiales/:id
 * Eliminar un material (soft delete con estado=inactivo)
 */
const deleteMaterial = async (req, res) => {
    try {
        const { id } = material_schema_1.getMaterialSchema.parse(req.params);
        // Verificar que existe
        const existingMaterial = await prisma_1.prisma.material.findUnique({
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
        const material = await prisma_1.prisma.material.update({
            where: { id },
            data: { estado: "inactivo" },
        });
        res.status(200).json({
            success: true,
            data: material,
            message: "Material eliminado exitosamente",
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
        console.error("Error en deleteMaterial:", error);
        res.status(500).json({
            success: false,
            error: "Error al eliminar material",
        });
    }
};
exports.deleteMaterial = deleteMaterial;
