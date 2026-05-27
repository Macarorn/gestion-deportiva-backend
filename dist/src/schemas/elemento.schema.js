"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElementoSchema = exports.updateElementoSchema = exports.createElementoSchema = void 0;
const zod_1 = require("zod");
exports.createElementoSchema = zod_1.z.object({
    materialId: zod_1.z
        .number()
        .int()
        .positive("materialId debe ser un número positivo"),
    nombre_serial: zod_1.z
        .string()
        .min(1, "nombre_serial es requerido")
        .max(100, "nombre_serial no puede exceder 100 caracteres"),
    estado: zod_1.z
        .enum(["disponible", "dañado", "mantenimiento", "prestado"], {
        message: "Estado debe ser: disponible, dañado, mantenimiento o prestado"
    })
        .default("disponible"),
    observaciones: zod_1.z
        .string()
        .max(500, "observaciones no puede exceder 500 caracteres")
        .optional()
        .nullable(),
});
exports.updateElementoSchema = zod_1.z.object({
    materialId: zod_1.z
        .number()
        .int()
        .positive("materialId debe ser un número positivo")
        .optional(),
    nombre_serial: zod_1.z
        .string()
        .min(1, "nombre_serial es requerido")
        .max(100, "nombre_serial no puede exceder 100 caracteres")
        .optional(),
    estado: zod_1.z.enum(["disponible", "dañado", "mantenimiento", "prestado"], {
        message: "Estado debe ser: disponible, dañado, mantenimiento o prestado"
    }).optional(),
    observaciones: zod_1.z
        .string()
        .max(500, "observaciones no puede exceder 500 caracteres")
        .optional()
        .nullable(),
});
exports.getElementoSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive("ID debe ser un número positivo"),
});
