import { Request, Response } from "express";
import prisma from "../lib/prisma";
import type {
  CreateUsuarioInput,
  UpdateUsuarioInput,
} from "../schemas/usuarios.schema";
import { hashPassword } from "../utils/password";

/**
 * Crear un nuevo usuario (solo Admin)
 */
export const createUsuario = async (req: Request, res: Response) => {
  try {
    const data = req.body as CreateUsuarioInput;

    // Verificar que email no exista
    const usuarioEmail = await prisma.usuario.findUnique({
      where: { correo: data.correo },
    });
    if (usuarioEmail) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    // Verificar que documento no exista
    const usuarioDoc = await prisma.usuario.findUnique({
      where: { numero_documento: data.numero_documento },
    });
    if (usuarioDoc) {
      return res
        .status(409)
        .json({ message: "El documento ya está registrado" });
    }

    // Hash contraseña si se proporciona
    let contrasenaHash: string | null = null;
    if (data.contrasena) {
      contrasenaHash = await hashPassword(data.contrasena);
    }

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        numero_documento: data.numero_documento,
        correo: data.correo,
        contrasena: contrasenaHash || "",
        telefono: data.telefono,
        tipo_usuario: data.tipo_usuario,
        estado: data.estado ?? true,
        ficha: data.ficha ?? null,
        observaciones: data.observaciones ?? null,
      },
    });

    // Responder sin contraseña
    const { contrasena: _, ...usuarioSinPassword } = usuario;
    return res.status(201).json({
      message: "Usuario creado exitosamente",
      data: usuarioSinPassword,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener usuarios con filtros y paginación
 */
export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const {
      busqueda = "",
      rol,
      estado,
      pagina = "1",
      limit = "10",
    } = req.query;

    const paginaNum = Math.max(1, parseInt(pagina as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 10),
    );
    const skip = (paginaNum - 1) * limitNum;

    // Construir where clause
    const where: any = {};

    // Búsqueda por nombre, apellido, email o documento
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda as string } },
        { apellido: { contains: busqueda as string } },
        { correo: { contains: busqueda as string } },
        { numero_documento: { contains: busqueda as string } },
      ];
    }

    // Filtro por rol
    if (rol) {
      where.tipo_usuario = rol;
    }

    // Filtro por estado
    if (estado !== undefined) {
      where.estado = estado === "true" || estado === "1";
    }

    // Obtener total
    const total = await prisma.usuario.count({ where });

    // Obtener usuarios
    const usuarios = await prisma.usuario.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        numero_documento: true,
        correo: true,
        telefono: true,
        tipo_usuario: true,
        estado: true,
        ficha: true,
        observaciones: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalPaginas = Math.ceil(total / limitNum);

    return res.status(200).json({
      message: "Usuarios obtenidos exitosamente",
      data: {
        usuarios,
        paginacion: {
          pagina: paginaNum,
          limit: limitNum,
          total,
          totalPaginas,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener usuario por ID
 */
export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id as string) },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        numero_documento: true,
        correo: true,
        telefono: true,
        tipo_usuario: true,
        estado: true,
        ficha: true,
        observaciones: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      message: "Usuario obtenido exitosamente",
      data: usuario,
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Actualizar usuario
 */
export const updateUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateUsuarioInput;

    // Verificar que usuario existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!usuarioExistente) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Si viene email nuevo, verificar que no exista
    if (data.correo && data.correo !== usuarioExistente.correo) {
      const usuarioEmail = await prisma.usuario.findUnique({
        where: { correo: data.correo },
      });
      if (usuarioEmail) {
        return res
          .status(409)
          .json({ message: "El correo ya está registrado" });
      }
    }

    // Si viene documento nuevo, verificar que no exista
    if (
      data.numero_documento &&
      data.numero_documento !== usuarioExistente.numero_documento
    ) {
      const usuarioDoc = await prisma.usuario.findUnique({
        where: { numero_documento: data.numero_documento },
      });
      if (usuarioDoc) {
        return res
          .status(409)
          .json({ message: "El documento ya está registrado" });
      }
    }

    // Preparar datos a actualizar
    const dataActualizar: any = {};

    if (data.nombre) dataActualizar.nombre = data.nombre;
    if (data.apellido) dataActualizar.apellido = data.apellido;
    if (data.numero_documento)
      dataActualizar.numero_documento = data.numero_documento;
    if (data.correo) dataActualizar.correo = data.correo;
    if (data.telefono) dataActualizar.telefono = data.telefono;
    if (data.tipo_usuario) dataActualizar.tipo_usuario = data.tipo_usuario;
    if (data.estado !== undefined) dataActualizar.estado = data.estado;
    if (data.ficha !== undefined) dataActualizar.ficha = data.ficha;
    if (data.observaciones !== undefined)
      dataActualizar.observaciones = data.observaciones;

    // Si viene contraseña, hashearla
    if (data.contrasena) {
      dataActualizar.contrasena = await hashPassword(data.contrasena);
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id as string) },
      data: dataActualizar,
      select: {
        id: true,
        nombre: true,
        apellido: true,
        numero_documento: true,
        correo: true,
        telefono: true,
        tipo_usuario: true,
        estado: true,
        ficha: true,
        observaciones: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Usuario actualizado exitosamente",
      data: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Eliminar/desactivar usuario
 */
export const deleteUsuario = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que usuario existe
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Soft delete: desactivar en lugar de eliminar
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(id as string) },
      data: { estado: false },
    });

    return res.status(200).json({
      message: "Usuario desactivado exitosamente",
      data: {
        id: usuarioActualizado.id,
        estado: usuarioActualizado.estado,
      },
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
