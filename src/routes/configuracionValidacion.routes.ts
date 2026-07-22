import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getConfiguracionValidacion,
  updateConfiguracionValidacion,
} from "../controllers/configuracionValidacion.controller";

const router = Router();

router.get("/", authenticate, getConfiguracionValidacion);
router.put("/", authenticate, updateConfiguracionValidacion);

export default router;
