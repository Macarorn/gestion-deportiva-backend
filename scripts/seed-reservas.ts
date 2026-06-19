import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando reservas existentes...");
  await prisma.reserva.deleteMany();

  console.log("Insertando reservas de prueba...\n");

  const escenarios = await prisma.escenario.findMany({ where: { estado: true } });
  const instructores = await prisma.usuario.findMany({
    where: { tipo_usuario: "Instructor", estado: true },
  });

  if (escenarios.length === 0) {
    console.log("No hay escenarios activos. Crea escenarios primero.");
    return;
  }
  if (instructores.length === 0) {
    console.log("No hay instructores activos. Crea instructores primero.");
    return;
  }

  const hoy = new Date();
  const formatoFecha = (d: Date) => d.toISOString().split("T")[0];

  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);

  const pasadoManana = new Date(hoy);
  pasadoManana.setDate(hoy.getDate() + 2);

  const enTresDias = new Date(hoy);
  enTresDias.setDate(hoy.getDate() + 3);

  const reservas = [
    {
      escenarioId: escenarios[0].id,
      usuarioId: instructores[0].id,
      fecha: formatoFecha(manana),
      hora_inicio: "08:00",
      hora_fin: "10:00",
      estado: "pendiente",
      observaciones: "Clase de fútbol con grupo 2024",
    },
    {
      escenarioId: escenarios[0].id,
      usuarioId: instructores[0].id,
      fecha: formatoFecha(manana),
      hora_inicio: "14:00",
      hora_fin: "16:00",
      estado: "pendiente",
      observaciones: "Entrenamiento equipo femenino",
    },
    {
      escenarioId: escenarios.length > 1 ? escenarios[1].id : escenarios[0].id,
      usuarioId: instructores.length > 1 ? instructores[1].id : instructores[0].id,
      fecha: formatoFecha(manana),
      hora_inicio: "10:00",
      hora_fin: "12:00",
      estado: "activa",
      observaciones: "Activación física grupal",
    },
    {
      escenarioId: escenarios.length > 1 ? escenarios[1].id : escenarios[0].id,
      usuarioId: instructores.length > 1 ? instructores[1].id : instructores[0].id,
      fecha: formatoFecha(pasadoManana),
      hora_inicio: "08:00",
      hora_fin: "11:00",
      estado: "finalizada",
      observaciones: "Torneado interno completado",
      observaciones_cierre: "Evento finalizado sin novedades. Todo el equipo entregado en buen estado.",
    },
    {
      escenarioId: escenarios.length > 2 ? escenarios[2].id : escenarios[0].id,
      usuarioId: instructores[0].id,
      fecha: formatoFecha(pasadoManana),
      hora_inicio: "14:00",
      hora_fin: "16:00",
      estado: "cancelada",
      observaciones: "Cancelado por lluvia",
    },
    {
      escenarioId: escenarios[0].id,
      usuarioId: instructores.length > 2 ? instructores[2].id : instructores[0].id,
      fecha: formatoFecha(enTresDias),
      hora_inicio: "09:00",
      hora_fin: "11:00",
      estado: "pendiente",
      observaciones: "Práctica de atletismo",
    },
  ];

  let num = 0;
  for (const res of reservas) {
    num++;
    const numero_reserva = `RES-${num.toString().padStart(4, "0")}`;
    const created = await prisma.reserva.create({
      data: {
        numero_reserva,
        ...res,
        fecha: (() => { const [y,m,d] = res.fecha.split("-").map(Number); return new Date(y, m-1, d); })(),
      },
      include: {
        escenario: { select: { nombre: true } },
        usuario: { select: { nombre: true, apellido: true } },
      },
    });

    const emoji =
      created.estado === "pendiente"
        ? "🟡"
        : created.estado === "activa"
          ? "🔵"
          : created.estado === "finalizada"
            ? "🟢"
            : "🔴";

    console.log(
      `  ${emoji} ${created.numero_reserva} | ${created.escenario.nombre} | ${created.usuario.nombre} ${created.usuario.apellido} | ${created.fecha.toISOString().split("T")[0]} ${created.hora_inicio}-${created.hora_fin} | ${created.estado}`
    );
  }

  console.log(`\n${reservas.length} reservas insertadas exitosamente.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
