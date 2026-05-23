"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMaterialSchema = exports.updateMaterialSchema = exports.createMaterialSchema = void 0;
const zod_1 = require("zod");
exports.createMaterialSchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "Nombre debe tener al menos 3 caracteres")
        .max(100, "Nombre no puede exceder 100 caracteres"),
    descripcion: zod_1.z.string().max(500, "Descripción no puede exceder 500 caracteres").optional(),
    subCategoriaId: zod_1.z.number().int().positive("subCategoriaId debe ser un número positivo"),
    cantidad_total: zod_1.z.number().int().min(0, "cantidad_total debe ser >= 0").default(0).optional(),
    cantidad_disponible: zod_1.z.number().int().min(0, "cantidad_disponible debe ser >= 0").default(0).optional(),
    cantidad_prestada: zod_1.z.number().int().min(0, "cantidad_prestada debe ser >= 0").default(0).optional(),
    estado: zod_1.z.enum(["activo", "inactivo", "mantenimiento"]).default("activo").optional(),
    fotografia: zod_1.z.string().url("fotografia debe ser una URL válida").optional().nullable(),
    observaciones: zod_1.z.string().max(500, "observaciones no puede exceder 500 caracteres").optional().nullable(),
});
exports.updateMaterialSchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "Nombre debe tener al menos 3 caracteres")
        .max(100, "Nombre no puede exceder 100 caracteres")
        .optional(),
    descripcion: zod_1.z.string().max(500, "Descripción no puede exceder 500 caracteres").optional(),
    subCategoriaId: zod_1.z.number().int().positive("subCategoriaId debe ser un número positivo").optional(),
    cantidad_total: zod_1.z.number().int().min(0, "cantidad_total debe ser >= 0").optional(),
    cantidad_disponible: zod_1.z.number().int().min(0, "cantidad_disponible debe ser >= 0").optional(),
    cantidad_prestada: zod_1.z.number().int().min(0, "cantidad_prestada debe ser >= 0").optional(),
    estado: zod_1.z.enum(["activo", "inactivo", "mantenimiento"]).optional(),
    fotografia: zod_1.z.string().url("fotografia debe ser una URL válida").optional().nullable(),
    observaciones: zod_1.z.string().max(500, "observaciones no puede exceder 500 caracteres").optional().nullable(),
});
exports.getMaterialSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive("ID debe ser un número positivo"),
});
