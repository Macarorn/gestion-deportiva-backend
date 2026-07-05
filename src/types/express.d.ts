import { usuario_tipo_usuario } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        correo: string;
        tipo_usuario: usuario_tipo_usuario;
      };
    }
  }
}

export {};
