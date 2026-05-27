import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Buscando préstamos con daños o pérdidas sin novedades...');

  // Buscar préstamos devueltos con detalles que tienen cantidad_danada > 0 o cantidad_faltante > 0
  const prestamos = await prisma.prestamo.findMany({
    where: {
      estado: 'devuelto',
    },
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

  let novedadesCreadas = 0;

  for (const prestamo of prestamos) {
    for (const detalle of prestamo.detalles) {
      // Verificar si el detalle tiene daño o pérdida
      if (detalle.cantidad_danada > 0 || detalle.cantidad_faltante > 0) {
        // Verificar si ya existe novedad para este detalle
        const novedadExistente = prestamo.novedades.find(n => 
          (n.elementoId === detalle.elementoId) || 
          (!n.elementoId && !detalle.elementoId)
        );

        if (!novedadExistente) {
          // Crear novedad para daño
          if (detalle.cantidad_danada > 0) {
            await prisma.novedad.create({
              data: {
                prestamoId: prestamo.id,
                tipo: 'daño',
                descripcion: 'Elemento dañado durante el préstamo',
                cantidad_afectada: detalle.cantidad_danada,
                elementoId: detalle.elementoId || undefined,
              },
            });
            console.log(`Novedad de daño creada para detalle ${detalle.id} del préstamo ${prestamo.numero_prestamo}`);
            novedadesCreadas++;
          }

          // Crear novedad para pérdida
          if (detalle.cantidad_faltante > 0) {
            await prisma.novedad.create({
              data: {
                prestamoId: prestamo.id,
                tipo: 'pérdida',
                descripcion: 'Elemento faltante durante el préstamo',
                cantidad_afectada: detalle.cantidad_faltante,
                elementoId: detalle.elementoId || undefined,
              },
            });
            console.log(`Novedad de pérdida creada para detalle ${detalle.id} del préstamo ${prestamo.numero_prestamo}`);
            novedadesCreadas++;
          }
        }
      }
    }
  }

  console.log(`Total de novedades creadas: ${novedadesCreadas}`);
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
