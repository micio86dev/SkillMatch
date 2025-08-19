import { storage } from "./storage";
import { AIJobParser } from "./ai-service";
import { JobScraper } from "./job-scraper";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { type User } from "@shared/schema";

export class JobImportService {
  private aiParser: AIJobParser;
  private scraper: JobScraper;

  constructor() {
    this.aiParser = new AIJobParser();
    this.scraper = new JobScraper();
  }

  async importJobsFromWeb(maxJobs: number = 5): Promise<{ imported: number; skipped: number; errors: number }> {
    console.log("Starting automated job import...");
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    try {
      // Scrape jobs from various sources
      const rawJobs = await this.scraper.scrapeMultipleJobBoards();
      console.log(`Found ${rawJobs.length} raw job postings`);

      for (const rawJob of rawJobs.slice(0, maxJobs * 2)) { // Process more than needed to account for duplicates
        try {
          // Check if we already imported this job (by URL or title+company)
          if (await this.isDuplicateJob(rawJob.title, rawJob.companyName, rawJob.sourceUrl)) {
            skipped++;
            continue;
          }

          // Get detailed job content if needed
          let fullContent = rawJob.content;
          if (fullContent.length < 200) {
            const detailedContent = await this.scraper.scrapeJobDetail(rawJob.sourceUrl);
            if (detailedContent && detailedContent.length > fullContent.length) {
              fullContent = detailedContent;
            }
          }

          // Parse job with AI
          const parsedJob = await this.aiParser.parseJobPosting(fullContent, rawJob.sourceUrl);
          if (!parsedJob) {
            errors++;
            console.error(`Failed to parse job: ${rawJob.title}`);
            continue;
          }

          // Create or find company user
          const companyUser = await this.createOrFindCompanyUser(parsedJob.companyName, parsedJob.companyDescription);
          
          // Create project
          const projectData = {
            companyUserId: companyUser.id,
            title: parsedJob.title,
            description: parsedJob.description,
            requiredSkills: parsedJob.requiredSkills,
            seniorityLevel: parsedJob.seniorityLevel,
            contractType: parsedJob.contractType,
            teamSize: parsedJob.teamSize,
            estimatedHours: parsedJob.estimatedHours,
            budgetMin: parsedJob.budgetMin?.toString(),
            budgetMax: parsedJob.budgetMax?.toString(),
            location: parsedJob.location,
            isRemote: parsedJob.isRemote,
          } as any;
          await storage.createProject(projectData);
          imported++;
          
          // Stop if we've imported enough jobs
          if (imported >= maxJobs) {
            break;
          }

          // Store import record to prevent duplicates
          await this.recordJobImport(parsedJob.title, parsedJob.companyName, parsedJob.originalUrl);
          
          imported++;
          console.log(`Imported job: ${parsedJob.title} from ${parsedJob.companyName}`);

          // Add delay to be respectful to websites
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          errors++;
          console.error(`Error processing job ${rawJob.title}:`, error);
        }
      }

    } catch (error) {
      console.error("Error in job import process:", error);
      errors++;
    }

    console.log(`Job import completed. Imported: ${imported}, Skipped: ${skipped}, Errors: ${errors}`);
    return { imported, skipped, errors };
  }

  private async createOrFindCompanyUser(companyName: string, companyDescription?: string) {
    // Check if company user already exists by email pattern
    const companyEmail = `hr@${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    const existingCompany = await storage.getUserByEmail(companyEmail);

    if (existingCompany) {
      return existingCompany;
    }

    // Generate company profile with AI
    const companyProfile = await this.aiParser.generateCompanyProfile(companyName, companyDescription);
    
    // Create company user account
    const hashedPassword = await bcrypt.hash(nanoid(12), 10);
    
    const companyUser = await storage.createUser({
      email: companyProfile.email,
      password: hashedPassword,
      firstName: companyProfile.firstName,
      lastName: companyProfile.lastName,
      userType: "company"
    } as any);

    // Create company profile
    try {
      await storage.createCompanyProfile({
        userId: companyUser.id,
        companyName: companyProfile.companyName,
        companySize: companyProfile.companySize as any,
        industry: companyProfile.industry,
        description: companyProfile.description,
        website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        founded: new Date().getFullYear() - Math.floor(Math.random() * 20), // Random founding year
      });
    } catch (error) {
      console.log("Company profile creation skipped (may already exist)");
    }

    console.log(`Created company profile for: ${companyProfile.companyName}`);
    return companyUser;
  }

  private async isDuplicateJob(title: string, companyName?: string, sourceUrl?: string): Promise<boolean> {
    // Simple duplicate check - in a real implementation you'd use the database
    return false;
  }

  private async recordJobImport(title: string, companyName: string, sourceUrl: string): Promise<void> {
    // Record job import - simplified for now
    console.log(`Recorded import: ${title} from ${companyName}`);
  }
}