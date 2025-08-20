#!/usr/bin/env tsx

import { db } from "../server/db";
import { 
  users, 
  professionalProfiles, 
  companyProfiles, 
  projects, 
  projectApplications,
  notifications,
  type User,
  type Project,
  type InsertUser,
  type InsertProfessionalProfile,
  type InsertCompanyProfile,
  type InsertProject
} from "../shared/schema";
import { eq, sql } from "drizzle-orm";

// Realistic seed data using translation keys
const professionalData = [
  {
    firstName: "Marco", lastName: "Rossi", email: "marco.rossi@example.com",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    bio: "Senior Full-Stack Developer with 8+ years in modern web development. Passionate about creating scalable applications.",
    location: "Milan, Italy", hourlyRate: 75, yearsExperience: 8,
    availability: "full_time", seniorityLevel: "senior"
  },
  {
    firstName: "Sofia", lastName: "García", email: "sofia.garcia@example.com", 
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
    bio: "Backend specialist focused on API development and microservices architecture.",
    location: "Barcelona, Spain", hourlyRate: 65, yearsExperience: 6,
    availability: "part_time", seniorityLevel: "mid"
  },
  {
    firstName: "James", lastName: "Wilson", email: "james.wilson@example.com",
    skills: ["Vue.js", "JavaScript", "CSS", "Figma"],
    bio: "Frontend developer with strong design skills and UX/UI expertise.",
    location: "London, UK", hourlyRate: 55, yearsExperience: 4,
    availability: "freelance", seniorityLevel: "mid"
  },
  {
    firstName: "Emma", lastName: "Mueller", email: "emma.mueller@example.com",
    skills: ["Java", "Spring Boot", "MySQL", "AWS"],
    bio: "Enterprise software developer specializing in scalable backend systems.",
    location: "Berlin, Germany", hourlyRate: 80, yearsExperience: 10,
    availability: "full_time", seniorityLevel: "senior"
  },
  {
    firstName: "Luca", lastName: "Ferrari", email: "luca.ferrari@example.com",
    skills: ["Flutter", "Dart", "Firebase", "Mobile"],
    bio: "Mobile app developer creating cross-platform solutions for startups.",
    location: "Rome, Italy", hourlyRate: 60, yearsExperience: 5,
    availability: "freelance", seniorityLevel: "mid"
  }
];

const companyData = [
  {
    firstName: "Anna", lastName: "Tech", email: "anna@techstartup.com",
    companyName: "TechStartup", industry: "technology", 
    description: "Innovative startup creating the future of digital experiences",
    location: "San Francisco, CA", companySize: "11-50"
  },
  {
    firstName: "David", lastName: "Solutions", email: "david@innovate.com",
    companyName: "InnovateHub", industry: "consulting",
    description: "Digital transformation consultancy helping businesses modernize",
    location: "New York, NY", companySize: "51-200"
  },
  {
    firstName: "Maria", lastName: "Creative", email: "maria@creative.com", 
    companyName: "Creative Agency", industry: "marketing",
    description: "Full-service digital agency specializing in brand experiences",
    location: "Los Angeles, CA", companySize: "11-50"
  }
];

const projectTemplates = [
  {
    title: "E-commerce Platform Development",
    description: "Build a modern e-commerce platform with React frontend and Node.js backend. Features include user authentication, product catalog, shopping cart, and payment integration.",
    requiredSkills: ["React", "Node.js", "MongoDB", "Stripe API"],
    seniorityLevel: "mid", contractType: "project_based", teamSize: 3,
    budgetMin: 15000, budgetMax: 25000, estimatedHours: 400
  },
  {
    title: "Mobile Banking App UI/UX Redesign", 
    description: "Complete redesign of mobile banking application focusing on user experience and accessibility. Include prototyping, user testing, and implementation guidelines.",
    requiredSkills: ["Figma", "UI/UX Design", "Mobile Design", "Prototyping"],
    seniorityLevel: "senior", contractType: "project_based", teamSize: 2,
    budgetMin: 20000, budgetMax: 35000, estimatedHours: 300
  },
  {
    title: "API Development for SaaS Platform",
    description: "Develop REST API for B2B SaaS platform with authentication, data analytics, and third-party integrations. Focus on scalability and security.",
    requiredSkills: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    seniorityLevel: "senior", contractType: "project_based", teamSize: 4,
    budgetMin: 30000, budgetMax: 50000, estimatedHours: 600
  },
  {
    title: "WordPress Site Migration & Optimization",
    description: "Migrate existing WordPress sites to modern hosting, optimize performance, and implement SEO best practices.",
    requiredSkills: ["WordPress", "PHP", "MySQL", "SEO"],
    seniorityLevel: "junior", contractType: "project_based", teamSize: 2,
    budgetMin: 5000, budgetMax: 8000, estimatedHours: 150
  },
  {
    title: "React Native App Development",
    description: "Build cross-platform mobile app for food delivery service with real-time tracking, payments, and push notifications.",
    requiredSkills: ["React Native", "JavaScript", "Firebase", "Stripe"],
    seniorityLevel: "mid", contractType: "project_based", teamSize: 3,
    budgetMin: 25000, budgetMax: 40000, estimatedHours: 500
  }
];

async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data in correct order (respect foreign keys)
    console.log("🧹 Clearing existing data...");
    try {
      // Delete in reverse dependency order
      await db.delete(notifications);
      await db.delete(projectApplications);
      
      // Handle project dependencies
      const projectLikesResult = await db.execute(sql`DELETE FROM project_likes`);
      const projectCommentsResult = await db.execute(sql`DELETE FROM project_comments`); 
      const projectSubscriptionsResult = await db.execute(sql`DELETE FROM project_subscriptions`);
      
      await db.delete(projects);
      
      // Handle post dependencies
      const postLikesResult = await db.execute(sql`DELETE FROM post_likes`);
      const postCommentsResult = await db.execute(sql`DELETE FROM post_comments`);
      const postsResult = await db.execute(sql`DELETE FROM posts`);
      
      // Delete profiles and users last
      await db.delete(companyProfiles);
      await db.delete(professionalProfiles);
      
      // Handle other user dependencies
      const messagesResult = await db.execute(sql`DELETE FROM messages`);
      const connectionsResult = await db.execute(sql`DELETE FROM connections`);
      
      await db.delete(users);
      
      console.log("✅ Successfully cleared all existing data");
    } catch (clearError) {
      console.warn("⚠️  Some tables might not exist yet, continuing with seeding...");
    }
    
    console.log("✅ Cleared existing data");

    // Seed professionals
    const professionals: User[] = [];
    for (let i = 0; i < 50; i++) {
      const baseProfile = professionalData[i % professionalData.length];
      const uniqueEmail = `${baseProfile.firstName.toLowerCase()}${i + 1}@example.com`;
      
      const [user] = await db.insert(users).values({
        email: uniqueEmail,
        password: "password123", // In real app, this would be hashed
        firstName: baseProfile.firstName,
        lastName: `${baseProfile.lastName}${i > 4 ? i - 4 : ''}`,
        userType: "professional",
        language: ["en", "it", "es"][i % 3] // Mix of languages
      }).returning();

      await db.insert(professionalProfiles).values({
        userId: user.id,
        bio: baseProfile.bio,
        skills: baseProfile.skills,
        yearsExperience: baseProfile.yearsExperience + (i % 3),
        hourlyRate: (baseProfile.hourlyRate + (i * 5)).toString(),
        availability: baseProfile.availability,
        seniorityLevel: baseProfile.seniorityLevel,
        location: baseProfile.location,
        isAvailable: i % 4 !== 0 // 75% available
      });

      professionals.push(user);
    }
    
    console.log("✅ Created 50 professional profiles");

    // Seed companies with projects
    const companies: User[] = [];
    const allProjects: (Project & { companyUser: User })[] = [];
    
    for (let i = 0; i < 10; i++) {
      const baseCompany = companyData[i % companyData.length];
      const uniqueEmail = `company${i + 1}@${baseCompany.companyName.toLowerCase()}.com`;
      
      const [user] = await db.insert(users).values({
        email: uniqueEmail,
        password: "password123",
        firstName: baseCompany.firstName,
        lastName: `${baseCompany.lastName}${i > 2 ? i - 2 : ''}`,
        userType: "company",
        language: ["en", "it", "es"][i % 3]
      }).returning();

      await db.insert(companyProfiles).values({
        userId: user.id,
        companyName: `${baseCompany.companyName}${i > 2 ? ' ' + (i - 2) : ''}`,
        industry: baseCompany.industry,
        description: baseCompany.description,
        location: baseCompany.location,
        companySize: baseCompany.companySize,
        website: `https://${baseCompany.companyName.toLowerCase()}${i > 2 ? i - 2 : ''}.com`
      });

      companies.push(user);

      // Create 2-3 projects per company
      const projectCount = 2 + (i % 2); // 2 or 3 projects
      for (let j = 0; j < projectCount; j++) {
        const projectTemplate = projectTemplates[(i * 3 + j) % projectTemplates.length];
        
        const [project] = await db.insert(projects).values({
          companyUserId: user.id,
          title: `${projectTemplate.title} ${i > 2 ? `(${i - 2})` : ''}`,
          description: projectTemplate.description,
          requiredSkills: projectTemplate.requiredSkills,
          seniorityLevel: projectTemplate.seniorityLevel,
          contractType: projectTemplate.contractType,
          teamSize: projectTemplate.teamSize,
          budgetMin: projectTemplate.budgetMin.toString(),
          budgetMax: projectTemplate.budgetMax.toString(),
          estimatedHours: projectTemplate.estimatedHours,
          status: "open",
          isRemote: true,
          location: baseCompany.location
        }).returning();

        allProjects.push({ ...project, companyUser: user });
      }
    }
    
    console.log("✅ Created 10 companies with 20-30 projects");

    // Seed applications with realistic distribution
    let applicationsCount = 0;
    let fullProjectsCount = 0;
    
    for (const project of allProjects) {
      const shouldBeFull = fullProjectsCount < 2; // Make first 2 projects full
      const maxApplications = shouldBeFull ? (project.teamSize || 1) + 5 : Math.floor(Math.random() * 10) + 1;
      const applicationCount = Math.min(maxApplications, professionals.length);
      
      // Shuffle professionals and take first N
      const shuffledProfessionals = [...professionals].sort(() => Math.random() - 0.5);
      const applicants = shuffledProfessionals.slice(0, applicationCount);
      
      let acceptedCount = 0;
      const maxAccepted = shouldBeFull ? (project.teamSize || 1) : Math.floor(applicationCount * 0.3);
      
      for (const professional of applicants) {
        const status = acceptedCount < maxAccepted && Math.random() > 0.3 ? 'accepted' : 
                       Math.random() > 0.7 ? 'rejected' : 'pending';
        
        if (status === 'accepted') acceptedCount++;
        
        const appliedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
        const respondedAt = status !== 'pending' ? 
          new Date(appliedAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000) : null;
        
        await db.insert(projectApplications).values({
          projectId: project.id,
          userId: professional.id,
          status,
          coverLetter: `I'm excited to apply for ${project.title}. With my experience in the required technologies, I believe I can contribute effectively to this project. My background includes relevant experience that aligns with your needs.`,
          proposedRate: "65.00",
          appliedAt,
          respondedAt,
          respondedBy: respondedAt ? project.companyUserId : null
        });
        
        applicationsCount++;
        
        // Create notification for company when application received
        await db.insert(notifications).values({
          userId: project.companyUserId,
          type: 'application_received',
          title: 'New Application Received',
          message: `${professional.firstName} ${professional.lastName} applied to ${project.title}`,
          relatedId: project.id,
          relatedUserId: professional.id,
          isRead: Math.random() > 0.5
        });
        
        // Create notification for professional when application responded
        if (status !== 'pending') {
          await db.insert(notifications).values({
            userId: professional.id,
            type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
            title: `Application ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
            message: `Your application for ${project.title} has been ${status}`,
            relatedId: project.id,
            relatedUserId: project.companyUserId,
            isRead: Math.random() > 0.3
          });
        }
      }
      
      // Update project status if full
      if (acceptedCount >= (project.teamSize || 1)) {
        await db.update(projects)
          .set({ status: "assigned" })
          .where(eq(projects.id, project.id));
        fullProjectsCount++;
      }
      
      console.log(`📝 Project "${project.title}" - ${applicationCount} applications, ${acceptedCount} accepted${acceptedCount >= (project.teamSize || 1) ? ' (FULL)' : ''}`);
    }
    
    console.log(`✅ Created ${applicationsCount} applications with realistic status distribution`);
    console.log(`🔒 ${fullProjectsCount} projects are full (testing blocking logic)`);
    
    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📋 Test accounts created:");
    console.log("👨‍💻 Professional: marco.rossi1@example.com / password123");
    console.log("👩‍💻 Professional: sofia.garcia2@example.com / password123"); 
    console.log("🏢 Company: company1@techstartup.com / password123");
    console.log("🏢 Company: company2@innovatehub.com / password123");
    console.log("\n✨ You can now test the complete job applications flow!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run seeder
seedDatabase();