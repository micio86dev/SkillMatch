// Trigger specific role imports from InfoJobs and Indeed
import { JobImportService } from './server/job-import-service';

async function runImport() {
  console.log('🚀 Starting forced import of 5 designers and 5 project managers...');
  console.log('📍 Sources: InfoJobs and Indeed');
  console.log('⏱️  Target: Recent positions only\n');
  
  try {
    const jobImportService = new JobImportService();
    const results = await jobImportService.importSpecificRoles(5, 5);
    
    console.log('\n✅ Import completed successfully!');
    console.log('📊 Results:');
    console.log(`   • Imported: ${results.imported} jobs`);
    console.log(`   • Skipped: ${results.skipped} jobs`);
    console.log(`   • Errors: ${results.errors} jobs`);
    console.log(`   • Total processed: ${results.imported + results.skipped + results.errors}`);
    
    if (results.imported > 0) {
      console.log('\n🎯 Successfully imported recent designer and project manager positions!');
    } else {
      console.log('\n⚠️  No new positions were imported - they may already exist in the database.');
    }
    
  } catch (error) {
    console.error('\n❌ Error during import:', error);
    process.exit(1);
  }
}

// Run the import
runImport();