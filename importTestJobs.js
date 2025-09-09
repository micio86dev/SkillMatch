// Script per testare l'importazione dei job
// Questo script può essere eseguito direttamente con Node.js

// Carica le variabili d'ambiente
import { config } from 'dotenv';
config();

import { PrismaClient } from './generated/prisma/index.js';

// Inizializza Prisma
const prisma = new PrismaClient();

/**
 * Test job import function
 * This function creates sample jobs in the database for testing purposes
 */
async function importTestJobs() {
  try {
    console.log("🚀 Starting job import test...");
    
    // Crea un utente company di test
    let companyUser = await prisma.user.findUnique({
      where: { email: "techcorp@company.com" }
    });
    
    if (!companyUser) {
      companyUser = await prisma.user.create({
        data: {
          email: "techcorp@company.com",
          password: "company123", // In produzione usare un hash sicuro
          firstName: "Tech Corp",
          lastName: "Company",
          userType: "COMPANY",
          language: "en"
        }
      });
      
      // Crea il profilo aziendale
      await prisma.companyProfile.create({
        data: {
          userId: companyUser.id,
          companyName: "Tech Corp",
          description: "A leading technology company",
          location: "San Francisco, CA"
        }
      });
      
      console.log("🏢 Created company user:", companyUser.email);
    } else {
      console.log("🏢 Using existing company user:", companyUser.email);
    }
    
    // Crea job di esempio
    const sampleJobs = [
      {
        title: "Senior React Developer",
        description: "We are looking for an experienced React developer to join our frontend team. You will be responsible for building user interfaces and working with our design team to implement modern web applications.",
        location: "Remote",
        requiredSkills: ["react", "javascript", "typescript", "css", "html"],
        seniorityLevel: "SENIOR"
      },
      {
        title: "Backend Engineer - Python/Django",
        description: "Join our backend team to build scalable APIs and microservices. Experience with Python, Django, and MongoDB is required.",
        location: "New York, NY",
        requiredSkills: ["python", "django", "mongodb", "rest", "api"],
        seniorityLevel: "MID"
      },
      {
        title: "DevOps Engineer",
        description: "Help us maintain and improve our cloud infrastructure. Experience with AWS, Docker, and Kubernetes is essential.",
        location: "Austin, TX",
        requiredSkills: ["aws", "docker", "kubernetes", "terraform", "ci/cd"],
        seniorityLevel: "SENIOR"
      }
    ];
    
    console.log("💼 Creating sample jobs...");

    // Store created projects to show them in the output
    const createdProjects = [];

    for (const job of sampleJobs) {
      const projectData = {
        companyUserId: companyUser.id,
        title: job.title,
        description: job.description,
        location: job.location,
        isRemote: job.location.toLowerCase().includes("remote"),
        status: 'OPEN',
        contractType: 'FULL_TIME',
        teamSize: 1,
        requiredSkills: job.requiredSkills,
        seniorityLevel: job.seniorityLevel
      };

      const project = await prisma.project.create({
        data: projectData
      });

      createdProjects.push(project);
      console.log(`✅ Created job: ${project.title}`);

      // Salva il record di importazione
      await prisma.jobImport.create({
        data: {
          title: project.title,
          companyName: "Tech Corp",
          sourceUrl: "test_import"
        }
      });
    }

    // Verifica che i job siano stati creati
    const allProjects = await prisma.project.findMany();
    console.log(`\n📊 Total projects in database: ${allProjects.length}`);

    const openProjects = await prisma.project.findMany({
      where: { status: 'OPEN' }
    });
    console.log(`📊 Open projects: ${openProjects.length}`);

    // Mostra alcuni dettagli dei job appena creati
    console.log("\n📋 Sample jobs created:");
    createdProjects.forEach(project => {
      console.log(`  • ${project.title} (${project.location})`);
    });
    
    console.log("\n✅ Job import test completed successfully!");
    
  } catch (error) {
    console.error("❌ Job import test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

// Esegue la funzione se lo script è eseguito direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  importTestJobs();
}

// Esporta la funzione per l'uso in altri moduli
export { importTestJobs };