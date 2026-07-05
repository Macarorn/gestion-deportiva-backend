import type { usuario_tipo_usuario } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

export const requireRole = (rolesPermitidos: usuario_tipo_usuario[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

// Alias para compatibilidad
export const authorize = requireRole;
