import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { signAccessToken } from "../utils/jwt";
import { verifyPassword } from "../utils/password";

export const login = async (req: Request, res: Response) => {
  const { correo, contrasena, recordar } = req.body;

  const usuario = await prisma.usuario.findUnique({
    where: { correo },
  });

  if (!usuario || !usuario.estado) {
    return res.status(401).json({ message: "Credenciales invalidas" });
  }

  const passwordOk = await verifyPassword(contrasena, usuario.contrasena);
  if (!passwordOk) {
    return res.status(401).json({ message: "Credenciales invalidas" });
  }

  const token = signAccessToken(
    {
      sub: String(usuario.id),
      correo: usuario.correo,
      tipo_usuario: usuario.tipo_usuario,
    },
    recordar,
  );

  return res.json({
    token,
    tipo_usuario: usuario.tipo_usuario,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      tipo_usuario: usuario.tipo_usuario,
    },
  });
};

export const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      nombre: true,
      correo: true,
      tipo_usuario: true,
      estado: true,
    },
  });

  if (!usuario || !usuario.estado) {
    return res.status(401).json({ message: "No autenticado" });
  }

  return res.json({ usuario });
};
