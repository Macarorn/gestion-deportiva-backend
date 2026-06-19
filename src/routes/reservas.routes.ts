import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import {
  getReservas,
  getReservaById,
  createReserva,
  editReserva,
  activateReserva,
  finalizeReserva,
  cancelReserva,
} from "../controllers/reservas.controller";

const router = Router();

router.use(authenticate);

// GET /reservas - Listar reservas (todos los roles autenticados)
router.get("/", getReservas);

// GET /reservas/:id - Detalle de reserva
router.get("/:id", getReservaById);

// POST /reservas - Crear reserva (Instructor crea para sí mismo)
router.post(
  "/",
  authorize(["Administrador", "Almacenista", "Instructor"]),
  createReserva
);

// PUT /reservas/:id/edit - Editar reserva (solo si está pendiente)
router.put(
  "/:id/edit",
  authorize(["Administrador", "Almacenista", "Instructor"]),
  editReserva
);

// PATCH /reservas/:id/activate - Activar reserva (solo Admin/Almacenista)
router.patch(
  "/:id/activate",
  authorize(["Administrador", "Almacenista"]),
  activateReserva
);

// PATCH /reservas/:id/finalize - Finalizar reserva (solo Admin/Almacenista)
router.patch(
  "/:id/finalize",
  authorize(["Administrador", "Almacenista"]),
  finalizeReserva
);

// PATCH /reservas/:id/cancel - Cancelar reserva (Instructor que creó, Admin, Almacenista)
router.patch(
  "/:id/cancel",
  authorize(["Administrador", "Almacenista", "Instructor"]),
  cancelReserva
);

export default router;
