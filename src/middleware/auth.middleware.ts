import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token requerido" });
  }

  const token = header.replace("Bearer ", "");

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: Number(payload.sub),
      correo: payload.correo,
      tipo_usuario: payload.tipo_usuario,
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Token invalido o expirado" });
  }
};

// Alias para compatibilidad
export const authenticate = requireAuth;
