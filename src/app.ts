import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes";
import categoriasRoutes from "./routes/categorias.routes";
import elementosRoutes from "./routes/elementos.routes";
import materialesRoutes from "./routes/materiales.routes";
import subcategoriasRoutes from "./routes/subcategorias.routes";
import usuariosRoutes from "./routes/usuarios.routes";

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_ORIGIN ?? "http://localhost:5173"
).split(",");

app.use(cors({ origin: allowedOrigins }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, message: "Backend funcionando" });
});

// Rutas de autenticación y usuarios
app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);

// Rutas de inventario (Categorías, SubCategorías, Materiales, Elementos)
app.use("/categorias", categoriasRoutes);
app.use("/subcategorias", subcategoriasRoutes);
app.use("/materiales", materialesRoutes);
app.use("/elementos", elementosRoutes);

export default app;
