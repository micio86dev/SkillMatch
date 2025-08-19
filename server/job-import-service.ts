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

  async importSpecificRoles(designersCount: number = 5, projectManagersCount: number = 5): Promise<{ imported: number; skipped: number; errors: number }> {
    console.log(`Starting targeted import: ${designersCount} designers and ${projectManagersCount} project managers...`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    try {
      // Scrape specific roles from InfoJobs and Indeed
      const rawJobs = await this.scraper.scrapeSpecificRoles(designersCount, projectManagersCount);
      console.log(`Found ${rawJobs.length} raw job postings for designers and project managers`);

      for (const rawJob of rawJobs.slice(0, designersCount + projectManagersCount)) {
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
          
          // Create project with budget validation
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
          
          try {
            await storage.createProject(projectData);
            imported++;
            console.log(`Imported job: ${parsedJob.title} from ${parsedJob.companyName}`);
            await this.recordJobImport(parsedJob.title, parsedJob.companyName, rawJob.sourceUrl);
          } catch (projectError: any) {
            // Handle budget validation errors for imported projects
            if (projectError.message && projectError.message.includes("Budget")) {
              console.warn(`Skipping project "${parsedJob.title}" due to budget validation: ${projectError.message}`);
              skipped++;
              continue;
            } else {
              throw projectError; // Re-throw non-budget errors
            }
          }
          
          if (imported >= designersCount + projectManagersCount) {
            break;
          }
        } catch (error) {
          errors++;
          console.error(`Error processing job ${rawJob.title}:`, error);
        }
      }
    } catch (error) {
      console.error("Error in job import process:", error);
      errors++;
    }

    const result = { imported, skipped, errors };
    console.log(`Targeted import completed: ${imported} imported, ${skipped} skipped, ${errors} errors`);
    return result;
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
          
          // Create project with budget validation
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
          
          try {
            await storage.createProject(projectData);
            imported++;
            
            // Store import record to prevent duplicates
            await this.recordJobImport(parsedJob.title, parsedJob.companyName, parsedJob.originalUrl);
            console.log(`Imported job: ${parsedJob.title} from ${parsedJob.companyName}`);
            
            // Stop if we've imported enough jobs
            if (imported >= maxJobs) {
              break;
            }
          } catch (projectError: any) {
            // Handle budget validation errors for imported projects
            if (projectError.message && projectError.message.includes("Budget")) {
              console.warn(`Skipping project "${parsedJob.title}" due to budget validation: ${projectError.message}`);
              skipped++;
              continue;
            } else {
              throw projectError; // Re-throw non-budget errors
            }
          }

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
        websiteUrl: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        // founded: new Date().getFullYear() - Math.floor(Math.random() * 20), // Not available in schema
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