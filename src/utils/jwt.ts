import { TipoUsuario } from "@prisma/client";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export interface AuthTokenPayload extends JwtPayload {
  sub: string;
  correo: string;
  tipo_usuario: TipoUsuario;
}

const getJwtSecret = (): Secret => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no configurado");
  }
  return secret as Secret;
};

const getExpiresIn = (remember?: boolean) => {
  if (remember && process.env.JWT_EXPIRES_IN_REMEMBER) {
    return process.env.JWT_EXPIRES_IN_REMEMBER;
  }
  return process.env.JWT_EXPIRES_IN ?? "1d";
};

export const signAccessToken = (
  payload: Omit<AuthTokenPayload, "iat" | "exp">,
  remember?: boolean,
) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: getExpiresIn(remember) as any,
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
