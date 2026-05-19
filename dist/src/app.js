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
const usuarios_routes_1 = __importDefault(require("./routes/usuarios.routes"));
const app = (0, express_1.default)();
const allowedOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
app.use((0, cors_1.default)({ origin: allowedOrigin }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true, message: "Backend funcionando" });
});
app.use("/auth", auth_routes_1.default);
app.use("/usuarios", usuarios_routes_1.default);
exports.default = app;
