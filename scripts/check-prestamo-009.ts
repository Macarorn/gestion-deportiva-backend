import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const prestamo = await prisma.prestamo.findUnique({
    where: { numero_prestamo: 'PRE-2026-05-009' },
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

  console.log('Préstamo:', JSON.stringify(prestamo, null, 2));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
