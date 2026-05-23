import { Router } from "express";
import {
  createCategoria,
  deleteCategoria,
  getAllCategorias,
  getCategoriaById,
  updateCategoria,
} from "../controllers/categorias.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/**
 * GET /api/categorias
 * Obtener todas las categorías
 */
router.get("/", authenticate, getAllCategorias);

/**
 * GET /api/categorias/:id
 * Obtener una categoría por ID
 */
router.get("/:id", authenticate, getCategoriaById);

/**
 * POST /api/categorias
 * Crear una nueva categoría
 * Requiere: Administrador, Almacenista
 */
router.post(
  "/",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  createCategoria,
);

/**
 * PUT /api/categorias/:id
 * Actualizar una categoría
 * Requiere: Administrador, Almacenista
 */
router.put(
  "/:id",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  updateCategoria,
);

/**
 * DELETE /api/categorias/:id
 * Eliminar una categoría
 * Requiere: Administrador
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["Administrador"]),
  deleteCategoria,
);

export default router;
