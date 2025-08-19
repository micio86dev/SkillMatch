import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ParsedJobPosting {
  title: string;
  description: string;
  requiredSkills: string[];
  seniorityLevel: "junior" | "mid" | "senior" | "lead" | "principal";
  contractType: "hourly" | "project_based" | "full_time" | "part_time";
  teamSize: number;
  estimatedHours?: number;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  isRemote: boolean;
  companyName: string;
  companyDescription?: string;
  originalUrl: string;
}

export class AIJobParser {
  async parseJobPosting(rawJobText: string, sourceUrl: string): Promise<ParsedJobPosting | null> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an expert at parsing IT job postings. Extract structured information from job postings and return JSON.

            Extract the following information:
            - title: Job title
            - description: Clean, professional description (200-500 words)
            - requiredSkills: Array of technical skills mentioned
            - seniorityLevel: junior/mid/senior/lead/principal based on experience required
            - contractType: full_time/part_time/hourly/project_based
            - teamSize: Number of people needed (default 1)
            - estimatedHours: If mentioned, weekly hours expected
            - budgetMin/budgetMax: Salary range if mentioned (convert to numbers)
            - location: Work location
            - isRemote: true if remote work is allowed
            - companyName: Company name
            - companyDescription: Brief company description if available
            - originalUrl: The source URL

            Return valid JSON only, no other text.`
          },
          {
            role: "user",
            content: `Parse this job posting from ${sourceUrl}:\n\n${rawJobText}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const parsedData = JSON.parse(response.choices[0].message.content || "{}");
      
      // Validate and set defaults
      return {
        title: parsedData.title || "IT Position",
        description: parsedData.description || "IT position available",
        requiredSkills: Array.isArray(parsedData.requiredSkills) ? parsedData.requiredSkills : [],
        seniorityLevel: parsedData.seniorityLevel || "mid",
        contractType: parsedData.contractType || "full_time",
        teamSize: parsedData.teamSize || 1,
        estimatedHours: parsedData.estimatedHours,
        budgetMin: parsedData.budgetMin,
        budgetMax: parsedData.budgetMax,
        location: parsedData.location || "Remote",
        isRemote: parsedData.isRemote !== false,
        companyName: parsedData.companyName || "Company",
        companyDescription: parsedData.companyDescription,
        originalUrl: sourceUrl,
      };
    } catch (error) {
      console.error("Error parsing job posting:", error);
      return null;
    }
  }

  async generateCompanyProfile(companyName: string, companyDescription?: string): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    companySize: string;
    industry: string;
    description: string;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `Generate a realistic company profile for IT recruiting. Create professional details based on the company name and description provided.

            Return JSON with:
            - firstName: HR contact first name
            - lastName: HR contact last name  
            - email: Professional email address
            - companyName: The company name
            - companySize: startup/small/medium/large/enterprise
            - industry: Primary industry
            - description: Professional company description (100-200 words)

            Make the details realistic but not based on real companies. Return valid JSON only.`
          },
          {
            role: "user",
            content: `Generate profile for company: ${companyName}${companyDescription ? `\nDescription: ${companyDescription}` : ''}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const profile = JSON.parse(response.choices[0].message.content || "{}");
      
      return {
        firstName: profile.firstName || "HR",
        lastName: profile.lastName || "Manager",
        email: profile.email || `hr@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        companyName: profile.companyName || companyName,
        companySize: profile.companySize || "medium",
        industry: profile.industry || "Technology",
        description: profile.description || `${companyName} is a technology company focused on innovation and growth.`,
      };
    } catch (error) {
      console.error("Error generating company profile:", error);
      return {
        firstName: "HR",
        lastName: "Manager",
        email: `hr@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        companyName,
        companySize: "medium",
        industry: "Technology",
        description: `${companyName} is a technology company.`,
      };
    }
  }
}