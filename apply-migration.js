const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Applying migration...');
    
    // Check if columna elementoId exists
    const tableInfo = await prisma.$queryRaw`SHOW COLUMNS FROM Novedad`;
    console.log('Current columns:', tableInfo);
    
    const hasElementoId = tableInfo.some(col => col.Field === 'elementoId');
    
    if (!hasElementoId) {
      console.log('Adding elementoId column...');
      await prisma.$executeRaw`ALTER TABLE Novedad ADD COLUMN elementoId INTEGER NULL`;
      await prisma.$executeRaw`ALTER TABLE Novedad ADD CONSTRAINT Novedad_elementoId_fkey FOREIGN KEY (elementoId) REFERENCES Elemento(id) ON DELETE SET NULL ON UPDATE CASCADE`;
      await prisma.$executeRaw`CREATE INDEX Novedad_elementoId_idx ON Novedad(elementoId)`;
      console.log('Migration applied successfully!');
    } else {
      console.log('Column elementoId already exists');
    }
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
