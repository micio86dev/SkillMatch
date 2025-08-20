import { processJobWithAI } from "./server/ai.ts";

/**
 * Example job fetching function that processes jobs with AI before saving
 * This demonstrates how to integrate AI processing into the job pipeline
 */
export async function fetchAndProcessJobs() {
  try {
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
        description: "Looking for backend engineer. Python, Django, PostgreSQL, REST APIs. Must have experience with cloud platforms and microservices architecture.",
        company: "StartupCo",
        location: "San Francisco"
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
      
      // Here you would save the processed job to your database
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
 * Save job to database (placeholder function)
 * In real implementation, this would use your database storage
 */
async function saveJobToDatabase(jobData) {
  // This is where you'd integrate with your actual database saving logic
  console.log("Saving job to database:", jobData.normalized_title || jobData.title);
  // Example: await storage.createProject(jobData);
}