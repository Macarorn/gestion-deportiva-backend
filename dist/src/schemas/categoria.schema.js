"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoriaSchema = exports.updateCategoriaSchema = exports.createCategoriaSchema = void 0;
const zod_1 = require("zod");
exports.createCategoriaSchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "Nombre debe tener al menos 3 caracteres")
        .max(100, "Nombre no puede exceder 100 caracteres"),
    descripcion: zod_1.z
        .string()
        .max(500, "Descripción no puede exceder 500 caracteres")
        .optional(),
    estado: zod_1.z.boolean().default(true).optional(),
});
exports.updateCategoriaSchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(3, "Nombre debe tener al menos 3 caracteres")
        .max(100, "Nombre no puede exceder 100 caracteres")
        .optional(),
    descripcion: zod_1.z
        .string()
        .max(500, "Descripción no puede exceder 500 caracteres")
        .optional(),
    estado: zod_1.z.boolean().optional(),
});
exports.getCategoriaSchema = zod_1.z.object({
    id: zod_1.z.number().int().positive("ID debe ser un número positivo"),
});
