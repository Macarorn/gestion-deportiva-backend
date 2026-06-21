import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import {
  getAdminDashboard,
  getAlmacenistaDashboard,
  getInstructorDashboard,
} from "../controllers/dashboard.controller";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorize(["Administrador"]),
  getAdminDashboard
);

router.get(
  "/almacenista",
  authenticate,
  authorize(["Administrador", "Almacenista"]),
  getAlmacenistaDashboard
);

router.get(
  "/instructor",
  authenticate,
  authorize(["Instructor"]),
  getInstructorDashboard
);

export default router;
