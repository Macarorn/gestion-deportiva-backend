import { Router } from "express";
import {
  createEscenario,
  inactivarEscenario,
  getAllEscenarios,
  getEscenarioById,
  updateEscenario,
} from "../controllers/escenarios.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/**
 * GET /api/escenarios
 * Obtener todos los escenarios
 */
router.get("/", authenticate, getAllEscenarios);

/**
 * GET /api/escenarios/:id
 * Obtener un escenario por ID
 */
router.get("/:id", authenticate, getEscenarioById);

/**
 * POST /api/escenarios
 * Crear un nuevo escenario
 * Requiere: Administrador
 */
router.post(
  "/",
  authenticate,
  authorize(["Administrador"]),
  createEscenario,
);

/**
 * PUT /api/escenarios/:id
 * Actualizar un escenario
 * Requiere: Administrador
 */
router.put(
  "/:id",
  authenticate,
  authorize(["Administrador"]),
  updateEscenario,
);

/**
 * PATCH /api/escenarios/:id/inactivar
 * Inactivar un escenario
 * Requiere: Administrador
 */
router.patch(
  "/:id/inactivar",
  authenticate,
  authorize(["Administrador"]),
  inactivarEscenario,
);

export default router;
