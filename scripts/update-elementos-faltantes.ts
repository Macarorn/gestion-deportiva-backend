import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Actualizando elementos con novedades de tipo "pérdida"...');

  // Buscar todas las novedades de tipo "pérdida" que tienen elementoId
  const novedadesPerdida = await prisma.novedad.findMany({
    where: {
      tipo: 'pérdida',
      elementoId: {
        not: null,
      },
    },
    include: {
      elemento: true,
    },
  });

  console.log(`Encontradas ${novedadesPerdida.length} novedades de tipo "pérdida" con elementoId`);

  // Actualizar cada elemento a estado "faltante"
  let actualizados = 0;
  for (const novedad of novedadesPerdida) {
    if (novedad.elemento && novedad.elemento.estado !== 'faltante') {
      await prisma.elemento.update({
        where: { id: novedad.elementoId! },
        data: { estado: 'faltante' },
      });
      console.log(`Elemento ${novedad.elemento.nombre_serial} actualizado a "faltante"`);
      actualizados++;
    }
  }

  console.log(`Total de elementos actualizados: ${actualizados}`);

  // Recalcular cantidad_faltante para todos los materiales
  const materiales = await prisma.material.findMany({
    where: {
      requiere_serial: true,
    },
    include: {
      elementos: true,
    },
  });

  console.log('Recalculando cantidad_faltante para materiales con serial...');

  for (const material of materiales) {
    const cantidad_faltante = material.elementos.filter((e) => e.estado === 'faltante').length;

    if (cantidad_faltante > 0) {
      await prisma.material.update({
        where: { id: material.id },
        data: { cantidad_faltante },
      });
      console.log(`Material ${material.nombre}: cantidad_faltante actualizada a ${cantidad_faltante}`);
    }
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
