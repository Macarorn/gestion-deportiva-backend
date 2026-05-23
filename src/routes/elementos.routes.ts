import { Router } from "express";
import {
  createElemento,
  deleteElemento,
  getAllElementos,
  getElementoById,
  getElementosByEstado,
  getElementosByMaterial,
  updateElemento,
} from "../controllers/elementos.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/**
 * GET /api/elementos
 * Obtener todos los elementos
 */
router.get("/", authenticate, getAllElementos);

/**
 * GET /api/elementos/:id
 * Obtener un elemento por ID
 */
router.get("/:id", authenticate, getElementoById);

/**
 * GET /api/materiales/:materialId/elementos
 * Obtener elementos de un material específico
 */
router.get("/material/:materialId", authenticate, getElementosByMaterial);

/**
 * GET /api/elementos/estado/:estado
 * Obtener elementos por estado (disponible, prestado, dañado, perdido)
 */
router.get("/estado/:estado", authenticate, getElementosByEstado);

/**
 * POST /api/elementos
 * Crear un nuevo elemento
 * Requiere: Administrador, Almacenista
 */
router.post(
  "/",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  createElemento,
);

/**
 * PUT /api/elementos/:id
 * Actualizar un elemento
 * Requiere: Administrador, Almacenista
 */
router.put(
  "/:id",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  updateElemento,
);

/**
 * DELETE /api/elementos/:id
 * Eliminar un elemento
 * Requiere: Administrador
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["Administrador"]),
  deleteElemento,
);

export default router;
