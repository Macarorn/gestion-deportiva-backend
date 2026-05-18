import { PrismaClient, TipoUsuario } from "@prisma/client";
import "dotenv/config";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const defaultPassword = "Password123!";

const seedUsers = [
  {
    nombre: "Carlos Instructor",
    correo: "instructor@demo.com",
    tipo_usuario: TipoUsuario.Instructor,
  },
  {
    nombre: "Ana Administradora",
    correo: "admin@demo.com",
    tipo_usuario: TipoUsuario.Administrador,
  },
  {
    nombre: "Luis Almacenista",
    correo: "almacen@demo.com",
    tipo_usuario: TipoUsuario.Almacenista,
  },
];

const run = async () => {
  const hashed = await hashPassword(defaultPassword);

  for (const user of seedUsers) {
    await prisma.usuario.upsert({
      where: { correo: user.correo },
      update: {
        nombre: user.nombre,
        contrasena: hashed,
        tipo_usuario: user.tipo_usuario,
        estado: true,
      },
      create: {
        nombre: user.nombre,
        correo: user.correo,
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
