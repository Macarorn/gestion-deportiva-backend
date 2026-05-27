"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrestamoByIdSchema = exports.getPrestamosSchema = exports.cancelarPrestamoSchema = exports.devolverPrestamoSchema = exports.activarPrestamoSchema = exports.createPrestamoSchema = void 0;
const zod_1 = require("zod");
exports.createPrestamoSchema = zod_1.z.object({
    usuarioId: zod_1.z.number().int().positive("Usuario es requerido"),
    usuarioSolicitanteId: zod_1.z.number().int().positive().optional(),
    aprendizId: zod_1.z.number().int().positive().optional(),
    detalles: zod_1.z.array(zod_1.z.object({
        materialId: zod_1.z.number().int().positive("Material es requerido"),
        elementoId: zod_1.z.number().int().positive().optional(),
        cantidad_solicitada: zod_1.z.number().int().positive("Cantidad debe ser mayor a 0"),
        observaciones: zod_1.z.string().optional()
    })).min(1, "Debe incluir al menos un material"),
    fecha_prestamo: zod_1.z.string().datetime(),
    fecha_devolucion_esperada: zod_1.z.string().datetime(),
    hora_entrega: zod_1.z.string().optional(),
    observaciones: zod_1.z.string().optional()
});
exports.activarPrestamoSchema = zod_1.z.object({
    detalles: zod_1.z.array(zod_1.z.object({
        detalle_id: zod_1.z.number().int(),
        cantidad_entregada: zod_1.z.number().int().min(0)
    }))
});
exports.devolverPrestamoSchema = zod_1.z.object({
    detalles: zod_1.z.array(zod_1.z.object({
        detalle_id: zod_1.z.number().int(),
        cantidad_devuelta: zod_1.z.number().int().min(0),
        cantidad_danada: zod_1.z.number().int().min(0).default(0),
        cantidad_faltante: zod_1.z.number().int().min(0).default(0),
        elementoId: zod_1.z.number().int().positive().optional(),
        elementosConNovedad: zod_1.z.array(zod_1.z.object({
            elementoId: zod_1.z.number().int().positive(),
            estado: zod_1.z.enum(["devuelto", "dañado", "faltante"]),
            descripcion: zod_1.z.string().optional(),
        })).optional(),
        novedades: zod_1.z.array(zod_1.z.object({
            tipo: zod_1.z.enum(["daño", "pérdida"]),
            descripcion: zod_1.z.string().min(1),
            cantidad_afectada: zod_1.z.number().int().positive(),
            elementoId: zod_1.z.number().int().positive().optional(),
        })).optional()
    })),
    observaciones: zod_1.z.string().optional()
});
exports.cancelarPrestamoSchema = zod_1.z.object({
    motivo: zod_1.z.string().optional()
});
exports.getPrestamosSchema = zod_1.z.object({
    estado: zod_1.z.enum(["pendiente", "activo", "devuelto", "vencido", "cancelado"]).optional(),
    usuarioId: zod_1.z.coerce.number().int().positive().optional(),
    busqueda: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().default(10)
});
exports.getPrestamoByIdSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive("ID debe ser un número positivo")
});
