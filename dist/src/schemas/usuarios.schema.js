"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsuarioSchema = exports.createUsuarioSchema = void 0;
const zod_1 = require("zod");
// Regex para validar contraseña
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
// Regex para validar nombre/apellido
const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
// Regex para validar teléfono colombiano
const phoneRegex = /^\+57\s?\d{10}$/;
exports.createUsuarioSchema = zod_1.z
    .object({
    nombre: zod_1.z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .regex(nameRegex, "El nombre solo debe contener letras y espacios"),
    apellido: zod_1.z
        .string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(100, "El apellido no puede exceder 100 caracteres")
        .regex(nameRegex, "El apellido solo debe contener letras y espacios"),
    numero_documento: zod_1.z
        .string()
        .regex(/^\d{6,}$/, "El documento debe contener al menos 6 dígitos"),
    correo: zod_1.z.string().email("Debe ser un correo válido").toLowerCase(),
    telefono: zod_1.z
        .string()
        .regex(phoneRegex, "El teléfono debe tener formato +57 XXXXXXXXXX (10 dígitos)"),
    tipo_usuario: zod_1.z.enum([
        "Administrador",
        "Almacenista",
        "Instructor",
        "Aprendiz",
        "Externo",
    ]),
    contrasena: zod_1.z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(passwordRegex, "La contraseña debe contener mayúscula, minúscula, número y símbolo")
        .optional()
        .or(zod_1.z.literal("")),
    estado: zod_1.z.boolean().default(true),
    ficha: zod_1.z.string().optional().nullable(),
    observaciones: zod_1.z.string().optional().nullable(),
})
    .refine((data) => {
    // Si es Administrador, Almacenista o Instructor, requiere contraseña
    const rolesQueRequierenContrasena = [
        "Administrador",
        "Almacenista",
        "Instructor",
    ];
    if (rolesQueRequierenContrasena.includes(data.tipo_usuario)) {
        return data.contrasena && data.contrasena.length > 0;
    }
    // Para Aprendiz y Externo, contraseña es opcional
    return true;
}, {
    message: "La contraseña es requerida para este rol: mín 8 caracteres, mayúscula, minúscula, número y símbolo",
    path: ["contrasena"],
});
exports.updateUsuarioSchema = zod_1.z.object({
    nombre: zod_1.z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .regex(nameRegex, "El nombre solo debe contener letras y espacios")
        .optional(),
    apellido: zod_1.z
        .string()
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(100, "El apellido no puede exceder 100 caracteres")
        .regex(nameRegex, "El apellido solo debe contener letras y espacios")
        .optional(),
    numero_documento: zod_1.z
        .string()
        .regex(/^\d{6,}$/, "El documento debe contener al menos 6 dígitos")
        .optional(),
    correo: zod_1.z
        .string()
        .email("Debe ser un correo válido")
        .toLowerCase()
        .optional(),
    telefono: zod_1.z
        .string()
        .regex(phoneRegex, "El teléfono debe tener formato +57 XXXXXXXXXX (10 dígitos)")
        .optional(),
    tipo_usuario: zod_1.z
        .enum(["Administrador", "Almacenista", "Instructor", "Aprendiz", "Externo"])
        .optional(),
    contrasena: zod_1.z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(passwordRegex, "La contraseña debe contener mayúscula, minúscula, número y símbolo")
        .optional(),
    estado: zod_1.z.boolean().optional(),
    ficha: zod_1.z.string().optional().nullable(),
    observaciones: zod_1.z.string().optional().nullable(),
});
