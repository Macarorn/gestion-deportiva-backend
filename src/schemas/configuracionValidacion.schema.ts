import { z } from "zod";

export const getConfiguracionValidacionSchema = z.object({});

export const updateConfiguracionValidacionSchema = z.object({
  plantilla_pdf: z.string().optional().nullable(),
  contacto_nombre: z.string().max(191).optional().nullable(),
  contacto_telefono: z.string().max(191).optional().nullable(),
});
