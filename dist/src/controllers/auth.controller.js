"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const jwt_1 = require("../utils/jwt");
const password_1 = require("../utils/password");
const login = async (req, res) => {
    const { correo, contrasena, recordar } = req.body;
    const usuario = await prisma_1.default.usuario.findUnique({
        where: { correo },
    });
    if (!usuario || !usuario.estado) {
        return res.status(401).json({ message: "Credenciales invalidas" });
    }
    const passwordOk = await (0, password_1.verifyPassword)(contrasena, usuario.contrasena);
    if (!passwordOk) {
        return res.status(401).json({ message: "Credenciales invalidas" });
    }
    const token = (0, jwt_1.signAccessToken)({
        sub: String(usuario.id),
        correo: usuario.correo,
        tipo_usuario: usuario.tipo_usuario,
    }, recordar);
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
exports.login = login;
const me = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "No autenticado" });
    }
    const usuario = await prisma_1.default.usuario.findUnique({
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
exports.me = me;
