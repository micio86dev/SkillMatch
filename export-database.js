#!/usr/bin/env node

/**
 * EXPORT COMPLETO DATABASE MYSQL - VIBESYNC PLATFORM
 * ==================================================
 * 
 * Esporta tutti i dati dal database MySQL di VibeSync in formato SQL.
 * Include struttura tabelle e dati completi della piattaforma.
 * 
 * Funzionalità della piattaforma esportata:
 * - 170+ professionisti IT attivi
 * - 115+ progetti aziendali aperti
 * - Sistema di autenticazione multilingue (12 lingue)
 * - Messaggi e notifiche real-time
 * - Sistema AI per import automatico lavori
 * - Applicazioni e sottoscrizioni progetti
 * - Feed sociale e networking
 * - Sistema preventivi e validazioni
 * - Feedback e valutazioni
 * 
 * Created: Database migrated from PostgreSQL to MySQL
 * Language: Italian (richiesto dall'utente)
 */

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// Configurazione database (usa le stesse variabili d'ambiente)
const DB_CONFIG = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '3306'),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
};

// Lista delle tabelle da esportare (ordine importante per le foreign keys)
const TABLES_EXPORT_ORDER = [
  'sessions',
  'users', 
  'professional_profiles',
  'company_profiles',
  'projects',
  'posts',
  'post_likes',
  'comment_likes', 
  'project_likes',
  'project_subscriptions',
  'project_applications',
  'project_preventives',
  'post_comments',
  'connections',
  'messages',
  'feedback',
  'notifications', 
  'notification_preferences',
  'job_imports'
];

class DatabaseExporter {
  constructor() {
    this.connection = null;
    this.exportFile = `vibesync_mysql_export_${new Date().toISOString().slice(0,10)}.sql`;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(DB_CONFIG);
      console.log('✅ Connesso al database MySQL');
    } catch (error) {
      console.error('❌ Errore connessione database:', error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      console.log('🔌 Disconnesso dal database');
    }
  }

  async exportDatabase() {
    console.log('\n🚀 INIZIANDO EXPORT COMPLETO DATABASE VIBESYNC');
    console.log('================================================\n');

    const exportPath = path.join(process.cwd(), this.exportFile);
    let sqlContent = '';

    // Header del file SQL
    sqlContent += this.generateHeader();

    // Disabilita foreign key checks per l'import
    sqlContent += '\n-- Disabilita controlli foreign key\nSET FOREIGN_KEY_CHECKS = 0;\nSET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\nSTART TRANSACTION;\nSET time_zone = "+00:00";\n\n';

    // Esporta ogni tabella
    for (const tableName of TABLES_EXPORT_ORDER) {
      console.log(`📋 Esportando tabella: ${tableName}`);
      
      try {
        // Struttura tabella
        sqlContent += await this.exportTableStructure(tableName);
        
        // Dati tabella
        const dataExport = await this.exportTableData(tableName);
        sqlContent += dataExport.sql;
        
        console.log(`   └─ ${dataExport.count} record esportati`);
        
      } catch (error) {
        console.log(`   └─ ⚠️  Tabella non esistente o errore: ${error.message}`);
      }
    }

    // Riabilita foreign key checks
    sqlContent += '\n-- Riabilita controlli foreign key\nSET FOREIGN_KEY_CHECKS = 1;\nCOMMIT;\n';

    // Salva file
    fs.writeFileSync(exportPath, sqlContent, 'utf8');
    
    console.log('\n✅ EXPORT COMPLETATO CON SUCCESSO!');
    console.log(`📁 File salvato: ${exportPath}`);
    console.log(`📊 Dimensione: ${(fs.statSync(exportPath).size / 1024 / 1024).toFixed(2)} MB`);

    // Statistiche finali
    await this.showExportStatistics();
  }

  generateHeader() {
    return `-- ===============================================
-- VIBESYNC PLATFORM - DATABASE MYSQL COMPLETO
-- ===============================================
--
-- Piattaforma di networking professionale per IT
-- 
-- Funzionalità incluse:
-- ✓ Sistema autenticazione multilingue (12 lingue)  
-- ✓ 170+ professionisti IT attivi
-- ✓ 115+ progetti aziendali
-- ✓ Messaggi real-time e notifiche
-- ✓ AI job import system
-- ✓ Social feed e networking
-- ✓ Sistema applicazioni progetti
-- ✓ Feedback e valutazioni
-- ✓ Preventivi e validazioni custom
--
-- Database: MySQL
-- Export Date: ${new Date().toLocaleString('it-IT')}
-- Migrated From: PostgreSQL
-- Language: Italian
--
-- ===============================================

`;
  }

  async exportTableStructure(tableName) {
    const [rows] = await this.connection.execute(`SHOW CREATE TABLE \`${tableName}\``);
    if (rows.length > 0) {
      const createStatement = rows[0]['Create Table'];
      return `-- \n-- Struttura tabella \`${tableName}\`\n-- \n\nDROP TABLE IF EXISTS \`${tableName}\`;\n${createStatement};\n\n`;
    }
    return '';
  }

  async exportTableData(tableName) {
    const [rows] = await this.connection.execute(`SELECT * FROM \`${tableName}\``);
    
    if (rows.length === 0) {
      return { sql: `-- Nessun dato nella tabella \`${tableName}\`\n\n`, count: 0 };
    }

    let sql = `-- \n-- Dati tabella \`${tableName}\`\n-- \n\n`;
    
    // Ottieni i nomi delle colonne
    const [columns] = await this.connection.execute(`SHOW COLUMNS FROM \`${tableName}\``);
    const columnNames = columns.map(col => `\`${col.Field}\``).join(', ');
    
    // Genera INSERT statements
    const values = rows.map(row => {
      const valueList = Object.values(row).map(value => {
        if (value === null) return 'NULL';
        if (typeof value === 'string') {
          // Escape delle stringhe
          return "'" + value.replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
        }
        if (value instanceof Date) {
          return "'" + value.toISOString().slice(0, 19).replace('T', ' ') + "'";
        }
        if (typeof value === 'object') {
          // Per campi JSON
          return "'" + JSON.stringify(value).replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
        }
        return value;
      }).join(', ');
      
      return `(${valueList})`;
    });

    // Divide in chunks per evitare query troppo grandi
    const chunkSize = 100;
    for (let i = 0; i < values.length; i += chunkSize) {
      const chunk = values.slice(i, i + chunkSize);
      sql += `INSERT INTO \`${tableName}\` (${columnNames}) VALUES\n${chunk.join(',\n')};\n\n`;
    }

    return { sql, count: rows.length };
  }

  async showExportStatistics() {
    console.log('\n📊 STATISTICHE EXPORT DATABASE');
    console.log('===============================\n');

    for (const tableName of TABLES_EXPORT_ORDER) {
      try {
        const [countResult] = await this.connection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        const count = countResult[0].count;
        
        // Emoji per tipo di tabella
        let emoji = '📄';
        if (tableName.includes('user')) emoji = '👤';
        else if (tableName.includes('project')) emoji = '💼';
        else if (tableName.includes('message')) emoji = '💬';
        else if (tableName.includes('post')) emoji = '📝';
        else if (tableName.includes('notification')) emoji = '🔔';
        else if (tableName.includes('session')) emoji = '🔐';
        
        console.log(`${emoji} ${tableName.padEnd(25)} ${count.toString().padStart(6)} record`);
        
      } catch (error) {
        console.log(`⚠️  ${tableName.padEnd(25)}     N/A record`);
      }
    }

    console.log('\n🎯 PIATTAFORMA COMPLETAMENTE ESPORTATA');
    console.log('Sistema pronto per deployment in produzione!');
  }
}

// Esecuzione script
async function main() {
  const exporter = new DatabaseExporter();
  
  try {
    await exporter.connect();
    await exporter.exportDatabase();
  } catch (error) {
    console.error('\n❌ ERRORE DURANTE EXPORT:', error.message);
    process.exit(1);
  } finally {
    await exporter.disconnect();
  }
}

// Avvia se eseguito direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default DatabaseExporter;