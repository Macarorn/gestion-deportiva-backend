"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    correo: zod_1.z.string().trim().email("Correo invalido"),
    contrasena: zod_1.z
        .string()
        .min(6, "La contrasena debe tener al menos 6 caracteres"),
    recordar: zod_1.z.boolean().optional(),
});
