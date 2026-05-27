const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'gestion_deportiva'
    });
    
    console.log('Connected to database');
    
    const [rows] = await connection.execute('SHOW COLUMNS FROM Novedad');
    console.log('Novedad columns:', rows);
    
    const hasElementoId = rows.some(col => col.Field === 'elementoId');
    console.log('Has elementoId:', hasElementoId);
    
    if (!hasElementoId) {
      console.log('Adding elementoId column...');
      await connection.execute('ALTER TABLE Novedad ADD COLUMN elementoId INTEGER NULL');
      await connection.execute('ALTER TABLE Novedad ADD CONSTRAINT Novedad_elementoId_fkey FOREIGN KEY (elementoId) REFERENCES Elemento(id) ON DELETE SET NULL ON UPDATE CASCADE');
      await connection.execute('CREATE INDEX Novedad_elementoId_idx ON Novedad(elementoId)');
      console.log('Migration applied successfully!');
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDatabase();
