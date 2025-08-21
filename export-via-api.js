#!/usr/bin/env node

/**
 * EXPORT DATABASE VIA API - VIBESYNC
 * ===================================
 * Esporta il database tramite l'API dell'applicazione
 */

import https from 'https';
import http from 'http';
import fs from 'fs';

async function exportDatabase() {
  try {
    console.log('\n🚀 EXPORT DATABASE VIA API VIBESYNC');
    console.log('====================================\n');

    const url = 'http://localhost:5000/api/stats';
    
    console.log('📊 Testing API connection...');
    
    const response = await new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.abort();
        reject(new Error('Timeout'));
      });
    });

    if (response.status === 200) {
      const stats = JSON.parse(response.data);
      console.log('✅ API connessa con successo!');
      console.log(`📈 Database statistiche:
   👤 Professionisti attivi: ${stats.activeProfessionals}
   💼 Progetti aperti: ${stats.openProjects}
   📊 Totale funzionalità: ${stats.totalPages || 'N/A'}`);

      console.log('\n🎯 DATABASE OPERATIVO E PRONTO PER EXPORT!');
      console.log('\nNow you can make API calls to export data.');
      
      // Prova un export semplice dei stats
      const timestamp = new Date().toISOString().slice(0,19).replace(/[T:]/g, '_');
      const filename = `vibesync_stats_${timestamp}.json`;
      
      fs.writeFileSync(filename, JSON.stringify({
        timestamp: new Date().toISOString(),
        database_status: 'OPERATIONAL',
        export_method: 'API',
        platform: 'VibeSync Professional Networking',
        stats: stats,
        note: 'Database PostgreSQL con ' + stats.activeProfessionals + ' professionisti e ' + stats.openProjects + ' progetti'
      }, null, 2));
      
      console.log(`📁 Report salvato: ${filename}`);
      
    } else {
      console.log(`❌ API error: Status ${response.status}`);
    }

  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
  }
}

exportDatabase();