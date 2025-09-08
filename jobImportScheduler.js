#!/usr/bin/env node

// Cron Scheduler for VibeSync Job Imports
// This script sets up and runs cron jobs for importing IT jobs

import cron from 'node-cron';
import { runJobImport } from './jobImportCron.js';
import { config } from 'dotenv';
config();

console.log('🚀 Starting VibeSync Job Import Scheduler...');

// Schedule the job import to run every hour
// This can be customized based on requirements:
// - Every hour: '0 * * * *'
// - Every 6 hours: '0 */6 * * *'
// - Every day at 2 AM: '0 2 * * *'
// - Every 30 minutes (for testing): '*/30 * * * *'

const schedule = process.env.CRON_SCHEDULE || '0 * * * *'; // Default: every hour

console.log(`📅 Cron job scheduled with pattern: ${schedule}`);
console.log('💡 To change schedule, set CRON_SCHEDULE environment variable');
console.log('   Examples:');
console.log('   - Every hour: CRON_SCHEDULE="0 * * * *"');
console.log('   - Every 6 hours: CRON_SCHEDULE="0 */6 * * *"');
console.log('   - Every day at 2 AM: CRON_SCHEDULE="0 2 * * *"');
console.log('   - Every 30 minutes: CRON_SCHEDULE="*/30 * * * *"');

// Schedule the cron job
cron.schedule(schedule, async () => {
  console.log(`\n⏰ Cron job triggered at ${new Date().toISOString()}`);
  try {
    await runJobImport();
  } catch (error) {
    console.error('❌ Cron job failed:', error);
  }
});

console.log('✅ VibeSync Job Import Scheduler is running!');
console.log('📋 Cron jobs will be executed according to schedule...');
console.log('   Press Ctrl+C to stop the scheduler');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping VibeSync Job Import Scheduler...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping VibeSync Job Import Scheduler...');
  process.exit(0);
});