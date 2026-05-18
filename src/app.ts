import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";

const app = express();

const allowedOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

app.use(cors({ origin: allowedOrigin }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Backend funcionando" });
});

app.use("/auth", authRoutes);

export default app;
