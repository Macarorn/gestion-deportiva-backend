import { Router } from "express";
import { login, me } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/login", validateBody(loginSchema), login);
router.get("/me", requireAuth, me);

export default router;
