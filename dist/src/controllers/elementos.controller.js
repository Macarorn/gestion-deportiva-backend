"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteElemento = exports.updateElemento = exports.createElemento = exports.getElementosByEstado = exports.getElementosByMaterial = exports.getElementoById = exports.getAllElementos = void 0;
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const elemento_schema_1 = require("../schemas/elemento.schema");
/**
 * Función auxiliar para recalcular las cantidades de un material basado en sus elementos
 * Retorna el material actualizado con sus elementos
 */
async function recalcularCantidadesMaterial(materialId) {
    const elementos = await prisma_1.prisma.elemento.findMany({
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
    const materialActualizado = await prisma_1.prisma.material.update({
        where: { id: materialId },
        data: {
            cantidad_total,
            cantidad_disponible,
            cantidad_prestada,
            cantidad_danada,
            cantidad_mantenimiento,
        },
        include: {
            elementos: true,
            subCategoria: {
                include: {
                    categoria: true,
                },
            },
        },
    });
    console.log(`[recalcularCantidadesMaterial] Material actualizado`);
    return materialActualizado;
}
/**
 * GET /api/elementos
 * Obtener todos los elementos
 */
const getAllElementos = async (req, res) => {
    try {
        const elementos = await prisma_1.prisma.elemento.findMany({
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
    }
    catch (error) {
        console.error("Error en getAllElementos:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener elementos",
        });
    }
};
exports.getAllElementos = getAllElementos;
/**
 * GET /api/elementos/:id
 * Obtener un elemento específico
 */
const getElementoById = async (req, res) => {
    try {
        const { id } = elemento_schema_1.getElementoSchema.parse({ id: parseInt(String(req.params.id)) });
        const elemento = await prisma_1.prisma.elemento.findUnique({
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
        console.error("Error en getElementoById:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener elemento",
        });
    }
};
exports.getElementoById = getElementoById;
/**
 * GET /api/materiales/:materialId/elementos
 * Obtener elementos de un material específico
 */
const getElementosByMaterial = async (req, res) => {
    try {
        const materialId = req.params.materialId;
        const id = parseInt(materialId);
        if (isNaN(id)) {
            res.status(400).json({
                success: false,
                error: "materialId debe ser un número válido",
            });
            return;
        }
        // Verificar que existe el material
        const material = await prisma_1.prisma.material.findUnique({
            where: { id },
        });
        if (!material) {
            res.status(404).json({
                success: false,
                error: "Material no encontrado",
            });
            return;
        }
        const elementos = await prisma_1.prisma.elemento.findMany({
            where: { materialId: id },
            orderBy: { nombre_serial: "asc" },
        });
        res.status(200).json({
            success: true,
            data: elementos,
            total: elementos.length,
        });
    }
    catch (error) {
        console.error("Error en getElementosByMaterial:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener elementos",
        });
    }
};
exports.getElementosByMaterial = getElementosByMaterial;
/**
 * GET /api/elementos/estado/:estado
 * Obtener elementos por estado (disponible, prestado, dañado, perdido)
 */
const getElementosByEstado = async (req, res) => {
    try {
        const estado = req.params.estado;
        const validStates = ["disponible", "prestado", "dañado", "perdido"];
        if (!validStates.includes(estado)) {
            res.status(400).json({
                success: false,
                error: `Estado debe ser uno de: ${validStates.join(", ")}`,
            });
            return;
        }
        const elementos = await prisma_1.prisma.elemento.findMany({
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
    }
    catch (error) {
        console.error("Error en getElementosByEstado:", error);
        res.status(500).json({
            success: false,
            error: "Error al obtener elementos",
        });
    }
};
exports.getElementosByEstado = getElementosByEstado;
/**
 * POST /api/elementos
 * Crear un nuevo elemento
 */
const createElemento = async (req, res) => {
    try {
        const data = elemento_schema_1.createElementoSchema.parse(req.body);
        // Verificar que existe el material
        const material = await prisma_1.prisma.material.findUnique({
            where: { id: data.materialId },
        });
        if (!material) {
            res.status(404).json({
                success: false,
                error: "Material no encontrado",
            });
            return;
        }
        // Crear elemento
        await prisma_1.prisma.elemento.create({
            data,
        });
        // Recalcular cantidades del material padre y obtener material actualizado
        const materialActualizado = await recalcularCantidadesMaterial(data.materialId);
        res.status(201).json({
            success: true,
            data: materialActualizado,
            message: "Elemento creado exitosamente",
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
exports.createElemento = createElemento;
/**
 * PUT /api/elementos/:id
 * Actualizar un elemento
 */
const updateElemento = async (req, res) => {
    try {
        const { id } = elemento_schema_1.getElementoSchema.parse({ id: parseInt(String(req.params.id)) });
        const data = elemento_schema_1.updateElementoSchema.parse(req.body);
        // Verificar que existe
        const existingElemento = await prisma_1.prisma.elemento.findUnique({
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
            const newMaterial = await prisma_1.prisma.material.findUnique({
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
        // Actualizar elemento
        await prisma_1.prisma.elemento.update({
            where: { id },
            data,
        });
        // Recalcular cantidades del material original
        const materialActualizado = await recalcularCantidadesMaterial(existingElemento.materialId);
        // Si se cambió el materialId, recalcular también el nuevo material
        if (data.materialId && data.materialId !== existingElemento.materialId) {
            await recalcularCantidadesMaterial(data.materialId);
        }
        res.status(200).json({
            success: true,
            data: materialActualizado,
            message: "Elemento actualizado exitosamente",
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
exports.updateElemento = updateElemento;
/**
 * DELETE /api/elementos/:id
 * Eliminar un elemento (solo si está disponible)
 */
const deleteElemento = async (req, res) => {
    try {
        const { id } = elemento_schema_1.getElementoSchema.parse({ id: parseInt(String(req.params.id)) });
        // Verificar que existe
        const existingElemento = await prisma_1.prisma.elemento.findUnique({
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
        await prisma_1.prisma.elemento.delete({
            where: { id },
        });
        // Recalcular cantidades del material padre y obtener material actualizado
        const materialActualizado = await recalcularCantidadesMaterial(existingElemento.materialId);
        res.status(200).json({
            success: true,
            data: materialActualizado,
            message: "Elemento eliminado exitosamente",
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
        console.error("Error en deleteElemento:", error);
        res.status(500).json({
            success: false,
            error: "Error al eliminar elemento",
        });
    }
};
exports.deleteElemento = deleteElemento;
