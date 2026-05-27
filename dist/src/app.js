"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const categorias_routes_1 = __importDefault(require("./routes/categorias.routes"));
const elementos_routes_1 = __importDefault(require("./routes/elementos.routes"));
const materiales_routes_1 = __importDefault(require("./routes/materiales.routes"));
const prestamos_routes_1 = __importDefault(require("./routes/prestamos.routes"));
const subcategorias_routes_1 = __importDefault(require("./routes/subcategorias.routes"));
const usuarios_routes_1 = __importDefault(require("./routes/usuarios.routes"));
const app = (0, express_1.default)();
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173").split(",");
app.use((0, cors_1.default)({ origin: allowedOrigins }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true, message: "Backend funcionando" });
});
// Rutas de autenticación y usuarios
app.use("/auth", auth_routes_1.default);
app.use("/usuarios", usuarios_routes_1.default);
// Rutas de inventario (Categorías, SubCategorías, Materiales, Elementos)
app.use("/categorias", categorias_routes_1.default);
app.use("/subcategorias", subcategorias_routes_1.default);
app.use("/materiales", materiales_routes_1.default);
app.use("/elementos", elementos_routes_1.default);
// Rutas de préstamos
app.use("/prestamos", prestamos_routes_1.default);
exports.default = app;
