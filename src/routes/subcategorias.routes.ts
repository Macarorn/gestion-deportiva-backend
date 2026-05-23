import { Router } from "express";
import {
  createSubCategoria,
  deleteSubCategoria,
  getAllSubCategorias,
  getSubCategoriaById,
  getSubCategoriasByCategoria,
  updateSubCategoria,
} from "../controllers/subcategorias.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/**
 * GET /api/subcategorias
 * Obtener todas las subcategorías
 */
router.get("/", authenticate, getAllSubCategorias);

/**
 * GET /api/subcategorias/:id
 * Obtener una subcategoría por ID
 */
router.get("/:id", authenticate, getSubCategoriaById);

/**
 * GET /api/categorias/:categoriaId/subcategorias
 * Obtener subcategorías de una categoría específica
 */
router.get(
  "/categoria/:categoriaId",
  authenticate,
  getSubCategoriasByCategoria,
);

/**
 * POST /api/subcategorias
 * Crear una nueva subcategoría
 * Requiere: Administrador, Almacenista
 */
router.post(
  "/",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  createSubCategoria,
);

/**
 * PUT /api/subcategorias/:id
 * Actualizar una subcategoría
 * Requiere: Administrador, Almacenista
 */
router.put(
  "/:id",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  updateSubCategoria,
);

/**
 * DELETE /api/subcategorias/:id
 * Eliminar una subcategoría
 * Requiere: Administrador
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["Administrador"]),
  deleteSubCategoria,
);

export default router;
