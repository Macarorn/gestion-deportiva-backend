import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const materiales = await prisma.material.findMany({
    where: {
      nombre: { contains: 'Peto' }
    }
  });

  console.log('Materiales encontrados:', JSON.stringify(materiales, null, 2));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
