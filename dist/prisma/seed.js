"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
require("dotenv/config");
const password_1 = require("../src/utils/password");
const prisma = new client_1.PrismaClient();
const defaultPassword = "Password123!";
const seedUsers = [
    {
        nombre: "Carlos",
        apellido: "Instructor",
        numero_documento: "123456789",
        correo: "instructor@demo.com",
        telefono: "+573001234567",
        tipo_usuario: client_1.TipoUsuario.Instructor,
    },
    {
        nombre: "Ana",
        apellido: "Administradora",
        numero_documento: "987654321",
        correo: "admin@demo.com",
        telefono: "+573007654321",
        tipo_usuario: client_1.TipoUsuario.Administrador,
    },
    {
        nombre: "Luis",
        apellido: "Almacenista",
        numero_documento: "456123789",
        correo: "almacen@demo.com",
        telefono: "+573009876543",
        tipo_usuario: client_1.TipoUsuario.Almacenista,
    },
];
const run = async () => {
    const hashed = await (0, password_1.hashPassword)(defaultPassword);
    for (const user of seedUsers) {
        await prisma.usuario.upsert({
            where: { correo: user.correo },
            update: {
                nombre: user.nombre,
                apellido: user.apellido,
                numero_documento: user.numero_documento,
                telefono: user.telefono,
                contrasena: hashed,
                tipo_usuario: user.tipo_usuario,
                estado: true,
            },
            create: {
                nombre: user.nombre,
                apellido: user.apellido,
                numero_documento: user.numero_documento,
                correo: user.correo,
                telefono: user.telefono,
                contrasena: hashed,
                tipo_usuario: user.tipo_usuario,
                estado: true,
            },
        });
    }
};
run()
    .then(async () => {
    await prisma.$disconnect();
    console.log("Seeds completados");
})
    .catch(async (error) => {
    console.error("Error al ejecutar seeds", error);
    await prisma.$disconnect();
    process.exit(1);
});
