import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Revisando todos los préstamos...\n');

  const prestamos = await prisma.prestamo.findMany({
    include: {
      detalles: {
        include: {
          material: true,
          elemento: true,
        },
      },
      novedades: true,
    },
  });

  console.log(`Total de préstamos: ${prestamos.length}\n`);

  const prestamosConProblemas: any[] = [];

  for (const prestamo of prestamos) {
    const problemas: string[] = [];

    // Verificar préstamos devueltos con daño o pérdida sin novedades
    if (prestamo.estado === 'devuelto') {
      for (const detalle of prestamo.detalles) {
        if (detalle.cantidad_danada > 0 || detalle.cantidad_faltante > 0) {
          const novedadExiste = prestamo.novedades.some(n =>
            n.elementoId === detalle.elementoId ||
            (!n.elementoId && !detalle.elementoId)
          );
          if (!novedadExiste) {
            problemas.push(`Detalle ${detalle.id} (${detalle.material.nombre}) tiene daño/pérdida sin novedad`);
          }
        }
      }
    }

    // Verificar discrepancias en cantidades para materiales sin serial
    for (const detalle of prestamo.detalles) {
      if (!detalle.material.requiere_serial) {
        const totalDevuelto = detalle.cantidad_devuelta + detalle.cantidad_danada + detalle.cantidad_faltante;
        if (totalDevuelto > detalle.cantidad_entregada) {
          problemas.push(`Detalle ${detalle.id} (${detalle.material.nombre}): total devuelto (${totalDevuelto}) > entregado (${detalle.cantidad_entregada})`);
        }
      }
    }

    if (problemas.length > 0) {
      prestamosConProblemas.push({
        numero_prestamo: prestamo.numero_prestamo,
        estado: prestamo.estado,
        problemas,
      });
    }
  }

  if (prestamosConProblemas.length === 0) {
    console.log('✓ Todos los préstamos están correctos');
  } else {
    console.log(`Préstamos con problemas (${prestamosConProblemas.length}):\n`);
    prestamosConProblemas.forEach(p => {
      console.log(`- ${p.numero_prestamo} (${p.estado}):`);
      p.problemas.forEach((prob: string) => console.log(`  • ${prob}`));
      console.log();
    });
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
