import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Actualizando elementos devueltos que siguen en estado prestado...');

  // Buscar préstamos devueltos con elementos en estado prestado
  const prestamosDevueltos = await prisma.prestamo.findMany({
    where: {
      estado: 'devuelto',
    },
    include: {
      detalles: {
        include: {
          elemento: true,
        },
      },
    },
  });

  console.log(`Encontrados ${prestamosDevueltos.length} préstamos devueltos`);

  let actualizados = 0;
  for (const prestamo of prestamosDevueltos) {
    for (const detalle of prestamo.detalles) {
      if (detalle.elemento && detalle.elemento.estado === 'prestado') {
        // Verificar si este elemento tiene novedades de pérdida o daño
        const novedades = await prisma.novedad.findMany({
          where: {
            elementoId: detalle.elemento.id,
            prestamoId: prestamo.id,
          },
        });

        const tieneNovedad = novedades.length > 0;

        if (!tieneNovedad) {
          await prisma.elemento.update({
            where: { id: detalle.elemento.id },
            data: { estado: 'disponible' },
          });
          console.log(`Elemento ${detalle.elemento.nombre_serial} actualizado a disponible`);
          actualizados++;
        }
      }
    }
  }

  console.log(`Total de elementos actualizados: ${actualizados}`);

  // Recalcular cantidades de materiales
  const materiales = await prisma.material.findMany({
    where: {
      requiere_serial: true,
    },
    include: {
      elementos: true,
    },
  });

  console.log('Recalculando cantidades de materiales con serial...');

  for (const material of materiales) {
    const cantidad_total = material.elementos.length;
    const cantidad_disponible = material.elementos.filter((e) => e.estado === 'disponible').length;
    const cantidad_prestada = material.elementos.filter((e) => e.estado === 'prestado').length;
    const cantidad_danada = material.elementos.filter((e) => e.estado === 'dañado').length;
    const cantidad_mantenimiento = material.elementos.filter((e) => e.estado === 'mantenimiento').length;
    const cantidad_faltante = material.elementos.filter((e) => e.estado === 'faltante').length;

    await prisma.material.update({
      where: { id: material.id },
      data: {
        cantidad_total,
        cantidad_disponible,
        cantidad_prestada,
        cantidad_danada,
        cantidad_mantenimiento,
        cantidad_faltante,
      },
    });

    console.log(`Material ${material.nombre}: disponible=${cantidad_disponible}, prestado=${cantidad_prestada}, faltante=${cantidad_faltante}`);
  }

  console.log('Migración completada exitosamente');
}

main()
  .catch((e) => {
    console.error('Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
