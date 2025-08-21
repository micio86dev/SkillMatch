#!/usr/bin/env node

/**
 * EXPORT COMPLETO DATABASE MYSQL - VIBESYNC
 * ==========================================
 * Esporta tutto il database MySQL con struttura e dati
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import fs from 'fs';

// Usa la stessa configurazione dell'app
const connection = mysql.createPool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
});

const db = drizzle(connection);

async function exportDatabase() {
  try {
    console.log('\n🚀 INIZIANDO EXPORT DATABASE VIBESYNC');
    console.log('=====================================\n');

    const timestamp = new Date().toISOString().slice(0,19).replace(/[T:]/g, '_');
    const filename = `vibesync_export_${timestamp}.sql`;

    let sqlOutput = `-- =============================================
-- VIBESYNC DATABASE EXPORT COMPLETO  
-- =============================================
-- Data: ${new Date().toLocaleString('it-IT')}
-- Database: MySQL
-- Piattaforma: VibeSync Professional Networking
-- =============================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

`;

    // Ottieni lista tabelle
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Trovate ${tables.length} tabelle da esportare\n`);

    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`📄 Esportando: ${tableName}`);

      try {
        // Struttura tabella
        const [createTable] = await connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
        const createStatement = createTable[0]['Create Table'];
        
        sqlOutput += `-- Struttura tabella \`${tableName}\`\nDROP TABLE IF EXISTS \`${tableName}\`;\n${createStatement};\n\n`;

        // Dati tabella
        const [rows] = await connection.execute(`SELECT * FROM \`${tableName}\``);
        
        if (rows.length > 0) {
          console.log(`   └─ ${rows.length} record`);
          
          // Ottieni colonne
          const [columns] = await connection.execute(`SHOW COLUMNS FROM \`${tableName}\``);
          const columnNames = columns.map(col => `\`${col.Field}\``).join(', ');
          
          sqlOutput += `-- Dati tabella \`${tableName}\`\nINSERT INTO \`${tableName}\` (${columnNames}) VALUES\n`;
          
          const values = rows.map((row, index) => {
            const valueList = Object.values(row).map(value => {
              if (value === null) return 'NULL';
              if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
              if (typeof value === 'string') return `'${value.replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
              if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
              return value;
            }).join(', ');
            
            const suffix = index === rows.length - 1 ? ';\n\n' : ',\n';
            return `(${valueList})${suffix}`;
          }).join('');
          
          sqlOutput += values;
        } else {
          console.log('   └─ 0 record');
        }

      } catch (error) {
        console.log(`   └─ ⚠️ Errore: ${error.message}`);
      }
    }

    sqlOutput += `SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- =============================================
-- EXPORT COMPLETATO CON SUCCESSO
-- File: ${filename}  
-- Data: ${new Date().toLocaleString('it-IT')}
-- =============================================
`;

    // Salva file
    fs.writeFileSync(filename, sqlOutput, 'utf8');
    
    const fileSize = (fs.statSync(filename).size / 1024 / 1024).toFixed(2);
    
    console.log('\n✅ EXPORT COMPLETATO!');
    console.log(`📁 File: ${filename}`);
    console.log(`📊 Dimensione: ${fileSize} MB`);
    
    // Statistiche rapide
    console.log('\n📈 STATISTICHE DATABASE:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as total FROM \`${tableName}\``);
        console.log(`   ${tableName}: ${count[0].total} record`);
      } catch (e) {
        console.log(`   ${tableName}: N/A`);
      }
    }

  } catch (error) {
    console.error('\n❌ ERRORE EXPORT:', error.message);
  } finally {
    await connection.end();
  }
}

exportDatabase();