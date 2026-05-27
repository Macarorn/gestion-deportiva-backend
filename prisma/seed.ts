import { PrismaClient, TipoUsuario } from "@prisma/client";
import "dotenv/config";
import { hashPassword } from "../src/utils/password";

const prisma = new PrismaClient();

const defaultPassword = "Password123!";

const seedUsers = [
  {
    nombre: "Carlos",
    apellido: "Instructor",
    numero_documento: "123456789",
    correo: "instructor@demo.com",
    telefono: "3001234567",
    tipo_usuario: TipoUsuario.Instructor,
  },
  {
    nombre: "María",
    apellido: "Instructor2",
    numero_documento: "123456790",
    correo: "instructor2@demo.com",
    telefono: "3001234568",
    tipo_usuario: TipoUsuario.Instructor,
  },
  {
    nombre: "Pedro",
    apellido: "Externo",
    numero_documento: "987654322",
    correo: "externo@demo.com",
    telefono: "3007654322",
    tipo_usuario: TipoUsuario.Externo,
  },
  {
    nombre: "Laura",
    apellido: "Externa",
    numero_documento: "987654323",
    correo: "externa@demo.com",
    telefono: "3007654323",
    tipo_usuario: TipoUsuario.Externo,
  },
  {
    nombre: "Ana",
    apellido: "Administradora",
    numero_documento: "987654321",
    correo: "admin@demo.com",
    telefono: "3007654321",
    tipo_usuario: TipoUsuario.Administrador,
  },
  {
    nombre: "Luis",
    apellido: "Almacenista",
    numero_documento: "456123789",
    correo: "almacen@demo.com",
    telefono: "3009876543",
    tipo_usuario: TipoUsuario.Almacenista,
  },
  {
    nombre: "Juan",
    apellido: "Aprendiz",
    numero_documento: "111111111",
    correo: "aprendiz1@demo.com",
    telefono: "3001111111",
    tipo_usuario: TipoUsuario.Aprendiz,
    ficha: "123456",
  },
  {
    nombre: "María",
    apellido: "Aprendiz",
    numero_documento: "222222222",
    correo: "aprendiz2@demo.com",
    telefono: "3002222222",
    tipo_usuario: TipoUsuario.Aprendiz,
    ficha: "123457",
  },
  {
    nombre: "Carlos",
    apellido: "Aprendiz",
    numero_documento: "333333333",
    correo: "aprendiz3@demo.com",
    telefono: "3003333333",
    tipo_usuario: TipoUsuario.Aprendiz,
    ficha: "123458",
  },
];

const run = async () => {
  const hashed = await hashPassword(defaultPassword);

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

  // Limpiar datos previos (categorías, subcategorías, materiales, elementos, préstamos)
  // Mantenemos usuarios
  console.log("Limpiando datos previos...");
  await prisma.novedad.deleteMany();
  await prisma.prestamoDetalle.deleteMany();
  await prisma.prestamo.deleteMany();
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
      cantidad_disponible: 10,
      cantidad_prestada: 0,
      requiere_serial: true,
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
      cantidad_disponible: 6,
      cantidad_prestada: 0,
      requiere_serial: false,
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
      cantidad_disponible: 8,
      cantidad_prestada: 0,
      requiere_serial: false,
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
      cantidad_disponible: 20,
      cantidad_prestada: 0,
      requiere_serial: true,
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
      cantidad_disponible: 20,
      cantidad_prestada: 0,
      requiere_serial: false,
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
      cantidad_disponible: 15,
      cantidad_prestada: 0,
      requiere_serial: false,
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
      cantidad_disponible: 30,
      cantidad_prestada: 0,
      requiere_serial: false,
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
      cantidad_disponible: 4,
      cantidad_prestada: 0,
      requiere_serial: true,
      estado: "activo",
      fotografia: "red_deportiva.jpg",
      observaciones: null,
    },
  });

  console.log("Creando elementos (seriales opcionales)...");

  // Elementos para Balón de fútbol (requiere_serial: true, cantidad_total: 10)
  for (let i = 1; i <= 10; i++) {
    await prisma.elemento.create({
      data: {
        materialId: material1.id,
        nombre_serial: `Balón Fútbol #${i.toString().padStart(3, '0')}`,
        estado: "disponible",
      },
    });
  }

  // Elementos para Peto rojo (requiere_serial: true, cantidad_total: 20)
  for (let i = 1; i <= 20; i++) {
    await prisma.elemento.create({
      data: {
        materialId: material4.id,
        nombre_serial: `Peto Rojo #${i.toString().padStart(3, '0')}`,
        estado: "disponible",
      },
    });
  }

  // Elementos para Red deportiva (requiere_serial: true, cantidad_total: 4)
  for (let i = 1; i <= 4; i++) {
    await prisma.elemento.create({
      data: {
        materialId: material8.id,
        nombre_serial: `Red Deportiva #${i.toString().padStart(3, '0')}`,
        estado: "disponible",
      },
    });
  }

  console.log("Creando préstamos de prueba...");
  
  // Obtener usuarios
  const instructor = await prisma.usuario.findUnique({
    where: { correo: "instructor@demo.com" },
  });
  const instructor2 = await prisma.usuario.findUnique({
    where: { correo: "instructor2@demo.com" },
  });
  const externo = await prisma.usuario.findUnique({
    where: { correo: "externo@demo.com" },
  });
  const externa = await prisma.usuario.findUnique({
    where: { correo: "externa@demo.com" },
  });
  const admin = await prisma.usuario.findUnique({
    where: { correo: "admin@demo.com" },
  });
  const almacenista = await prisma.usuario.findUnique({
    where: { correo: "almacen@demo.com" },
  });

  if (!instructor || !instructor2 || !externo || !externa || !admin || !almacenista) {
    throw new Error("No se encontraron usuarios para crear préstamos");
  }

  // Préstamo 1: Pendiente - solicitado por instructor para sí mismo
  const prestamo1 = await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-001",
      usuarioId: instructor.id,
      usuarioSolicitanteId: instructor.id,
      estado: "pendiente",
      fecha_prestamo: new Date(),
      fecha_devolucion_esperada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      observaciones: "Préstamo para entrenamiento de fútbol",
      detalles: {
        create: [
          {
            materialId: material1.id,
            cantidad_solicitada: 3,
            cantidad_entregada: 0,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
        ],
      },
    },
  });

  // Préstamo 2: Activo - solicitado por externo para sí mismo
  const prestamo2 = await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-002",
      usuarioId: externo.id,
      usuarioSolicitanteId: externo.id,
      estado: "activo",
      fecha_prestamo: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      fecha_devolucion_esperada: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      observaciones: "Préstamo activo para competencia",
      detalles: {
        create: [
          {
            materialId: material2.id,
            cantidad_solicitada: 2,
            cantidad_entregada: 2,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
          {
            materialId: material7.id,
            cantidad_solicitada: 5,
            cantidad_entregada: 5,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
        ],
      },
    },
  });

  // Actualizar cantidades prestadas de materiales
  await prisma.material.update({
    where: { id: material2.id },
    data: { cantidad_prestada: 2, cantidad_disponible: 4 },
  });
  await prisma.material.update({
    where: { id: material7.id },
    data: { cantidad_prestada: 5, cantidad_disponible: 25 },
  });

  // Préstamo 3: Devuelto - solicitado por instructor2 para sí mismo
  const prestamo3 = await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-003",
      usuarioId: instructor2.id,
      usuarioSolicitanteId: instructor2.id,
      estado: "devuelto",
      fecha_prestamo: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      fecha_devolucion_esperada: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      fecha_devolucion_real: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      observaciones: "Préstamo devuelto sin novedades",
      detalles: {
        create: [
          {
            materialId: material3.id,
            cantidad_solicitada: 4,
            cantidad_entregada: 4,
            cantidad_devuelta: 4,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
        ],
      },
    },
  });

  // Préstamo 4: Vencido - solicitado por externa para sí misma
  const prestamo4 = await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-004",
      usuarioId: externa.id,
      usuarioSolicitanteId: externa.id,
      estado: "vencido",
      fecha_prestamo: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      fecha_devolucion_esperada: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      observaciones: "Préstamo vencido - requiere atención",
      detalles: {
        create: [
          {
            materialId: material4.id,
            cantidad_solicitada: 5,
            cantidad_entregada: 5,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
        ],
      },
    },
  });

  // Actualizar cantidades prestadas de material4
  await prisma.material.update({
    where: { id: material4.id },
    data: { cantidad_prestada: 5, cantidad_disponible: 15 },
  });

  // Préstamo 5: Cancelado - solicitado por instructor para sí mismo
  const prestamo5 = await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-005",
      usuarioId: instructor.id,
      usuarioSolicitanteId: instructor.id,
      estado: "cancelado",
      fecha_prestamo: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      fecha_devolucion_esperada: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      observaciones: "Préstamo cancelado por falta de disponibilidad",
      detalles: {
        create: [
          {
            materialId: material5.id,
            cantidad_solicitada: 10,
            cantidad_entregada: 0,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
        ],
      },
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
