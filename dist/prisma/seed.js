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
    // Seed usuarios (mantener existentes)
    console.log("Creando usuarios...");
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
    // Limpiar datos previos (categorías, subcategorías, materiales, elementos)
    // Mantenemos usuarios
    console.log("Limpiando datos previos...");
    await prisma.elemento.deleteMany();
    await prisma.material.deleteMany();
    await prisma.subCategoria.deleteMany();
    await prisma.categoria.deleteMany();
    console.log("Creando categorías...");
    const categoria1 = await prisma.categoria.create({
        data: {
            nombre: "Balones",
            descripcion: "Balones deportivos para diversos deportes",
            estado: true,
        },
    });
    const categoria2 = await prisma.categoria.create({
        data: {
            nombre: "Petos",
            descripcion: "Petos de entrenamiento y competencia",
            estado: true,
        },
    });
    const categoria3 = await prisma.categoria.create({
        data: {
            nombre: "Conos",
            descripcion: "Conos de señalización y entrenamiento",
            estado: true,
        },
    });
    const categoria4 = await prisma.categoria.create({
        data: {
            nombre: "Implementos varios",
            descripcion: "Otros implementos deportivos",
            estado: true,
        },
    });
    console.log("Creando subcategorías...");
    const sub1 = await prisma.subCategoria.create({
        data: {
            nombre: "Fútbol",
            descripcion: "Balones para fútbol",
            categoriaId: categoria1.id,
            estado: true,
        },
    });
    const sub2 = await prisma.subCategoria.create({
        data: {
            nombre: "Baloncesto",
            descripcion: "Balones para baloncesto",
            categoriaId: categoria1.id,
            estado: true,
        },
    });
    const sub3 = await prisma.subCategoria.create({
        data: {
            nombre: "Voleibol",
            descripcion: "Balones para voleibol",
            categoriaId: categoria1.id,
            estado: true,
        },
    });
    const sub4 = await prisma.subCategoria.create({
        data: {
            nombre: "Entrenamiento",
            descripcion: "Petos de entrenamiento",
            categoriaId: categoria2.id,
            estado: true,
        },
    });
    const sub5 = await prisma.subCategoria.create({
        data: {
            nombre: "Competencia",
            descripcion: "Petos de competencia",
            categoriaId: categoria2.id,
            estado: true,
        },
    });
    const sub6 = await prisma.subCategoria.create({
        data: {
            nombre: "Señalización",
            descripcion: "Conos para señalización",
            categoriaId: categoria3.id,
            estado: true,
        },
    });
    const sub7 = await prisma.subCategoria.create({
        data: {
            nombre: "General",
            descripcion: "Implementos varios",
            categoriaId: categoria4.id,
            estado: true,
        },
    });
    console.log("Creando materiales...");
    const material1 = await prisma.material.create({
        data: {
            nombre: "Balón de fútbol",
            descripcion: "Balón profesional para fútbol",
            subCategoriaId: sub1.id,
            cantidad_total: 10,
            cantidad_disponible: 8,
            cantidad_prestada: 2,
            estado: "activo",
            fotografia: "balon_futbol.jpg",
            observaciones: "Stock actualizado",
        },
    });
    const material2 = await prisma.material.create({
        data: {
            nombre: "Balón de baloncesto",
            descripcion: "Balón oficial de baloncesto",
            subCategoriaId: sub2.id,
            cantidad_total: 6,
            cantidad_disponible: 4,
            cantidad_prestada: 2,
            estado: "activo",
            fotografia: "balon_basket.jpg",
            observaciones: null,
        },
    });
    const material3 = await prisma.material.create({
        data: {
            nombre: "Balón de voleibol",
            descripcion: "Balón oficial de voleibol",
            subCategoriaId: sub3.id,
            cantidad_total: 8,
            cantidad_disponible: 7,
            cantidad_prestada: 1,
            estado: "activo",
            fotografia: "balon_voleibol.jpg",
            observaciones: null,
        },
    });
    const material4 = await prisma.material.create({
        data: {
            nombre: "Peto rojo",
            descripcion: "Peto de entrenamiento color rojo",
            subCategoriaId: sub4.id,
            cantidad_total: 20,
            cantidad_disponible: 15,
            cantidad_prestada: 5,
            estado: "activo",
            fotografia: "peto_rojo.jpg",
            observaciones: null,
        },
    });
    const material5 = await prisma.material.create({
        data: {
            nombre: "Peto azul",
            descripcion: "Peto de entrenamiento color azul",
            subCategoriaId: sub4.id,
            cantidad_total: 20,
            cantidad_disponible: 18,
            cantidad_prestada: 2,
            estado: "activo",
            fotografia: "peto_azul.jpg",
            observaciones: null,
        },
    });
    const material6 = await prisma.material.create({
        data: {
            nombre: "Peto amarillo",
            descripcion: "Peto de competencia color amarillo",
            subCategoriaId: sub5.id,
            cantidad_total: 15,
            cantidad_disponible: 14,
            cantidad_prestada: 1,
            estado: "activo",
            fotografia: "peto_amarillo.jpg",
            observaciones: null,
        },
    });
    const material7 = await prisma.material.create({
        data: {
            nombre: "Cono naranja",
            descripcion: "Cono de señalización estándar",
            subCategoriaId: sub6.id,
            cantidad_total: 30,
            cantidad_disponible: 25,
            cantidad_prestada: 5,
            estado: "activo",
            fotografia: "cono_naranja.jpg",
            observaciones: "Revisar stock regularmente",
        },
    });
    const material8 = await prisma.material.create({
        data: {
            nombre: "Red deportiva",
            descripcion: "Red para cancha de voleibol/badminton",
            subCategoriaId: sub7.id,
            cantidad_total: 4,
            cantidad_disponible: 3,
            cantidad_prestada: 1,
            estado: "activo",
            fotografia: "red_deportiva.jpg",
            observaciones: null,
        },
    });
    console.log("Creando elementos (seriales opcionales)...");
    // Elementos para Balón de fútbol (ejemplo de serialización)
    await prisma.elemento.create({
        data: {
            materialId: material1.id,
            nombre_serial: "Balón Fútbol #001",
            estado: "disponible",
        },
    });
    await prisma.elemento.create({
        data: {
            materialId: material1.id,
            nombre_serial: "Balón Fútbol #002",
            estado: "prestado",
        },
    });
    // Elementos para Peto rojo
    await prisma.elemento.create({
        data: {
            materialId: material4.id,
            nombre_serial: "Peto Rojo #001",
            estado: "prestado",
        },
    });
    console.log("✅ Seed data creado exitosamente");
};
run()
    .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Seeds completados");
})
    .catch(async (error) => {
    console.error("❌ Error al ejecutar seeds", error);
    await prisma.$disconnect();
    process.exit(1);
});
