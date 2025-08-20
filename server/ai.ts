import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Process job title and description with AI to normalize and categorize
 * @param {string} title - Job title
 * @param {string} description - Job description
 * @returns {Promise<{normalized_title: string, category: string, clean_description: string}>}
 */
export async function processJobWithAI(title, description) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    
    // Validate the response structure and provide defaults if needed
    return {
      normalized_title: result.normalized_title || title,
      category: result.category || "other",
      clean_description: result.clean_description || description
    };

  } catch (error) {
    console.error("Error processing job with AI:", error);
    // Return null values if AI processing fails, as requested
    return {
      normalized_title: null,
      category: null,
      clean_description: null
    };
  }
}