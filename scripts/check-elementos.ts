import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const material = await prisma.material.findUnique({
    where: { id: 20 },
    include: {
      elementos: true,
    },
  });

  console.log('Material Peto rojo:', JSON.stringify(material, null, 2));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
