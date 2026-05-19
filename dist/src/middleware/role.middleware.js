"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Usuario no autenticado" });
        }
        if (!rolesPermitidos.includes(req.user.tipo_usuario)) {
            return res.status(403).json({
                message: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(", ")}`,
            });
        }
        return next();
    };
};
exports.requireRole = requireRole;
