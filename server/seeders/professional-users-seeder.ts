import bcrypt from "bcrypt";

import { storage } from "../storage";
import { nanoid } from "nanoid";

// Realistic professional data for seeding
const professionTitles = [
  "Full Stack Developer", "Frontend Developer", "Backend Developer", "DevOps Engineer",
  "UI/UX Designer", "Product Designer", "Graphic Designer", "Mobile Developer",
  "Data Scientist", "Machine Learning Engineer", "Cloud Architect", "Security Engineer",
  "Product Manager", "Project Manager", "Scrum Master", "Tech Lead",
  "QA Engineer", "Automation Tester", "System Administrator", "Database Administrator",
  "React Developer", "Vue.js Developer", "Angular Developer", "Node.js Developer",
  "Python Developer", "Java Developer", "C# Developer", "PHP Developer",
  "iOS Developer", "Android Developer", "Unity Developer", "Game Developer",
  "WordPress Developer", "Shopify Developer", "Salesforce Developer", "SAP Consultant",
  "Business Analyst", "Data Analyst", "Digital Marketing Specialist", "SEO Specialist",
  "Content Creator", "Technical Writer", "Solution Architect", "Enterprise Architect",
  "Blockchain Developer", "AI/ML Researcher", "Cybersecurity Specialist", "Penetration Tester"
];

const skillSets = [
  ["JavaScript", "React", "Node.js", "TypeScript", "HTML/CSS"],
  ["Python", "Django", "Flask", "MongoDB", "Redis"],
  ["Java", "Spring Boot", "Microservices", "Maven", "JUnit"],
  ["PHP", "Laravel", "MySQL", "Composer", "PHPUnit"],
  ["C#", ".NET Core", "Entity Framework", "Azure", "SQL Server"],
  ["Go", "Docker", "Kubernetes", "AWS", "Linux"],
  ["React Native", "iOS", "Swift", "Xcode", "App Store"],
  ["Android", "Kotlin", "Java", "Firebase", "Google Play"],
  ["UI/UX Design", "Figma", "Adobe Creative Suite", "Prototyping", "User Research"],
  ["Vue.js", "Nuxt.js", "Vuex", "Webpack", "SCSS"],
  ["Angular", "TypeScript", "RxJS", "NgRx", "Material Design"],
  ["DevOps", "CI/CD", "Jenkins", "GitHub Actions", "Terraform"],
  ["AWS", "Lambda", "S3", "EC2", "CloudFormation"],
  ["Machine Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas"],
  ["Data Science", "R", "Tableau", "Power BI", "SQL"],
  ["Blockchain", "Solidity", "Web3", "Ethereum", "Smart Contracts"],
  ["Cybersecurity", "Penetration Testing", "OWASP", "Network Security", "Incident Response"],
  ["Product Management", "Agile", "Scrum", "Jira", "Roadmapping"],
  ["Quality Assurance", "Selenium", "Cypress", "Jest", "Testing Automation"],
  ["WordPress", "WooCommerce", "PHP", "MySQL", "Custom Themes"]
];

const companies = [
  "Microsoft", "Google", "Apple", "Amazon", "Meta", "Netflix", "Spotify", "Uber", "Airbnb", "Slack",
  "Shopify", "Stripe", "Square", "Coinbase", "Robinhood", "Discord", "Zoom", "Adobe", "Salesforce", "Oracle",
  "IBM", "Intel", "NVIDIA", "AMD", "Tesla", "SpaceX", "Palantir", "Snowflake", "MongoDB", "Atlassian",
  "GitHub", "GitLab", "Vercel", "DigitalOcean", "Cloudflare", "Twilio", "SendGrid", "Mailchimp", "HubSpot", "Zendesk",
  "TechCorp", "InnovateX", "CodeCraft", "DevSolutions", "StartupHub", "TechFlow", "DigitalWorks", "CloudTech", "DataForge", "AppFactory"
];

const universities = [
  "MIT", "Stanford University", "Carnegie Mellon", "UC Berkeley", "Harvard", "Yale", "Princeton", "Cornell",
  "University of Washington", "Georgia Tech", "UT Austin", "UCLA", "USC", "NYU", "Columbia", "Caltech",
  "Technical University of Munich", "ETH Zurich", "University of Toronto", "Waterloo", "Oxford", "Cambridge",
  "IIT Delhi", "IIT Bombay", "National University of Singapore", "University of Melbourne", "University of Sydney"
];

const locations = [
  "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA", "Los Angeles, CA",
  "Chicago, IL", "Denver, CO", "Atlanta, GA", "Miami, FL", "Portland, OR", "Remote", "London, UK",
  "Berlin, Germany", "Amsterdam, Netherlands", "Toronto, Canada", "Sydney, Australia", "Singapore",
  "Tel Aviv, Israel", "Dublin, Ireland", "Barcelona, Spain", "Stockholm, Sweden", "Zurich, Switzerland"
];

const bioTemplates = [
  "Passionate {title} with {years} years of experience building scalable applications. Experienced with {skills} and committed to writing clean, maintainable code.",
  "Creative {title} specializing in {domain}. I love solving complex problems and have worked with companies like {company} to deliver exceptional user experiences.",
  "{years}+ years as a {title} with expertise in {skills}. I enjoy mentoring junior developers and contributing to open-source projects.",
  "Senior {title} with a strong background in {domain}. Previously worked at {company} where I led teams and delivered high-impact projects.",
  "Full-stack engineer turned {title}. I bring a unique perspective combining technical expertise with {domain} knowledge to create innovative solutions.",
  "Experienced {title} passionate about {domain}. I've helped startups and enterprises scale their technology and improve their development processes.",
  "Results-driven {title} with {years} years of experience in {domain}. I specialize in {skills} and have a track record of delivering projects on time and within budget."
];

const cvTemplates = [
  `PROFESSIONAL EXPERIENCE

{company1} - {title} (2021 - Present)
• Led development of {project1} using {tech1}, resulting in 40% performance improvement
• Collaborated with cross-functional teams to deliver features for 100k+ users
• Mentored 3 junior developers and established coding standards
• Implemented CI/CD pipelines reducing deployment time by 60%

{company2} - {previousTitle} (2019 - 2021)
• Developed and maintained {project2} using {tech2}
• Optimized database queries resulting in 25% faster response times
• Participated in code reviews and architectural decisions
• Contributed to migration from monolith to microservices architecture

EDUCATION
{university} - Bachelor of Science in Computer Science (2015 - 2019)
• Relevant coursework: Data Structures, Algorithms, Software Engineering
• GPA: 3.8/4.0
• Dean's List recipient

SKILLS
Technical: {skills}
Soft Skills: Team Leadership, Problem Solving, Communication, Project Management

ACHIEVEMENTS
• AWS Certified Solutions Architect
• Open source contributor with 1000+ GitHub stars
• Speaker at TechConf 2023
• Published research paper on {domain}`,

  `SUMMARY
{title} with {years} years of experience in {domain}. Proven track record of delivering high-quality software solutions and leading technical teams.

WORK EXPERIENCE

Senior {title} - {company1} (2020 - Present)
• Architected and implemented {project1} serving 50k+ daily active users
• Led technical interviews and hiring process for engineering team
• Established best practices for {tech1} development
• Reduced system downtime by 95% through infrastructure improvements

{title} - {company2} (2018 - 2020)
• Built {project2} from ground up using {tech2}
• Collaborated with product and design teams on feature development
• Improved application performance by 300% through optimization
• Mentored interns and junior developers

EDUCATION
{university} - Master of Science in Computer Science (2016 - 2018)
{university2} - Bachelor of Engineering (2012 - 2016)

CERTIFICATIONS
• {certification1}
• {certification2}
• Agile Certified Practitioner

PROJECTS
• {project1}: {description1}
• {project2}: {description2}
• Open source library with 500+ GitHub stars`
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateRealisticName(): { firstName: string; lastName: string; email: string } {
  const firstNames = [
    "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn", "Sage", "River",
    "Emma", "Liam", "Olivia", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "William",
    "Mia", "James", "Charlotte", "Benjamin", "Amelia", "Lucas", "Harper", "Henry", "Evelyn", "Alexander",
    "Abigail", "Michael", "Emily", "Daniel", "Elizabeth", "Matthew", "Sofia", "Samuel", "Avery", "David",
    "Ella", "Joseph", "Madison", "Jackson", "Scarlett", "Sebastian", "Victoria", "Jack", "Aria", "Owen",
    "Grace", "Luke", "Chloe", "Gabriel", "Camila", "Anthony", "Penelope", "Isaac", "Riley", "Carter",
    "Layla", "Wyatt", "Lillian", "Julian", "Nora", "Leo", "Zoey", "Christopher", "Mila", "Joshua",
    "Aubrey", "Andrew", "Hannah", "Caleb", "Lily", "Ryan", "Addison", "Adrian", "Eleanor", "Nathan"
  ];
  
  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
    "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
    "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper",
    "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
    "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes"
  ];

  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomElement(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com"])}`;
  
  return { firstName, lastName, email };
}

function generatePortfolioUrl(firstName: string, lastName: string): string {
  const domains = ["portfolio.dev", "dev.to", "github.io", "netlify.app", "vercel.app"];
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  return `https://${username}.${getRandomElement(domains)}`;
}

function generateSocialUrls(firstName: string, lastName: string) {
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  const usernameWithNumbers = `${username}${Math.floor(Math.random() * 100)}`;
  
  return {
    githubUrl: `https://github.com/${usernameWithNumbers}`,
    linkedinUrl: `https://linkedin.com/in/${username}`,
    twitterUrl: Math.random() > 0.5 ? `https://twitter.com/${usernameWithNumbers}` : undefined,
    websiteUrl: Math.random() > 0.7 ? generatePortfolioUrl(firstName, lastName) : undefined
  };
}

function generateBio(name: { firstName: string; lastName: string }, title: string, skills: string[], years: number): string {
  const template = getRandomElement(bioTemplates);
  const company = getRandomElement(companies);
  const domain = getRandomElement(["web development", "mobile apps", "data science", "machine learning", "cloud computing", "cybersecurity", "DevOps", "product design"]);
  
  return template
    .replace("{title}", title)
    .replace("{years}", years.toString())
    .replace("{skills}", skills.slice(0, 3).join(", "))
    .replace("{company}", company)
    .replace("{domain}", domain);
}

function generateCV(name: { firstName: string; lastName: string }, title: string, skills: string[], years: number): string {
  const template = getRandomElement(cvTemplates);
  const company1 = getRandomElement(companies);
  const company2 = getRandomElement(companies.filter(c => c !== company1));
  const university = getRandomElement(universities);
  const university2 = getRandomElement(universities.filter(u => u !== university));
  
  const previousTitles = ["Software Developer", "Junior Developer", "Associate Developer", "Developer", "Engineer"];
  const previousTitle = getRandomElement(previousTitles);
  
  const projects = ["microservices platform", "e-commerce application", "mobile app", "analytics dashboard", "API gateway", "content management system"];
  const project1 = getRandomElement(projects);
  const project2 = getRandomElement(projects.filter(p => p !== project1));
  
  const certifications = ["AWS Certified Developer", "Google Cloud Professional", "Azure Solutions Architect", "Certified Kubernetes Administrator"];
  
  const tech1 = skills.slice(0, 2).join(" and ");
  const tech2 = skills.slice(2, 4).join(" and ");
  
  const domain = getRandomElement(["distributed systems", "machine learning", "cloud architecture", "mobile development", "web security"]);
  
  return template
    .replace(/{title}/g, title)
    .replace(/{years}/g, years.toString())
    .replace(/{company1}/g, company1)
    .replace(/{company2}/g, company2)
    .replace(/{university}/g, university)
    .replace(/{university2}/g, university2)
    .replace(/{previousTitle}/g, previousTitle)
    .replace(/{project1}/g, project1)
    .replace(/{project2}/g, project2)
    .replace(/{tech1}/g, tech1)
    .replace(/{tech2}/g, tech2)
    .replace(/{skills}/g, skills.join(", "))
    .replace(/{certification1}/g, getRandomElement(certifications))
    .replace(/{certification2}/g, getRandomElement(certifications.filter(c => !template.includes(c))))
    .replace(/{domain}/g, domain)
    .replace(/{description1}/g, `A scalable ${project1} built with ${tech1}`)
    .replace(/{description2}/g, `An innovative ${project2} using ${tech2}`);
}

function generateHourlyRate(seniorityLevel: string): number {
  const rates = {
    junior: [25, 45],
    mid: [45, 75],
    senior: [75, 120],
    lead: [100, 150],
    principal: [130, 200]
  };
  
  const [min, max] = rates[seniorityLevel as keyof typeof rates];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateYearsOfExperience(seniorityLevel: string): number {
  const years = {
    junior: [0, 2],
    mid: [2, 5],
    senior: [5, 10],
    lead: [8, 15],
    principal: [12, 20]
  };
  
  const [min, max] = years[seniorityLevel as keyof typeof years];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class ProfessionalUsersSeeder {
  async seed(count: number = 120): Promise<void> {
    console.log(`🌱 Starting professional users seeding with ${count} users...`);
    
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < count; i++) {
      try {
        // Generate realistic user data
        const name = generateRealisticName();
        const title = getRandomElement(professionTitles);
        const skills = getRandomElements(getRandomElement(skillSets), Math.floor(Math.random() * 3) + 3);
        const seniorityLevel = getRandomElement(["junior", "mid", "senior", "lead", "principal"]);
        const availability = getRandomElement(["available", "partially_available", "unavailable"]);
        const years = generateYearsOfExperience(seniorityLevel);
        const hourlyRate = generateHourlyRate(seniorityLevel);
        const socialUrls = generateSocialUrls(name.firstName, name.lastName);
        
        // Check if user already exists
        const existingUser = await storage.getUserByEmail(name.email);
        if (existingUser) {
          skipped++;
          continue;
        }

        // Create user account
        const hashedPassword = await bcrypt.hash("password123", 10);
        const user = await storage.createUser({
          email: name.email,
          password: hashedPassword,
          firstName: name.firstName,
          lastName: name.lastName,
          userType: "PROFESSIONAL"
          // Removed profileImageUrl as it's not part of the RegisterUser type
        });

        // Update user with profile image URL
        const profileImageUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.firstName}${name.lastName}`;
        await storage.updateUser(user.id, { profileImageUrl });

        // Update user with language preference
        const language = getRandomElement(["en", "es", "fr", "de", "pt", "it"]);
        await storage.updateUser(user.id, { language });

        // Create professional profile
        await storage.createProfessionalProfile({
          userId: user.id,
          title,
          bio: generateBio(name, title, skills, years),
          cv: generateCV(name, title, skills, years),
          skills,
          seniorityLevel: seniorityLevel as any,
          hourlyRate: hourlyRate,
          availability: availability as any,
          portfolioUrl: generatePortfolioUrl(name.firstName, name.lastName),
          ...socialUrls
        });

        created++;
        if (created % 10 === 0) {
          console.log(`   Created ${created}/${count} professional users...`);
        }

      } catch (error) {
        errors++;
        console.error(`Error creating user ${i + 1}:`, error);
      }
    }

    console.log(`✅ Seeding completed!`);
    console.log(`   📊 Results: ${created} created, ${skipped} skipped, ${errors} errors`);
    console.log(`   👥 Total professional users in database: ${created}`);
  }

  async clearExistingSeededUsers(): Promise<void> {
    console.log("🧹 Clearing existing seeded users...");
    
    try {
      // This is a simplified approach - in production you'd want more sophisticated cleanup
      console.log("Skipping cleanup - manual deletion required for safety");
    } catch (error) {
      console.error("Error during cleanup:", error);
    }
  }
}

// Export for use in other files
export const professionalUsersSeeder = new ProfessionalUsersSeeder();