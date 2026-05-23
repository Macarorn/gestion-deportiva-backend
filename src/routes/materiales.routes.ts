import { Router } from "express";
import {
  createMaterial,
  deleteMaterial,
  getAllMateriales,
  getMaterialById,
  getMaterialesBySubCategoria,
  updateMaterial,
} from "../controllers/materiales.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/**
 * GET /api/materiales
 * Obtener todos los materiales
 */
router.get("/", authenticate, getAllMateriales);

/**
 * GET /api/materiales/:id
 * Obtener un material por ID
 */
router.get("/:id", authenticate, getMaterialById);

/**
 * GET /api/subcategorias/:subCategoriaId/materiales
 * Obtener materiales de una subcategoría específica
 */
router.get(
  "/subcategoria/:subCategoriaId",
  authenticate,
  getMaterialesBySubCategoria,
);

/**
 * POST /api/materiales
 * Crear un nuevo material
 * Requiere: Administrador, Almacenista
 */
router.post(
  "/",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  createMaterial,
);

/**
 * PUT /api/materiales/:id
 * Actualizar un material
 * Requiere: Administrador, Almacenista
 */
router.put(
  "/:id",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  updateMaterial,
);

/**
 * DELETE /api/materiales/:id
 * Eliminar un material
 * Requiere: Administrador
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["Administrador"]),
  deleteMaterial,
);

export default router;
