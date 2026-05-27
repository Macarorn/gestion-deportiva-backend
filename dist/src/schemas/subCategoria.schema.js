"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubCategoriaSchema = exports.updateSubCategoriaSchema = exports.createSubCategoriaSchema = void 0;
const zod_1 = require("zod");
exports.createSubCategoriaSchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "Nombre debe tener al menos 3 caracteres")
        .max(100, "Nombre no puede exceder 100 caracteres"),
    descripcion: zod_1.z
        .string()
        .max(500, "Descripción no puede exceder 500 caracteres")
        .optional(),
    categoriaId: zod_1.z
        .number()
        .int()
        .positive("categoriaId debe ser un número positivo"),
    estado: zod_1.z.boolean().default(true).optional(),
});
exports.updateSubCategoriaSchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "Nombre debe tener al menos 3 caracteres")
        .max(100, "Nombre no puede exceder 100 caracteres")
        .optional(),
    descripcion: zod_1.z
        .string()
        .max(500, "Descripción no puede exceder 500 caracteres")
        .optional(),
    categoriaId: zod_1.z
        .number()
        .int()
        .positive("categoriaId debe ser un número positivo")
        .optional(),
    estado: zod_1.z.boolean().optional(),
});
exports.getSubCategoriaSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive("ID debe ser un número positivo"),
});
