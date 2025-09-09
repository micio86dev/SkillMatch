#!/usr/bin/env node

// Job Import Cron Script
// Questo script importa i job IT pubblicati nelle ultime 24 ore
// Può essere eseguito come cron job o manualmente

// Carica le variabili d'ambiente
import { config } from 'dotenv';
config();

import { PrismaClient } from './generated/prisma/index.js';
import OpenAI from 'openai';

// Inizializza Prisma e OpenAI
const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Processa un job con AI per normalizzare il titolo e la descrizione
 * @param {string} title - Titolo del job
 * @param {string} description - Descrizione del job
 * @returns {Promise<Object>} Dati processati con AI
 */
async function processJobWithAI(title, description) {
  try {
    // Solo se è configurata la chiave API di OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.log("ℹ️  OpenAI API key not configured, skipping AI processing");
      return {
        normalized_title: title,
        category: "other",
        clean_description: description
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert at processing IT job postings. Your task is to:
1. Normalize the job title into a standard professional format (remove excessive capitalization, fix typos, make it concise)
2. Assign exactly ONE category from: ["frontend", "backend", "fullstack", "mobile", "devops", "data", "other"]
3. Clean the job description by removing HTML tags, strange symbols, excessive whitespace, and formatting issues while preserving the core content

Return a JSON object with exactly these fields:
- normalized_title: The cleaned, professional job title
- category: One of the allowed categories
- clean_description: The cleaned description text

Be precise and consistent with categorization:
- frontend: UI/UX, React, Vue, Angular, frontend development
- backend: Server-side, APIs, databases, microservices  
- fullstack: Full-stack development, both frontend and backend
- mobile: iOS, Android, React Native, Flutter, mobile apps
- devops: DevOps, cloud, infrastructure, CI/CD, deployment
- data: Data science, ML, analytics, databases, data engineering
- other: Everything else (project management, QA, design, etc.)`
        },
        {
          role: "user",
          content: `Process this job posting:

Title: ${title}

Description: ${description}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Valida la risposta e fornisce valori predefiniti se necessario
    return {
      normalized_title: result.normalized_title || title,
      category: result.category || "other",
      clean_description: result.clean_description || description
    };

  } catch (error) {
    console.error("❌ Error processing job with AI:", error.message);
    // Ritorna valori null se l'elaborazione AI fallisce
    return {
      normalized_title: null,
      category: null,
      clean_description: null
    };
  }
}

/**
 * Crea un utente azienda se non esiste
 * @param {string} companyName - Nome dell'azienda
 * @returns {Promise<Object>} Utente azienda
 */
async function createCompanyUser(companyName) {
  // Crea un'email unica per l'azienda
  const email = `${companyName.toLowerCase().replace(/\s+/g, '')}@imported-jobs.com`;
  
  // Cerca se l'utente esiste già
  let companyUser = await prisma.user.findUnique({
    where: { email }
  });
  
  if (!companyUser) {
    companyUser = await prisma.user.create({
      data: {
        email,
        password: "imported123", // Password temporanea
        firstName: companyName,
        lastName: "Company",
        userType: "COMPANY",
        language: "en"
      }
    });
    
    // Crea il profilo aziendale
    await prisma.companyProfile.create({
      data: {
        userId: companyUser.id,
        companyName,
        description: `Company profile for ${companyName} (imported jobs)`,
        location: "Remote" // Default location
      }
    });
    
    console.log(`🏢 Created company user: ${companyUser.email}`);
  } else {
    console.log(`🏢 Using existing company user: ${companyUser.email}`);
  }
  
  return companyUser;
}

/**
 * Importa un singolo job nel database
 * @param {Object} jobData - Dati del job da importare
 */
async function importJob(jobData) {
  try {
    console.log(`\n📥 Importing job: ${jobData.title}`);
    
    // Crea l'utente azienda
    const companyUser = await createCompanyUser(jobData.company);
    
    // Processa il job con AI (se configurato)
    const aiResult = await processJobWithAI(jobData.title, jobData.description);
    
    // Crea il progetto (job posting) con i dati processati
    const projectData = {
      companyUserId: companyUser.id,
      title: aiResult.normalized_title || jobData.title,
      description: aiResult.clean_description || jobData.description,
      location: jobData.location || "Remote",
      isRemote: (jobData.location || "").toLowerCase().includes("remote"),
      status: 'OPEN',
      contractType: jobData.contractType || 'FULL_TIME',
      teamSize: jobData.teamSize || 1,
      requiredSkills: jobData.requiredSkills || [],
      seniorityLevel: jobData.seniorityLevel || 'MID',
      budgetMin: jobData.salaryMin,
      budgetMax: jobData.salaryMax
    };
    
    const project = await prisma.project.create({
      data: projectData
    });
    
    console.log(`✅ Imported job: ${project.title}`);
    
    // Salva il record di importazione per tracking
    await prisma.jobImport.create({
      data: {
        title: project.title,
        companyName: jobData.company,
        sourceUrl: jobData.sourceUrl || "unknown_source"
      }
    });
    
    return project;
  } catch (error) {
    console.error(`❌ Failed to import job "${jobData.title}":`, error.message);
    throw error;
  }
}

/**
 * Simula l'importazione di job da fonti esterne
 * In un'implementazione reale, qui si integrerebbero le API o il web scraping
 */
async function fetchJobsFromSources() {
  // Questo è un esempio di dati che potrebbero essere ottenuti da fonti esterne
  // In una vera implementazione, questi dati verrebbero ottenuti da API o web scraping
  
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  // Esempi di job IT recenti
  const sampleJobs = [
    {
      title: "SENIOR REACT.JS DEVELOPER!!!",
      description: "<h2>Job Description</h2><p>We need a <strong>React developer</strong> with 5+ years experience. Must know JavaScript, TypeScript, and modern frameworks.</p><br/><ul><li>Build user interfaces</li><li>Work with APIs</li></ul>",
      company: "Tech Corp",
      location: "Remote",
      contractType: "FULL_TIME",
      seniorityLevel: "SENIOR",
      requiredSkills: ["react", "javascript", "typescript"],
      sourceUrl: "https://example-job-site.com/job/12345",
      postedAt: new Date()
    },
    {
      title: "backend engineer python",
      description: "Looking for backend engineer. Python, Django, MongoDB, REST APIs. Must have experience with cloud platforms and microservices architecture.",
      company: "StartupCo",
      location: "San Francisco",
      contractType: "FULL_TIME",
      seniorityLevel: "MID",
      requiredSkills: ["python", "django", "mongodb", "rest"],
      sourceUrl: "https://another-job-site.com/listing/67890",
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 ore fa
    },
    {
      title: "DevOps Engineer - AWS & Kubernetes",
      description: "Join our platform team to manage and scale our cloud infrastructure. Experience with AWS, Kubernetes, Terraform, and CI/CD pipelines required.",
      company: "CloudTech Inc",
      location: "Austin, TX",
      contractType: "FULL_TIME",
      seniorityLevel: "SENIOR",
      requiredSkills: ["aws", "kubernetes", "terraform", "docker"],
      sourceUrl: "https://tech-jobs.com/view/54321",
      postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 ore fa
    }
  ];
  
  // Filtra solo i job delle ultime 24 ore
  const recentJobs = sampleJobs.filter(job => 
    job.postedAt >= twentyFourHoursAgo
  );
  
  console.log(`📊 Found ${recentJobs.length} IT jobs posted in the last 24 hours`);
  
  return recentJobs;
}

/**
 * Funzione principale del cron job di importazione
 */
async function runJobImport() {
  console.log("🚀 Starting IT job import cron job...");
  console.log(`⏰ ${new Date().toISOString()}`);
  
  try {
    // Ottieni i job dalle fonti esterne
    const jobsToImport = await fetchJobsFromSources();
    
    if (jobsToImport.length === 0) {
      console.log("ℹ️  No new jobs to import");
      return;
    }
    
    // Importa ogni job
    let importedCount = 0;
    let failedCount = 0;
    
    for (const job of jobsToImport) {
      try {
        await importJob(job);
        importedCount++;
      } catch (error) {
        failedCount++;
        // Continua con il prossimo job anche se uno fallisce
      }
    }
    
    // Stampa il report finale
    console.log(`\n📈 Import job summary:`);
    console.log(`  ✅ Successfully imported: ${importedCount}`);
    console.log(`  ❌ Failed to import: ${failedCount}`);
    console.log(`  📊 Total processed: ${jobsToImport.length}`);
    
    // Mostra alcune statistiche
    const totalProjects = await prisma.project.count();
    const openProjects = await prisma.project.count({
      where: { status: 'OPEN' }
    });
    
    console.log(`\n📊 Database statistics:`);
    console.log(`  📁 Total projects: ${totalProjects}`);
    console.log(`  🟢 Open projects: ${openProjects}\n`);

  } catch (error) {
    console.error("❌ Job import cron job failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🏁 Job import cron job completed\n");
  }
}

// Esegue il cron job se lo script è eseguito direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runJobImport();
}

// Esporta le funzioni per l'uso in altri moduli
export { runJobImport, importJob, processJobWithAI };