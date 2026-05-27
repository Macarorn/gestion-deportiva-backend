import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verificando Cono naranja...');

  const material = await prisma.material.findUnique({
    where: { id: 23 },
    include: {
      elementos: true,
    },
  });

  console.log('Material:', JSON.stringify(material, null, 2));

  console.log('\nPréstamos activos con Cono naranja:');
  const prestamosActivos = await prisma.prestamo.findMany({
    where: {
      estado: 'activo',
    },
    include: {
      detalles: {
        where: {
          materialId: 23,
        },
        include: {
          material: true,
        },
      },
    },
  });

  console.log('Préstamos activos:', JSON.stringify(prestamosActivos, null, 2));

  console.log('\nTodos los préstamos con Cono naranja:');
  const todosPrestamos = await prisma.prestamo.findMany({
    where: {
      detalles: {
        some: {
          materialId: 23,
        },
      },
    },
    include: {
      detalles: {
        where: {
          materialId: 23,
        },
        include: {
          material: true,
        },
      },
    },
  });

  console.log('Todos los préstamos:', JSON.stringify(todosPrestamos, null, 2));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
