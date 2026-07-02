import { z } from "zod";

// Regex para validar contraseña
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;

// Regex para validar nombre/apellido
const nameRegex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;

// Regex para validar teléfono colombiano
const phoneRegex = /^\d{9,}$/;

export const createUsuarioSchema = z
  .object({
    nombre: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres")
      .regex(nameRegex, "El nombre solo debe contener letras y espacios"),

    apellido: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(100, "El apellido no puede exceder 100 caracteres")
      .regex(nameRegex, "El apellido solo debe contener letras y espacios"),

    numero_documento: z
      .string()
      .regex(/^\d{9,}$/, "El documento debe tener al menos 9 dígitos"),

    correo: z.string().email("Debe ser un correo válido").toLowerCase(),

    telefono: z
      .string()
      .regex(
        phoneRegex,
        "El teléfono debe tener al menos 9 dígitos",
      ),

    tipo_usuario: z.enum([
      "Administrador",
      "Almacenista",
      "Instructor",
      "Aprendiz",
      "Externo",
    ]),

    contrasena: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        passwordRegex,
        "La contraseña debe contener mayúscula, minúscula, número y símbolo",
      )
      .optional()
      .or(z.literal("")),

    estado: z.boolean().default(true),

    ficha: z.string().optional().nullable(),

    observaciones: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
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
    },
    {
      message:
        "La contraseña es requerida para este rol: mín 8 caracteres, mayúscula, minúscula, número y símbolo",
      path: ["contrasena"],
    },
  );

export const updateUsuarioSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(nameRegex, "El nombre solo debe contener letras y espacios")
    .optional(),

  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(100, "El apellido no puede exceder 100 caracteres")
    .regex(nameRegex, "El apellido solo debe contener letras y espacios")
    .optional(),

  numero_documento: z
    .string()
    .regex(/^\d{9,}$/, "El documento debe tener al menos 9 dígitos")
    .optional(),

  correo: z
    .string()
    .email("Debe ser un correo válido")
    .toLowerCase()
    .optional(),

  telefono: z
    .string()
    .regex(
      phoneRegex,
      "El teléfono debe tener al menos 9 dígitos",
    )
    .optional(),

  tipo_usuario: z
    .enum(["Administrador", "Almacenista", "Instructor", "Aprendiz", "Externo"])
    .optional(),

  contrasena: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      passwordRegex,
      "La contraseña debe contener mayúscula, minúscula, número y símbolo",
    )
    .optional(),

  estado: z.boolean().optional(),

  ficha: z.string().optional().nullable(),

  observaciones: z.string().optional().nullable(),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
