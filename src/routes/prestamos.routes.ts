import { Router } from "express";
import {
  createPrestamo,
  getPrestamos,
  getPrestamoById,
  activarPrestamo,
  devolverPrestamo,
  cancelarPrestamo,
} from "../controllers/prestamos.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  createPrestamoSchema,
  activarPrestamoSchema,
  devolverPrestamoSchema,
  cancelarPrestamoSchema,
} from "../schemas/prestamo.schema";

const router = Router();

/**
 * POST /api/prestamos
 * Crear nuevo préstamo (estado: pendiente)
 * Requiere: Administrador, Almacenista, Instructor
 */
router.post(
  "/",
  authenticate,
  authorize(["Administrador", "Almacenista", "Instructor"]),
  validateBody(createPrestamoSchema),
  createPrestamo,
);

/**
 * GET /api/prestamos
 * Listar préstamos con filtros
 * Requiere: Autenticado
 */
router.get("/", authenticate, getPrestamos);

/**
 * GET /api/prestamos/:id
 * Obtener detalle de préstamo
 * Requiere: Autenticado
 */
router.get("/:id", authenticate, getPrestamoById);

/**
 * PUT /api/prestamos/:id/activar
 * Activar préstamo (pendiente -> activo) y descontar inventario
 * Requiere: Administrador, Almacenista
 */
router.put(
  "/:id/activar",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  validateBody(activarPrestamoSchema),
  activarPrestamo,
);

/**
 * PUT /api/prestamos/:id/devolver
 * Devolver préstamo (activo -> devuelto) con novedades
 * Requiere: Administrador, Almacenista, Instructor
 */
router.put(
  "/:id/devolver",
  authenticate,
  authorize(["Administrador", "Almacenista", "Instructor"]),
  validateBody(devolverPrestamoSchema),
  devolverPrestamo,
);

/**
 * PUT /api/prestamos/:id/cancelar
 * Cancelar préstamo (pendiente/activo -> cancelado)
 * Requiere: Administrador, Almacenista
 */
router.put(
  "/:id/cancelar",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  validateBody(cancelarPrestamoSchema),
  cancelarPrestamo,
);

export default router;
