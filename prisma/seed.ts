import { PrismaClient } from "@prisma/client";
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
    tipo_usuario: "Instructor" as const,
    ficha: null as string | null,
  },
  {
    nombre: "María",
    apellido: "Instructor2",
    numero_documento: "123456790",
    correo: "instructor2@demo.com",
    telefono: "3001234568",
    tipo_usuario: "Instructor" as const,
    ficha: null as string | null,
  },
  {
    nombre: "Pedro",
    apellido: "Externo",
    numero_documento: "987654322",
    correo: "externo@demo.com",
    telefono: "3007654322",
    tipo_usuario: "Externo" as const,
    ficha: null as string | null,
  },
  {
    nombre: "Laura",
    apellido: "Externa",
    numero_documento: "987654323",
    correo: "externa@demo.com",
    telefono: "3007654323",
    tipo_usuario: "Externo" as const,
    ficha: null as string | null,
  },
  {
    nombre: "Ana",
    apellido: "Administradora",
    numero_documento: "987654321",
    correo: "admin@demo.com",
    telefono: "3007654321",
    tipo_usuario: "Administrador" as const,
    ficha: null as string | null,
  },
  {
    nombre: "Luis",
    apellido: "Almacenista",
    numero_documento: "456123789",
    correo: "almacen@demo.com",
    telefono: "3009876543",
    tipo_usuario: "Almacenista" as const,
    ficha: null as string | null,
  },
  {
    nombre: "Juan",
    apellido: "Aprendiz",
    numero_documento: "111111111",
    correo: "aprendiz1@demo.com",
    telefono: "3001111111",
    tipo_usuario: "Aprendiz" as const,
    ficha: "123456",
  },
  {
    nombre: "María",
    apellido: "Aprendiz",
    numero_documento: "222222222",
    correo: "aprendiz2@demo.com",
    telefono: "3002222222",
    tipo_usuario: "Aprendiz" as const,
    ficha: "123457",
  },
  {
    nombre: "Carlos",
    apellido: "Aprendiz",
    numero_documento: "333333333",
    correo: "aprendiz3@demo.com",
    telefono: "3003333333",
    tipo_usuario: "Aprendiz" as const,
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
        ficha: user.ficha,
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
        ficha: user.ficha,
        estado: true,
      },
    });
  }

  // Limpiar datos previos (categorías, subcategorías, materiales, elementos, préstamos, escenarios)
  // Mantenemos usuarios
  console.log("Limpiando datos previos...");
  await prisma.novedad.deleteMany();
  await prisma.prestamodetalle.deleteMany();
  await prisma.prestamo.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.elemento.deleteMany();
  await prisma.material.deleteMany();
  await prisma.subcategoria.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.escenario.deleteMany();

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
  const sub1 = await prisma.subcategoria.create({
    data: {
      nombre: "Fútbol",
      descripcion: "Balones para fútbol",
      categoriaId: categoria1.id,
      estado: true,
    },
  });

  const sub2 = await prisma.subcategoria.create({
    data: {
      nombre: "Baloncesto",
      descripcion: "Balones para baloncesto",
      categoriaId: categoria1.id,
      estado: true,
    },
  });

  const sub3 = await prisma.subcategoria.create({
    data: {
      nombre: "Voleibol",
      descripcion: "Balones para voleibol",
      categoriaId: categoria1.id,
      estado: true,
    },
  });

  const sub4 = await prisma.subcategoria.create({
    data: {
      nombre: "Entrenamiento",
      descripcion: "Petos de entrenamiento",
      categoriaId: categoria2.id,
      estado: true,
    },
  });

  const sub5 = await prisma.subcategoria.create({
    data: {
      nombre: "Competencia",
      descripcion: "Petos de competencia",
      categoriaId: categoria2.id,
      estado: true,
    },
  });

  const sub6 = await prisma.subcategoria.create({
    data: {
      nombre: "Señalización",
      descripcion: "Conos para señalización",
      categoriaId: categoria3.id,
      estado: true,
    },
  });

  const sub7 = await prisma.subcategoria.create({
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

  // Obtener seriales de balón de fútbol (3 para PRE-2026-001)
  const serialesBalon = await prisma.elemento.findMany({
    where: { materialId: material1.id },
    take: 3,
    orderBy: { id: "asc" },
  });

  // Fechas basadas en 20/06/2026 - todos same-day con horas
  // Préstamo 1: Pendiente - instructor solicita para sí mismo
  await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-001",
      usuarioId: instructor.id,
      usuarioSolicitanteId: instructor.id,
      estado: "pendiente",
      fecha_prestamo: new Date("2026-06-22T08:00:00"),
      fecha_devolucion_esperada: new Date("2026-06-22T17:00:00"),
      hora_entrega: new Date("2026-06-22T08:00:00"),
      hora_devolucion: new Date("2026-06-22T17:00:00"),
      observaciones: "Préstamo para entrenamiento de fútbol",
      prestamodetalle: {
        create: [
          {
            materialId: material1.id,
            elementoId: serialesBalon[0]?.id,
            cantidad_solicitada: 1,
            cantidad_entregada: 0,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
          {
            materialId: material1.id,
            elementoId: serialesBalon[1]?.id,
            cantidad_solicitada: 1,
            cantidad_entregada: 0,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
          {
            materialId: material1.id,
            elementoId: serialesBalon[2]?.id,
            cantidad_solicitada: 1,
            cantidad_entregada: 0,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
        ],
      },
    },
  });

  // Préstamo 2: Activo - instructor solicita para sí mismo
  await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-002",
      usuarioId: instructor2.id,
      usuarioSolicitanteId: instructor2.id,
      estado: "activo",
      fecha_prestamo: new Date("2026-06-20T09:00:00"),
      fecha_devolucion_esperada: new Date("2026-06-20T17:00:00"),
      hora_entrega: new Date("2026-06-20T09:00:00"),
      hora_devolucion: new Date("2026-06-20T17:00:00"),
      observaciones: "Préstamo activo para demostración",
      prestamodetalle: {
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

  // Préstamo 3: Devuelto - instructor2 solicita para sí mismo
  await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-003",
      usuarioId: instructor2.id,
      usuarioSolicitanteId: instructor2.id,
      estado: "devuelto",
      fecha_prestamo: new Date("2026-06-15T08:00:00"),
      fecha_devolucion_esperada: new Date("2026-06-15T17:00:00"),
      fecha_devolucion_real: new Date("2026-06-15T15:00:00"),
      hora_entrega: new Date("2026-06-15T08:00:00"),
      hora_devolucion: new Date("2026-06-15T15:00:00"),
      observaciones: "Préstamo devuelto sin novedades",
      prestamodetalle: {
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

  // Préstamo 4: Vencido - instructor solicita, admin aprueba
  await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-004",
      usuarioId: instructor.id,
      usuarioSolicitanteId: admin.id,
      estado: "vencido",
      fecha_prestamo: new Date("2026-06-10T10:00:00"),
      fecha_devolucion_esperada: new Date("2026-06-10T16:00:00"),
      hora_entrega: new Date("2026-06-10T10:00:00"),
      hora_devolucion: new Date("2026-06-10T16:00:00"),
      observaciones: "Préstamo que no fue devuelto a tiempo",
      prestamodetalle: {
        create: [
          {
            materialId: material5.id,
            cantidad_solicitada: 10,
            cantidad_entregada: 10,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
        ],
      },
    },
  });

  await prisma.material.update({
    where: { id: material5.id },
    data: { cantidad_prestada: 10, cantidad_disponible: 10 },
  });

  // Préstamo 5: Cancelado - instructor solicita, admin aprueba
  await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-005",
      usuarioId: instructor.id,
      usuarioSolicitanteId: admin.id,
      estado: "cancelado",
      fecha_prestamo: new Date("2026-06-21T08:00:00"),
      fecha_devolucion_esperada: new Date("2026-06-21T17:00:00"),
      hora_entrega: new Date("2026-06-21T08:00:00"),
      hora_devolucion: new Date("2026-06-21T17:00:00"),
      observaciones: "Préstamo cancelado por falta de disponibilidad",
      prestamodetalle: {
        create: [
          {
            materialId: material8.id,
            cantidad_solicitada: 2,
            cantidad_entregada: 0,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
        ],
      },
    },
  });

  // Préstamo 6: Activo - almacenista crea préstamo para externo
  await prisma.prestamo.create({
    data: {
      numero_prestamo: "PRE-2026-006",
      usuarioId: externo.id,
      usuarioSolicitanteId: almacenista.id,
      estado: "activo",
      fecha_prestamo: new Date("2026-06-20T10:00:00"),
      fecha_devolucion_esperada: new Date("2026-06-20T16:00:00"),
      hora_entrega: new Date("2026-06-20T10:00:00"),
      hora_devolucion: new Date("2026-06-20T16:00:00"),
      observaciones: "Préstamo gestionado por almacenista para externo",
      prestamodetalle: {
        create: [
          {
            materialId: material4.id,
            cantidad_solicitada: 3,
            cantidad_entregada: 3,
            cantidad_devuelta: 0,
            cantidad_danada: 0,
            cantidad_faltante: 0,
          },
        ],
      },
    },
  });

  await prisma.material.update({
    where: { id: material4.id },
    data: { cantidad_prestada: 3, cantidad_disponible: 17 },
  });

  console.log("Creando escenarios de prueba...");
  await prisma.escenario.create({
    data: {
      nombre: "Laboratorio",
      descripcion: "Laboratorio de informática y tecnología",
      ubicacion: "Edificio A - Piso 2",
      capacidad_maxima: 30,
      estado: true,
      horario_disponibilidad: {
        lunes: [{ inicio: "08:00", fin: "18:00" }],
        martes: [{ inicio: "08:00", fin: "18:00" }],
        miercoles: [{ inicio: "08:00", fin: "18:00" }],
        jueves: [{ inicio: "08:00", fin: "18:00" }],
        viernes: [{ inicio: "08:00", fin: "18:00" }],
      },
      observaciones: "Equipado con computadoras y proyector",
    },
  });

  await prisma.escenario.create({
    data: {
      nombre: "Cancha",
      descripcion: "Cancha de fútbol profesional",
      ubicacion: "Zona deportiva - Campo 1",
      capacidad_maxima: 50,
      estado: true,
      horario_disponibilidad: {
        lunes: [{ inicio: "06:00", fin: "22:00" }],
        martes: [{ inicio: "06:00", fin: "22:00" }],
        miercoles: [{ inicio: "06:00", fin: "22:00" }],
        jueves: [{ inicio: "06:00", fin: "22:00" }],
        viernes: [{ inicio: "06:00", fin: "22:00" }],
        sabado: [{ inicio: "06:00", fin: "22:00" }],
      },
      observaciones: "Iluminación nocturna disponible",
    },
  });

  await prisma.escenario.create({
    data: {
      nombre: "Gimnasio",
      descripcion: "Gimnasio equipado para entrenamiento físico",
      ubicacion: "Edificio B - Piso 1",
      capacidad_maxima: 40,
      estado: true,
      horario_disponibilidad: {
        lunes: [{ inicio: "06:00", fin: "23:00" }],
        martes: [{ inicio: "06:00", fin: "23:00" }],
        miercoles: [{ inicio: "06:00", fin: "23:00" }],
        jueves: [{ inicio: "06:00", fin: "23:00" }],
        viernes: [{ inicio: "06:00", fin: "23:00" }],
        sabado: [{ inicio: "06:00", fin: "23:00" }],
        domingo: [{ inicio: "06:00", fin: "23:00" }],
      },
      observaciones: "Equipos de cardio y pesas disponibles",
    },
  });

  console.log("Database seeded successfully!");
};

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
