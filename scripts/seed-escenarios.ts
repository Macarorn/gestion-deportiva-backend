import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando escenarios existentes...");
  await prisma.escenario.deleteMany();

  console.log("Insertando escenarios de prueba...\n");

  const escenarios = [
    {
      nombre: "Cancha de Fútbol",
      descripcion: "Cancha sintética para fútbol 5vs5",
      ubicacion: "Bloque A - Extérieur",
      capacidad_maxima: 20,
      estado: true,
      horario_disponibilidad: {
        lunes: [{ inicio: "06:00", fin: "18:00" }],
        martes: [{ inicio: "06:00", fin: "18:00" }],
        miercoles: [{ inicio: "06:00", fin: "18:00" }],
        jueves: [{ inicio: "06:00", fin: "18:00" }],
        viernes: [{ inicio: "06:00", fin: "18:00" }],
        sabado: [{ inicio: "08:00", fin: "14:00" }],
      },
      observaciones: "Cancha con iluminación artificial disponible hasta las 20:00",
    },
    {
      nombre: "Gimnasio",
      descripcion: "Sala de musculación y cardio",
      ubicacion: "Bloque B - Piso 1",
      capacidad_maxima: 30,
      estado: true,
      horario_disponibilidad: {
        lunes: [{ inicio: "06:00", fin: "21:00" }],
        martes: [{ inicio: "06:00", fin: "21:00" }],
        miercoles: [{ inicio: "06:00", fin: "21:00" }],
        jueves: [{ inicio: "06:00", fin: "21:00" }],
        viernes: [{ inicio: "06:00", fin: "21:00" }],
        sabado: [{ inicio: "08:00", fin: "16:00" }],
        domingo: [{ inicio: "08:00", fin: "12:00" }],
      },
      observaciones: null,
    },
    {
      nombre: "Salón de Baile",
      descripcion: "Salón con espejos y sistema de sonido",
      ubicacion: "Bloque C - Piso 2",
      capacidad_maxima: 25,
      estado: true,
      horario_disponibilidad: {
        lunes: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "20:00" }],
        martes: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "20:00" }],
        miercoles: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "20:00" }],
        jueves: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "20:00" }],
        viernes: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }],
      },
      observaciones: "Disponibilidad especial para eventos los sábados con reserva previa",
    },
    {
      nombre: "Laboratorio de Sistemas",
      descripcion: "Sala de computadores para prácticas",
      ubicacion: "Bloque D - Piso 3",
      capacidad_maxima: 40,
      estado: true,
      horario_disponibilidad: {
        lunes: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }],
        martes: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }],
        miercoles: [{ inicio: "08:00", fin: "12:00" }],
        jueves: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }],
        viernes: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "17:00" }],
      },
      observaciones: "Equipo disponible solo para uso académico",
    },
    {
      nombre: "Cancha de Baloncesto",
      descripcion: "Cancha techada para baloncesto y microfútbol",
      ubicacion: "Bloque A - Interior",
      capacidad_maxima: 15,
      estado: false,
      horario_disponibilidad: {
        martes: [{ inicio: "14:00", fin: "18:00" }],
        jueves: [{ inicio: "14:00", fin: "18:00" }],
        sabado: [{ inicio: "09:00", fin: "13:00" }],
      },
      observaciones: "Temporalmente cerrado por mantenimiento del piso",
    },
  ];

  for (const esc of escenarios) {
    const created = await prisma.escenario.create({ data: esc as any });
    const horarios = Object.entries(esc.horario_disponibilidad)
      .map(([dia, slots]) => `${dia}: ${slots.map((s) => `${s.inicio}-${s.fin}`).join(", ")}`)
      .join(" | ");
    console.log(`  [OK] ${created.nombre} (ID ${created.id}) - ${created.estado ? "Activo" : "Inactivo"}`);
    console.log(`       ${horarios}\n`);
  }

  console.log("Escenarios insertados exitosamente.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
