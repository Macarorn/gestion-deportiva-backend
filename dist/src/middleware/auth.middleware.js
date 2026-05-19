"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const requireAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token requerido" });
    }
    const token = header.replace("Bearer ", "");
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = {
            id: Number(payload.sub),
            correo: payload.correo,
            tipo_usuario: payload.tipo_usuario,
        };
        return next();
    }
    catch (_error) {
        return res.status(401).json({ message: "Token invalido o expirado" });
    }
};
exports.requireAuth = requireAuth;
