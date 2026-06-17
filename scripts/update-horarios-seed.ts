import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Actualizando horarios de disponibilidad de escenarios...\n");

  const updates = [
    {
      id: 1,
      nombre: "Laboratorio",
      horario: {
        lunes: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }],
        martes: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }],
        miercoles: [{ inicio: "08:00", fin: "12:00" }],
        jueves: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "18:00" }],
        viernes: [{ inicio: "08:00", fin: "12:00" }, { inicio: "14:00", fin: "17:00" }],
      },
    },
    {
      id: 2,
      nombre: "Cancha",
      horario: {
        lunes: [{ inicio: "06:00", fin: "18:00" }],
        martes: [{ inicio: "06:00", fin: "18:00" }],
        miercoles: [{ inicio: "06:00", fin: "18:00" }],
        jueves: [{ inicio: "06:00", fin: "18:00" }],
        viernes: [{ inicio: "06:00", fin: "18:00" }],
        sabado: [{ inicio: "08:00", fin: "14:00" }],
      },
    },
    {
      id: 3,
      nombre: "Gimnasio",
      horario: {
        lunes: [{ inicio: "06:00", fin: "21:00" }],
        martes: [{ inicio: "06:00", fin: "21:00" }],
        miercoles: [{ inicio: "06:00", fin: "21:00" }],
        jueves: [{ inicio: "06:00", fin: "21:00" }],
        viernes: [{ inicio: "06:00", fin: "21:00" }],
        sabado: [{ inicio: "08:00", fin: "16:00" }],
        domingo: [{ inicio: "08:00", fin: "12:00" }],
      },
    },
    {
      id: 4,
      nombre: "Cancha de prueba",
      horario: {
        martes: [{ inicio: "14:00", fin: "18:00" }],
        jueves: [{ inicio: "14:00", fin: "18:00" }],
        sabado: [{ inicio: "09:00", fin: "13:00" }],
      },
    },
  ];

  for (const update of updates) {
    const escenario = await prisma.escenario.findUnique({ where: { id: update.id } });
    if (!escenario) {
      console.log(`  [SKIP] Escenario #${update.id} "${update.nombre}" no existe`);
      continue;
    }

    await prisma.escenario.update({
      where: { id: update.id },
      data: { horario_disponibilidad: update.horario as any },
    });

    console.log(`  [OK] ${update.nombre} (ID ${update.id})`);
    for (const [dia, slots] of Object.entries(update.horario)) {
      console.log(`       ${dia}: ${slots.map((s) => `${s.inicio}-${s.fin}`).join(", ")}`);
    }
  }

  console.log("\nHorarios actualizados exitosamente.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
