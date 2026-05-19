import { Router } from "express";
import {
  createUsuario,
  deleteUsuario,
  getUsuarioById,
  getUsuarios,
  updateUsuario,
} from "../controllers/usuarios.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  createUsuarioSchema,
  updateUsuarioSchema,
} from "../schemas/usuarios.schema";

const router = Router();

// Todas las rutas requieren autenticación y rol de Administrador
router.use(requireAuth, requireRole(["Administrador"]));

/**
 * POST /usuarios
 * Crear nuevo usuario
 */
router.post("/", validateBody(createUsuarioSchema), createUsuario);

/**
 * GET /usuarios
 * Obtener usuarios con filtros y paginación
 * Query params: busqueda, rol, estado, pagina, limit
 */
router.get("/", getUsuarios);

/**
 * GET /usuarios/:id
 * Obtener usuario por ID
 */
router.get("/:id", getUsuarioById);

/**
 * PUT /usuarios/:id
 * Actualizar usuario
 */
router.put("/:id", validateBody(updateUsuarioSchema), updateUsuario);

/**
 * DELETE /usuarios/:id
 * Desactivar usuario (soft delete)
 */
router.delete("/:id", deleteUsuario);

export default router;
