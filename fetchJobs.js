import { processJobWithAI } from "./server/ai.js";
import { extendedStorage as storage } from "./server/storage.js";
import { connectDB } from "./shared/db.js";

/**
 * Example job fetching function that processes jobs with AI before saving
 * This demonstrates how to integrate AI processing into the job pipeline
 */
export async function fetchAndProcessJobs() {
  try {
    // Connect to database
    await connectDB();
    
    // Example job data - in a real implementation, this would come from APIs or scraping
    const rawJobs = [
      {
        title: "SENIOR REACT.JS DEVELOPER!!!",
        description: "<h2>Job Description</h2><p>We need a <strong>React developer</strong> with 5+ years experience. Must know JavaScript, TypeScript, and modern frameworks.</p><br/><ul><li>Build user interfaces</li><li>Work with APIs</li></ul>",
        company: "Tech Corp",
        location: "Remote"
      },
      {
        title: "backend engineer python",
        description: "Looking for backend engineer. Python, Django, MongoDB, REST APIs. Must have experience with cloud platforms and microservices architecture.",
        company: "StartupCo",
        location: "San Francisco"
      },
      {
        title: "Full Stack Developer",
        description: "We are looking for a full stack developer with experience in React, Node.js, and MongoDB. Experience with cloud deployment is a plus.",
        company: "Web Solutions Inc",
        location: "New York"
      }
    ];

    const processedJobs = [];

    for (const job of rawJobs) {
      console.log(`Processing job: ${job.title}`);
      
      // Process job with AI
      const aiResult = await processJobWithAI(job.title, job.description);
      
      // Combine original job data with AI-processed data
      const processedJob = {
        ...job,
        normalized_title: aiResult.normalized_title,
        category: aiResult.category,
        clean_description: aiResult.clean_description,
        original_title: job.title,
        original_description: job.description
      };

      processedJobs.push(processedJob);
      
      // Save job to database
      await saveJobToDatabase(processedJob);
      
      console.log(`✅ Processed job:`, {
        original: job.title,
        normalized: aiResult.normalized_title,
        category: aiResult.category
      });
    }

    return processedJobs;

  } catch (error) {
    console.error("Error in fetchAndProcessJobs:", error);
    throw error;
  }
}

/**
 * Save job to database
 * This function creates a project in the database with the job data
 */
async function saveJobToDatabase(jobData) {
  try {
    // Create a company user if it doesn't exist
    let companyUser = await storage.getUserByEmail(`${jobData.company.toLowerCase().replace(/\s+/g, '')}@company.com`);
    
    if (!companyUser) {
      companyUser = await storage.createUser({
        email: `${jobData.company.toLowerCase().replace(/\s+/g, '')}@company.com`,
        password: "company123", // In a real implementation, this would be a secure password
        firstName: jobData.company,
        lastName: "Company",
        userType: "COMPANY",
        language: "en"
      });
      
      // Create company profile
      await storage.createCompanyProfile({
        userId: companyUser.id,
        companyName: jobData.company,
        description: `Company profile for ${jobData.company}`,
        location: jobData.location
      });
    }
    
    // Create project (job posting) with AI-processed data
    const projectData = {
      companyUserId: companyUser.id,
      title: jobData.normalized_title || jobData.title,
      description: jobData.clean_description || jobData.description,
      location: jobData.location,
      isRemote: jobData.location.toLowerCase() === 'remote',
      status: 'OPEN',
      contractType: 'FULL_TIME',
      teamSize: 1,
      requiredSkills: extractSkillsFromDescription(jobData.clean_description || jobData.description),
      seniorityLevel: determineSeniorityLevel(jobData.title)
    };
    
    const project = await storage.createProject(projectData);
    console.log("✅ Job saved to database:", project.title);
    
    // Save job import record for tracking
    await storage.createJobImport({
      source: "test_script",
      jobId: project.id,
      rawData: JSON.stringify({
        original_title: jobData.original_title,
        original_description: jobData.original_description
      }),
      processedData: JSON.stringify({
        normalized_title: jobData.normalized_title,
        category: jobData.category,
        clean_description: jobData.clean_description
      })
    });
    
    return project;
  } catch (error) {
    console.error("Error saving job to database:", error);
    throw error;
  }
}

/**
 * Extract skills from job description
 * In a real implementation, this would be more sophisticated
 */
function extractSkillsFromDescription(description) {
  const commonSkills = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python',
    'django', 'flask', 'java', 'spring', 'c#', 'asp.net', 'php', 'laravel',
    'ruby', 'rails', 'go', 'golang', 'rust', 'swift', 'kotlin', 'scala',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform',
    'git', 'github', 'gitlab', 'ci/cd', 'jenkins', 'github actions'
  ];
  
  const descriptionLower = (description || '').toLowerCase();
  return commonSkills.filter(skill => descriptionLower.includes(skill));
}

/**
 * Determine seniority level from job title
 * In a real implementation, this would be more sophisticated
 */
function determineSeniorityLevel(title) {
  const titleLower = (title || '').toLowerCase();
  
  if (titleLower.includes('senior') || titleLower.includes('sr.') || titleLower.includes('lead')) {
    return 'SENIOR';
  } else if (titleLower.includes('mid') || titleLower.includes('intermediate')) {
    return 'MID';
  } else if (titleLower.includes('junior') || titleLower.includes('jr.')) {
    return 'JUNIOR';
  } else {
    return 'MID'; // Default to MID if not specified
  }
}

// Run the function if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchAndProcessJobs()
    .then(() => {
      console.log("✅ Job import completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Job import failed:", error);
      process.exit(1);
    });
}