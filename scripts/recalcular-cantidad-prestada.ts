import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Recalculando cantidad_prestada para todos los materiales...');

  const materiales = await prisma.material.findMany();

  for (const material of materiales) {
    // Calcular cantidad_prestada basado en préstamos activos
    const prestamosActivos = await prisma.prestamo.findMany({
      where: {
        estado: 'activo',
        detalles: {
          some: {
            materialId: material.id,
          },
        },
      },
      include: {
        detalles: {
          where: {
            materialId: material.id,
          },
        },
      },
    });

    let cantidadPrestada = 0;
    for (const prestamo of prestamosActivos) {
      for (const detalle of prestamo.detalles) {
        cantidadPrestada += (detalle.cantidad_entregada - detalle.cantidad_devuelta);
      }
    }

    console.log(`Material ${material.nombre}: cantidad_prestada actual=${material.cantidad_prestada}, calculada=${cantidadPrestada}`);

    await prisma.material.update({
      where: { id: material.id },
      data: {
        cantidad_prestada: cantidadPrestada,
      },
    });
  }

  console.log('Recálculo completado');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
