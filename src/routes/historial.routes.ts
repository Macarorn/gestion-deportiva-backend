import { Router } from "express";
import { getHistorial } from "../controllers/historial.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * GET /api/historial
 * Historial unificado de préstamos y reservas.
 * Requiere: Autenticado
 */
router.get("/", authenticate, getHistorial);

export default router;
