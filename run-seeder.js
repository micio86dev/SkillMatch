// Script to run professional users seeder
import { professionalUsersSeeder } from './server/seeders/professional-users-seeder';

async function runSeeder() {
  console.log('🚀 Starting professional users seeder...\n');
  
  try {
    await professionalUsersSeeder.seed(120);
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeder
runSeeder();