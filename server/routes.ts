import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, isAuthenticated as sessionAuth } from "./auth";
import { setupAuth } from "./replitAuth";
import {
  insertProfessionalProfileSchema,
  insertCompanyProfileSchema,
  insertProjectSchema,
  insertPostSchema,
  insertMessageSchema,
  insertFeedbackSchema,
  insertNotificationPreferencesSchema,
  insertProjectApplicationSchema,
  registerUserSchema,
  loginUserSchema,
  connections,
} from "@shared/schema";
import { notificationService, createMessageNotification, createLikeNotification, createCommentLikeNotification, createProjectLikeNotification, createCommentNotification, createFeedbackNotification } from "./notifications";

// Helper function to create connection notifications
async function createNotification(userId: string, type: string, title: string, message: string, relatedId?: string, relatedUserId?: string) {
  try {
    await storage.createNotification({
      userId,
      type: type as any,
      title,
      message,
      relatedId,
      relatedUserId,
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { z } from "zod";
import OpenAI from "openai";
import { translateMessage, getUserLanguage } from "./translations";
import { JobImportService } from "./job-import-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: translateMessage("User already exists with this email") });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        userType: validatedData.userType,
      });

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: translateMessage("Failed to register user") });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: translateMessage("Invalid email or password") });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: translateMessage("Invalid email or password") });
      }

      // Set session
      req.session.userId = user.id;

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: translateMessage("Failed to login") });
    }
  });

  app.post('/api/auth/logout', async (req: any, res) => {
    const userId = req.session?.userId;
    const userLang = userId ? await getUserLanguage(userId, storage) : 'en';
    
    req.session.destroy((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: translateMessage("Failed to logout", userLang) });
      }
      res.clearCookie('connect.sid');
      res.json({ message: translateMessage("Logged out successfully", userLang) });
    });
  });

  app.get('/api/auth/user', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      if (!user) {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(404).json({ message: translateMessage("User not found", userLang) });
      }
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      const userId = req.user?.claims?.sub;
      const userLang = userId ? await getUserLanguage(userId, storage) : 'en';
      res.status(500).json({ message: translateMessage("Failed to fetch user", userLang) });
    }
  });

  // Update user language preference
  app.put('/api/auth/user/language', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const { language } = req.body;
      
      if (!language || typeof language !== 'string') {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(400).json({ message: translateMessage("Language is required", userLang) });
      }
      
      const updatedUser = await storage.updateUserLanguage(userId, language);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user language:", error);
      const userId = req.user?.claims?.sub;
      const userLang = userId ? await getUserLanguage(userId, storage) : 'en';
      res.status(500).json({ message: translateMessage("Failed to update language preference", userLang) });
    }
  });

  // Profile routes
  app.get('/api/profile/professional/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getProfessionalProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: translateMessage("Professional profile not found") });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching professional profile:", error);
      res.status(500).json({ message: translateMessage("Failed to fetch professional profile") });
    }
  });

  app.post('/api/profile/professional', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const profileData = insertProfessionalProfileSchema.parse({
        ...req.body,
        userId,
      });
      const profile = await storage.createProfessionalProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating professional profile:", error);
      const userId = req.user?.claims?.sub;
      const userLang = userId ? await getUserLanguage(userId, storage) : 'en';
      res.status(500).json({ message: translateMessage("Failed to create professional profile", userLang) });
    }
  });

  app.put('/api/profile/professional', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const profileData = insertProfessionalProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfessionalProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating professional profile:", error);
      const userId = req.user?.claims?.sub;
      const userLang = userId ? await getUserLanguage(userId, storage) : 'en';
      res.status(500).json({ message: translateMessage("Failed to update professional profile", userLang) });
    }
  });

  app.get('/api/profile/company/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getCompanyProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: translateMessage("Company profile not found") });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: translateMessage("Failed to fetch company profile") });
    }
  });

  app.post('/api/profile/company', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const profileData = insertCompanyProfileSchema.parse({
        ...req.body,
        userId,
      });
      const profile = await storage.createCompanyProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error creating company profile:", error);
      res.status(500).json({ message: "Failed to create company profile" });
    }
  });

  // Company listing and detail routes
  app.get('/api/companies', async (req: any, res) => {
    try {
      // Exclude current user's company if authenticated
      const excludeUserId = req.session?.userId;
      const companies = await storage.getCompanies(excludeUserId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const company = await storage.getCompanyWithProjects(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company details:", error);
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });

  // Professional routes
  app.get('/api/professionals', async (req: any, res) => {
    try {
      const professionals = await storage.searchProfessionals({});
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  app.get('/api/professionals/search', async (req: any, res) => {
    try {
      const { skills, availability, seniorityLevel, minRate, maxRate } = req.query;
      
      const filters: any = {};
      if (skills) filters.skills = Array.isArray(skills) ? skills : [skills];
      if (availability) filters.availability = availability as string;
      if (seniorityLevel) filters.seniorityLevel = seniorityLevel as string;
      if (minRate) filters.minRate = parseFloat(minRate as string);
      if (maxRate) filters.maxRate = parseFloat(maxRate as string);
      
      // Exclude current user if authenticated
      if (req.session?.userId) {
        filters.excludeUserId = req.session.userId;
      }

      const professionals = await storage.searchProfessionals(filters);
      res.json(professionals);
    } catch (error) {
      console.error("Error searching professionals:", error);
      res.status(500).json({ message: "Failed to search professionals" });
    }
  });

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const { status, companyUserId } = req.query;
      const projects = await storage.getProjects({
        status: status as string,
        companyUserId: companyUserId as string,
      });
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', sessionAuth, async (req: any, res) => {
    try {
      const companyUserId = req.session.userId!;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        companyUserId,
      });
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      
      // Handle validation errors with specific budget preventive messages
      if (error instanceof Error && error.message.includes("Budget")) {
        return res.status(400).json({ 
          message: error.message,
          type: "validation_error"
        });
      }
      
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', sessionAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Verify project ownership
      const project = await storage.getProject(id);
      if (!project || project.companyUserId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this project" });
      }

      const updateData = req.body;
      const updatedProject = await storage.updateProject(id, updateData);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      
      // Handle validation errors with specific budget preventive messages
      if (error instanceof Error && error.message.includes("Budget")) {
        return res.status(400).json({ 
          message: error.message,
          type: "validation_error"
        });
      }
      
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Project application routes
  // Apply to a project - professionals only
  app.post('/api/projects/:id/apply', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: projectId } = req.params;
      const applicationData = insertProjectApplicationSchema.parse({
        ...req.body,
        projectId,
        userId
      });
      
      // Check if user already applied
      const existingApplication = await storage.hasUserAppliedToProject(projectId, userId);
      if (existingApplication) {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(400).json({ message: translateMessage("You have already applied to this project", userLang) });
      }
      
      // Check if project has available spots
      const project = await storage.getProject(projectId);
      if (!project) {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(404).json({ message: translateMessage("Project not found", userLang) });
      }
      
      const acceptedCount = await storage.getAcceptedApplicationsCount(projectId);
      if (acceptedCount >= (project.teamSize || 1)) {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(400).json({ message: translateMessage("This project team is full", userLang) });
      }
      
      const application = await storage.createProjectApplication(applicationData);
      
      // Notify the project owner
      const companyLang = await getUserLanguage(project.companyUserId, storage);
      await storage.createNotification({
        userId: project.companyUserId,
        type: 'application_received',
        title: translateMessage('notifications.applicationReceived', companyLang),
        message: translateMessage('notifications.applicationReceivedDetails', companyLang),
        relatedId: application.id,
        relatedUserId: userId
      });
      
      res.json(application);
    } catch (error) {
      console.error('Error applying to project:', error);
      const userId = req.user?.claims?.sub;
      const userLang = userId ? await getUserLanguage(userId, storage) : 'en';
      res.status(500).json({ message: translateMessage("Failed to apply to project", userLang) });
    }
  });
  
  // Get applications for a project - company owners only
  app.get('/api/projects/:id/applications', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: projectId } = req.params;
      
      // Check if user owns this project
      const project = await storage.getProject(projectId);
      if (!project) {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(404).json({ message: translateMessage("Project not found", userLang) });
      }
      
      if (project.companyUserId !== userId) {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(403).json({ message: translateMessage("You can only view applications for your own projects", userLang) });
      }
      
      const applications = await storage.getProjectApplications(projectId);
      res.json(applications);
    } catch (error) {
      console.error('Error fetching project applications:', error);
      const userId = req.user?.claims?.sub;
      const userLang = userId ? await getUserLanguage(userId, storage) : 'en';
      res.status(500).json({ message: translateMessage("Failed to fetch applications", userLang) });
    }
  });
  
  // Update application status - company owners only
  app.patch('/api/applications/:id/status', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: applicationId } = req.params;
      const { status } = req.body;
      
      if (!['accepted', 'rejected'].includes(status)) {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(400).json({ message: translateMessage("Invalid status", userLang) });
      }
      
      const application = await storage.getProjectApplicationById(applicationId);
      if (!application) {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(404).json({ message: translateMessage("Application not found", userLang) });
      }
      
      // Check if user owns the project
      const project = await storage.getProject(application.projectId);
      if (!project || project.companyUserId !== userId) {
        const userLang = await getUserLanguage(userId, storage);
        return res.status(403).json({ message: translateMessage("You can only manage applications for your own projects", userLang) });
      }
      
      // Check if team is already full when accepting
      if (status === 'accepted') {
        const acceptedCount = await storage.getAcceptedApplicationsCount(application.projectId);
        if (acceptedCount >= (project.teamSize || 1)) {
          const userLang = await getUserLanguage(userId, storage);
          return res.status(400).json({ message: translateMessage("Project team is already full", userLang) });
        }
      }
      
      const updatedApplication = status === 'accepted' 
        ? await storage.acceptProjectApplication(applicationId, userId)
        : await storage.rejectProjectApplication(applicationId, userId);
      
      // Notify the applicant
      const notificationType = status === 'accepted' ? 'application_accepted' : 'application_rejected';
      await storage.createNotification({
        userId: application.userId,
        type: notificationType,
        title: translateMessage(
          status === 'accepted' ? 'notifications.applicationAccepted' : 'notifications.applicationRejected',
          await getUserLanguage(application.userId, storage)
        ),
        message: translateMessage(
          status === 'accepted' ? 'notifications.applicationAcceptedDetails' : 'notifications.applicationRejectedDetails',
          await getUserLanguage(application.userId, storage)
        ),
        relatedId: application.projectId,
        relatedUserId: userId
      });
      
      res.json(updatedApplication);
    } catch (error) {
      console.error('Error updating application status:', error);
      const userId = req.user?.claims?.sub;
      const userLang = userId ? await getUserLanguage(userId, storage) : 'en';
      res.status(500).json({ message: translateMessage("Failed to update application status", userLang) });
    }
  });
  
  // Get user's application status for a specific project
  app.get('/api/projects/:id/application-status', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id: projectId } = req.params;
      
      const application = await storage.getUserProjectApplication(projectId, userId);
      if (!application) {
        return res.json({ hasApplied: false, application: null });
      }
      
      res.json({ hasApplied: true, application });
    } catch (error) {
      console.error('Error checking application status:', error);
      const userId = req.user?.claims?.sub;
      const userLang = userId ? await getUserLanguage(userId, storage) : 'en';
      res.status(500).json({ message: translateMessage("Failed to check application status", userLang) });
    }
  });
  
  // Get accepted applications count for a project
  app.get('/api/projects/:id/accepted-count', async (req, res) => {
    try {
      const { id: projectId } = req.params;
      const count = await storage.getAcceptedApplicationsCount(projectId);
      res.json({ count });
    } catch (error) {
      console.error('Error getting accepted applications count:', error);
      res.status(500).json({ message: translateMessage("Failed to get accepted applications count") });
    }
  });
  
  // Project subscription routes
  app.post('/api/projects/:id/subscribe', sessionAuth, async (req: any, res) => {
    try {
      const { id: projectId } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if project exists and is open
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.status !== 'open') {
        return res.status(400).json({ message: "Can only subscribe to open projects" });
      }
      
      // Check if already subscribed
      const isSubscribed = await storage.isSubscribedToProject(projectId, userId);
      if (isSubscribed) {
        return res.status(400).json({ message: "Already subscribed to this project" });
      }
      
      await storage.subscribeToProject(projectId, userId);
      res.json({ success: true, message: "Successfully subscribed to project" });
    } catch (error) {
      console.error("Error subscribing to project:", error);
      res.status(500).json({ message: "Failed to subscribe to project" });
    }
  });

  app.delete('/api/projects/:id/subscribe', sessionAuth, async (req: any, res) => {
    try {
      const { id: projectId } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.unsubscribeFromProject(projectId, userId);
      res.json({ success: true, message: "Successfully unsubscribed from project" });
    } catch (error) {
      console.error("Error unsubscribing from project:", error);
      res.status(500).json({ message: "Failed to unsubscribe from project" });
    }
  });

  app.get('/api/projects/:id/subscription-status', sessionAuth, async (req: any, res) => {
    try {
      const { id: projectId } = req.params;
      const userId = req.user.claims.sub;
      
      const isSubscribed = await storage.isSubscribedToProject(projectId, userId);
      res.json({ isSubscribed });
    } catch (error) {
      console.error("Error checking subscription status:", error);
      res.status(500).json({ message: "Failed to check subscription status" });
    }
  });

  app.get('/api/user/subscriptions', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await storage.getUserProjectSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Project preventives routes
  app.get('/api/preventives', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const { category } = req.query;
      
      let preventives;
      if (category) {
        preventives = await storage.getProjectPreventivesByCategory(userId, category as string);
      } else {
        preventives = await storage.getProjectPreventives(userId);
      }
      
      res.json(preventives);
    } catch (error) {
      console.error("Error fetching preventives:", error);
      res.status(500).json({ message: "Failed to fetch preventives" });
    }
  });

  app.post('/api/preventives', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const preventiveData = {
        ...req.body,
        userId,
      };
      
      const preventive = await storage.createProjectPreventive(preventiveData);
      res.json(preventive);
    } catch (error) {
      console.error("Error creating preventive:", error);
      res.status(500).json({ message: "Failed to create preventive" });
    }
  });

  app.get('/api/preventives/:id', sessionAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      const preventive = await storage.getProjectPreventive(id, userId);
      if (!preventive) {
        return res.status(404).json({ message: "Preventive not found" });
      }
      
      res.json(preventive);
    } catch (error) {
      console.error("Error fetching preventive:", error);
      res.status(500).json({ message: "Failed to fetch preventive" });
    }
  });

  app.put('/api/preventives/:id', sessionAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      const preventive = await storage.updateProjectPreventive(id, userId, req.body);
      if (!preventive) {
        return res.status(404).json({ message: "Preventive not found or not authorized" });
      }
      
      res.json(preventive);
    } catch (error) {
      console.error("Error updating preventive:", error);
      res.status(500).json({ message: "Failed to update preventive" });
    }
  });

  app.delete('/api/preventives/:id', sessionAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      await storage.deleteProjectPreventive(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting preventive:", error);
      res.status(500).json({ message: "Failed to delete preventive" });
    }
  });

  // Generate new preventive using AI
  app.post('/api/preventives/generate', sessionAuth, async (req: any, res) => {
    try {
      const { category, projectContext } = req.body;
      const userId = req.session.userId!;
      
      // Use OpenAI to generate a new preventive
      const openai = new (await import('openai')).default({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `Generate a project validation preventive measure for the "${category}" category.
      
Project context: ${projectContext || 'General project management'}

Return a JSON object with:
- title: Short descriptive title (max 50 chars)
- description: Detailed explanation of why this preventive is important
- validationRule: JSON object describing the validation logic
- errorMessage: User-friendly error message when validation fails
- category: "${category}"

Example validation rules:
- For budget: {"field": "budgetMax", "operator": "lessThan", "value": 500000, "message": "Budget exceeds company limit"}
- For timeline: {"field": "estimatedHours", "operator": "greaterThan", "value": 40, "condition": "teamSize === 1", "message": "Single developer projects over 40 hours need approval"}
- For team: {"field": "teamSize", "operator": "lessThanOrEqual", "value": 10, "message": "Team size cannot exceed 10 members"}

Make the preventive specific, practical, and helpful for project management.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const generatedPreventive = JSON.parse(response.choices[0].message.content || '{}');
      
      // Create the preventive in database
      const preventiveData = {
        userId,
        title: generatedPreventive.title,
        description: generatedPreventive.description,
        validationRule: JSON.stringify(generatedPreventive.validationRule),
        errorMessage: generatedPreventive.errorMessage,
        category: category,
        isActive: true,
        isGlobal: false,
      };

      const preventive = await storage.createProjectPreventive(preventiveData);
      res.json(preventive);
    } catch (error) {
      console.error("Error generating preventive:", error);
      res.status(500).json({ message: "Failed to generate preventive" });
    }
  });

  // Project applications routes
  app.post('/api/projects/:projectId/apply', sessionAuth, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.session.userId!;
      const { coverLetter, proposedRate } = req.body;
      
      // Check if user has already applied
      const hasApplied = await storage.hasUserAppliedToProject(projectId, userId);
      if (hasApplied) {
        return res.status(400).json({ message: "You have already applied to this project" });
      }
      
      // Verify project exists and is open
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.status !== "open") {
        return res.status(400).json({ message: "This project is no longer accepting applications" });
      }
      
      const applicationData = {
        projectId,
        userId,
        coverLetter,
        proposedRate,
        status: "pending" as const,
      };
      
      const application = await storage.createProjectApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get('/api/projects/:projectId/applications', sessionAuth, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.session.userId!;
      
      // Verify project ownership
      const project = await storage.getProject(projectId);
      if (!project || project.companyUserId !== userId) {
        return res.status(403).json({ message: "Not authorized to view applications for this project" });
      }
      
      const applications = await storage.getProjectApplications(projectId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/applications/:applicationId', sessionAuth, async (req: any, res) => {
    try {
      const { applicationId } = req.params;
      const userId = req.session.userId!;
      
      // Get all applications (we'll need to improve this)
      const allProjects = await storage.getProjects({});
      let application: any = null;
      
      for (const project of allProjects) {
        const applications = await storage.getProjectApplications(project.id);
        const found = applications.find(app => app.id === applicationId);
        if (found) {
          application = found;
          break;
        }
      }
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.post('/api/applications/:applicationId/accept', sessionAuth, async (req: any, res) => {
    try {
      const { applicationId } = req.params;
      const userId = req.session.userId!;
      
      // Get application details first
      const allProjects = await storage.getProjects({});
      let application: any = null;
      
      for (const project of allProjects) {
        const applications = await storage.getProjectApplications(project.id);
        const found = applications.find(app => app.id === applicationId);
        if (found) {
          application = found;
          break;
        }
      }
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Verify project ownership
      const project = await storage.getProject(application.projectId);
      if (!project || project.companyUserId !== userId) {
        return res.status(403).json({ message: "Not authorized to accept this application" });
      }
      
      const updatedApplication = await storage.acceptProjectApplication(applicationId, userId);
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error accepting application:", error);
      res.status(500).json({ message: "Failed to accept application" });
    }
  });

  app.post('/api/applications/:applicationId/reject', sessionAuth, async (req: any, res) => {
    try {
      const { applicationId } = req.params;
      const userId = req.session.userId!;
      
      // Get application details first
      const allProjects = await storage.getProjects({});
      let application: any = null;
      
      for (const project of allProjects) {
        const applications = await storage.getProjectApplications(project.id);
        const found = applications.find(app => app.id === applicationId);
        if (found) {
          application = found;
          break;
        }
      }
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Verify project ownership
      const project = await storage.getProject(application.projectId);
      if (!project || project.companyUserId !== userId) {
        return res.status(403).json({ message: "Not authorized to reject this application" });
      }
      
      const updatedApplication = await storage.rejectProjectApplication(applicationId, userId);
      res.json(updatedApplication);
    } catch (error) {
      console.error("Error rejecting application:", error);
      res.status(500).json({ message: "Failed to reject application" });
    }
  });

  app.get('/api/user/applications', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const applications = await storage.getUserApplications(userId);
      res.json(applications);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/projects/:projectId/accepted-count', async (req, res) => {
    try {
      const { projectId } = req.params;
      const count = await storage.getAcceptedApplicationsCount(projectId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching accepted count:", error);
      res.status(500).json({ message: "Failed to fetch accepted count" });
    }
  });

  // Post routes
  app.get('/api/posts', async (req, res) => {
    try {
      const { userId, isPublic } = req.query;
      const filters: { userId?: string; isPublic?: boolean } = {};
      
      if (userId) {
        filters.userId = userId as string;
      }
      
      if (isPublic !== undefined) {
        filters.isPublic = isPublic === 'true';
      }
      
      const posts = await storage.getPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const postData = insertPostSchema.parse({
        ...req.body,
        userId,
      });
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.put('/api/posts/:postId', sessionAuth, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const { content } = req.body;
      const userId = req.session.userId!;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Content is required" });
      }

      const updatedPost = await storage.updatePost(postId, userId, content);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      if ((error as Error).message?.includes("not authorized")) {
        return res.status(403).json({ message: "Not authorized to edit this post" });
      }
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete('/api/posts/:postId', sessionAuth, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId!;
      
      await storage.deletePost(postId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      if ((error as Error).message?.includes("not authorized")) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  app.post('/api/posts/:postId/like', sessionAuth, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId!;
      await storage.likePost(postId, userId);
      
      // Get post details to notify the author
      const posts = await storage.getPosts();
      const post = posts.find(p => p.id === postId);
      if (post && post.userId !== userId) {
        await createLikeNotification(post.userId, userId, postId);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  app.delete('/api/posts/:postId/like', sessionAuth, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId!;
      await storage.unlikePost(postId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // Comment like routes
  app.post('/api/comments/:commentId/like', sessionAuth, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.session.userId!;
      await storage.likeComment(commentId, userId);
      
      // Get comment details to notify the author
      const comment = await storage.getComment(commentId);
      if (comment && comment.userId !== userId) {
        await createCommentLikeNotification(comment.userId, userId, commentId);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking comment:", error);
      res.status(500).json({ message: "Failed to like comment" });
    }
  });

  app.delete('/api/comments/:commentId/like', sessionAuth, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.session.userId!;
      await storage.unlikeComment(commentId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking comment:", error);
      res.status(500).json({ message: "Failed to unlike comment" });
    }
  });

  // Project like routes
  app.post('/api/projects/:projectId/like', sessionAuth, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.session.userId!;
      await storage.likeProject(projectId, userId);
      
      // Get project details to notify the author
      const project = await storage.getProject(projectId);
      if (project && project.companyUserId !== userId) {
        await createProjectLikeNotification(project.companyUserId, userId, projectId);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking project:", error);
      res.status(500).json({ message: "Failed to like project" });
    }
  });

  app.delete('/api/projects/:projectId/like', sessionAuth, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.session.userId!;
      await storage.unlikeProject(projectId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking project:", error);
      res.status(500).json({ message: "Failed to unlike project" });
    }
  });

  // Like status routes
  app.get('/api/posts/:postId/like-status', sessionAuth, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId!;
      const isLiked = await storage.isPostLikedByUser(postId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking post like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  app.get('/api/comments/:commentId/like-status', sessionAuth, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.session.userId!;
      const isLiked = await storage.isCommentLikedByUser(commentId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking comment like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  app.get('/api/projects/:projectId/like-status', sessionAuth, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.session.userId!;
      const isLiked = await storage.isProjectLikedByUser(projectId, userId);
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking project like status:", error);
      res.status(500).json({ message: "Failed to check like status" });
    }
  });

  app.post('/api/posts/:postId/comments', sessionAuth, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const userId = req.session.userId!;
      const { content } = z.object({ content: z.string() }).parse(req.body);
      await storage.addComment(postId, userId, content);
      
      // Get post details to notify the author
      const posts = await storage.getPosts();
      const post = posts.find(p => p.id === postId);
      if (post && post.userId !== userId) {
        await createCommentNotification(post.userId, userId, postId, content);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.put('/api/comments/:commentId', sessionAuth, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const userId = req.session.userId!;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Content is required" });
      }

      await storage.updateComment(commentId, userId, content);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating comment:", error);
      if ((error as Error).message?.includes("not authorized")) {
        return res.status(403).json({ message: "Not authorized to edit this comment" });
      }
      res.status(500).json({ message: "Failed to update comment" });
    }
  });

  app.delete('/api/comments/:commentId', sessionAuth, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.session.userId!;
      
      await storage.deleteComment(commentId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting comment:", error);
      if ((error as Error).message?.includes("not authorized")) {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Get comments for a post
  app.get('/api/posts/:postId/comments', async (req, res) => {
    try {
      const { postId } = req.params;
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching post comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Message routes
  // Get all conversations for a user
  app.get('/api/conversations', sessionAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.userId!;
      const conversations = await storage.getConversations(currentUserId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages/conversation/:userId', sessionAuth, async (req: any, res) => {
    try {
      const currentUserId = req.session.userId!;
      const { userId } = req.params;
      const conversation = await storage.getConversation(currentUserId, userId);
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post('/api/messages', sessionAuth, async (req: any, res) => {
    try {
      const senderId = req.session.userId!;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });
      const message = await storage.sendMessage(messageData);
      
      // Get sender info for the WebSocket event
      const sender = await storage.getUser(senderId);
      
      // Emit the message to the receiver in real-time
      io.to(`user-${messageData.receiverId}`).emit('new-message', {
        ...message,
        sender: sender
      });
      
      // Create notification for the receiver
      await createMessageNotification(messageData.receiverId, senderId, messageData.content);
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/messages/:messageId/read', sessionAuth, async (req, res) => {
    try {
      const { messageId } = req.params;
      await storage.markMessageAsRead(messageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.get('/api/messages/unread-count', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const count = await storage.getUnreadMessagesCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      res.status(500).json({ message: "Failed to fetch unread messages count" });
    }
  });

  // Connection routes
  app.post('/api/connections/request', sessionAuth, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const { addresseeId } = req.body;

      if (!addresseeId) {
        return res.status(400).json({ message: "addresseeId is required" });
      }

      if (requesterId === addresseeId) {
        return res.status(400).json({ message: "Cannot send connection request to yourself" });
      }

      // Check if connection already exists
      const existingConnection = await storage.getConnectionStatus(requesterId, addresseeId);
      if (existingConnection) {
        return res.status(400).json({ 
          message: "Connection already exists", 
          status: existingConnection.status 
        });
      }

      // Create connection request
      const connection = await storage.createConnection(requesterId, addresseeId);
      
      // Create notification for the addressee
      await createNotification(addresseeId, 'connection', 'New Connection Request', 
        `You have a new connection request`, requesterId, requesterId);

      res.json(connection);
    } catch (error) {
      console.error("Error creating connection request:", error);
      res.status(500).json({ message: "Failed to send connection request" });
    }
  });

  app.get('/api/connections/status/:userId', sessionAuth, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      
      const connection = await storage.getConnectionStatus(currentUserId, userId);
      res.json({ 
        connected: !!connection, 
        status: connection?.status || null,
        isRequester: connection?.requesterId === currentUserId
      });
    } catch (error) {
      console.error("Error checking connection status:", error);
      res.status(500).json({ message: "Failed to check connection status" });
    }
  });

  app.put('/api/connections/:connectionId/status', sessionAuth, async (req: any, res) => {
    try {
      const { connectionId } = req.params;
      const { status } = req.body;
      const currentUserId = req.session.userId!;

      if (!['accepted', 'declined'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'accepted' or 'declined'" });
      }

      // Verify the user is the addressee of this connection
      const [connection] = await db.select().from(connections).where(eq(connections.id, connectionId));
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }

      if (connection.addresseeId !== currentUserId) {
        return res.status(403).json({ message: "You can only respond to connection requests sent to you" });
      }

      const updatedConnection = await storage.updateConnectionStatus(connectionId, status);
      
      // Create notification for the requester
      const notificationMessage = status === 'accepted' 
        ? 'Your connection request was accepted!' 
        : 'Your connection request was declined';
      
      await createNotification(connection.requesterId, 'connection', 'Connection Request Response', 
        notificationMessage, currentUserId, currentUserId);

      res.json(updatedConnection);
    } catch (error) {
      console.error("Error updating connection status:", error);
      res.status(500).json({ message: "Failed to update connection status" });
    }
  });

  app.get('/api/connections', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.query;
      
      const connections = await storage.getConnections(userId, status as string);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  // Feedback routes
  app.get('/api/feedback/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const feedbackList = await storage.getFeedbackForUser(userId);
      res.json(feedbackList);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.post('/api/feedback', sessionAuth, async (req: any, res) => {
    try {
      const fromUserId = req.session.userId!;
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        fromUserId,
      });
      const feedback = await storage.createFeedback(feedbackData);
      
      // Create notification for the feedback recipient
      await createFeedbackNotification(feedbackData.toUserId, fromUserId, feedbackData.rating, feedbackData.comment || '');
      
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Connection routes
  app.get('/api/connections', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const { status } = req.query;
      const connections = await storage.getConnections(userId, status as string);
      res.json(connections);
    } catch (error) {
      console.error("Error fetching connections:", error);
      res.status(500).json({ message: "Failed to fetch connections" });
    }
  });

  app.post('/api/connections', sessionAuth, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const { addresseeId } = z.object({ addresseeId: z.string() }).parse(req.body);
      const connection = await storage.createConnection(requesterId, addresseeId);
      res.json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(500).json({ message: "Failed to create connection" });
    }
  });

  app.put('/api/connections/:id', sessionAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const connection = await storage.updateConnectionStatus(id, status);
      res.json(connection);
    } catch (error) {
      console.error("Error updating connection:", error);
      res.status(500).json({ message: "Failed to update connection" });
    }
  });

  // Test endpoint for creating notifications (development only)
  if (process.env.NODE_ENV === 'development') {
    app.post('/api/test-notifications', sessionAuth, async (req: any, res) => {
      try {
        const userId = req.session.userId!;
        const { createTestNotifications } = await import('./weeklyDigest');
        await createTestNotifications(userId);
        res.json({ success: true, message: 'Test notifications created' });
      } catch (error) {
        console.error("Error creating test notifications:", error);
        res.status(500).json({ message: "Failed to create test notifications" });
      }
    });
  }

  // Notification routes
  app.get('/api/notifications', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const { limit } = req.query as { limit?: string };
      const notifications = await storage.getNotifications(userId, limit ? parseInt(limit) : undefined);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.put('/api/notifications/:id/read', sessionAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Job import endpoints
  app.post('/api/import/jobs', sessionAuth, async (req: any, res) => {
    try {
      const { maxJobs = 5 } = req.body;
      const jobImportService = new JobImportService();
      const result = await jobImportService.importJobsFromWeb(maxJobs);
      res.json(result);
    } catch (error) {
      console.error("Error importing jobs:", error);
      res.status(500).json({ message: "Failed to import jobs" });
    }
  });

  app.post('/api/import/jobs/specific', sessionAuth, async (req: any, res) => {
    try {
      const { designersCount = 5, projectManagersCount = 5 } = req.body;
      const jobImportService = new JobImportService();
      const result = await jobImportService.importSpecificRoles(designersCount, projectManagersCount);
      res.json(result);
    } catch (error) {
      console.error("Error importing specific roles:", error);
      res.status(500).json({ message: "Failed to import specific roles" });
    }
  });

  // Stats endpoint
  app.get('/api/stats', async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const [activeProfessionals, openProjects, unreadMessages] = await Promise.all([
        storage.getActiveProfessionalsCount(),
        storage.getOpenProjectsCount(),
        userId ? storage.getUnreadMessagesCount(userId) : Promise.resolve(0)
      ]);

      res.json({
        activeProfessionals,
        openProjects,
        unreadMessages,
        profileViews: 0 // Placeholder - profile views tracking not implemented yet
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Notification preferences routes
  app.get('/api/notification-preferences', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const preferences = await storage.getNotificationPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.put('/api/notification-preferences', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const preferencesData = insertNotificationPreferencesSchema.parse({
        ...req.body,
        userId,
      });
      const preferences = await storage.upsertNotificationPreferences(preferencesData);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Object storage routes for CV/file uploads
  app.post('/api/objects/upload', sessionAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.get('/objects/:objectPath(*)', sessionAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error downloading object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.put('/api/profile/cv', sessionAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const { cvUrl } = req.body;
      
      if (!cvUrl) {
        return res.status(400).json({ error: "cvUrl is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = objectStorageService.normalizeObjectEntityPath(cvUrl);
      
      // Update the professional profile with the CV URL
      await storage.updateProfessionalProfile(userId, { cvUrl: normalizedPath });
      
      res.json({ cvUrl: normalizedPath });
    } catch (error) {
      console.error("Error updating CV:", error);
      res.status(500).json({ message: "Failed to update CV" });
    }
  });

  // Avatar upload routes
  app.put('/api/profile/avatar', sessionAuth, async (req: any, res) => {
    try {
      const { avatarUrl } = req.body;
      if (!avatarUrl) {
        return res.status(400).json({ message: "Avatar URL is required" });
      }

      const userId = req.session.userId;
      await storage.updateUser(userId, { profileImageUrl: avatarUrl });
      
      res.json({ message: "Avatar updated successfully", avatarUrl });
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });

  // Job import routes
  app.post('/api/admin/import-jobs', async (req: any, res) => {
    try {
      const { maxJobs = 10 } = req.body;
      const { JobImportService } = await import('./job-import-service');
      const jobImportService = new JobImportService();
      const results = await jobImportService.importJobsFromWeb(maxJobs);
      res.json(results);
    } catch (error) {
      console.error("Error importing jobs:", error);
      res.status(500).json({ message: "Failed to import jobs" });
    }
  });

  // Force import specific roles from InfoJobs and Indeed
  app.post('/api/admin/import-specific-roles', async (req: any, res) => {
    try {
      const { designersCount = 5, projectManagersCount = 5 } = req.body;
      console.log(`Starting forced import: ${designersCount} designers, ${projectManagersCount} project managers from InfoJobs and Indeed`);
      
      const { JobImportService } = await import('./job-import-service');
      const jobImportService = new JobImportService();
      const results = await jobImportService.importSpecificRoles(designersCount, projectManagersCount);
      
      res.json({
        message: `Import completed: ${results.imported} jobs imported, ${results.skipped} skipped, ${results.errors} errors`,
        ...results,
        breakdown: {
          requestedDesigners: designersCount,
          requestedProjectManagers: projectManagersCount,
          totalRequested: designersCount + projectManagersCount
        }
      });
    } catch (error) {
      console.error("Error importing specific roles:", error);
      res.status(500).json({ message: "Failed to import specific roles" });
    }
  });

  // Seed professional users
  app.post('/api/admin/seed-professional-users', async (req: any, res) => {
    try {
      const { count = 120 } = req.body;
      console.log(`Starting professional users seeding with ${count} users...`);
      
      const { professionalUsersSeeder } = await import('./seeders/professional-users-seeder');
      await professionalUsersSeeder.seed(count);
      
      res.json({
        message: `Successfully seeded ${count} professional users`,
        count
      });
    } catch (error) {
      console.error("Error seeding professional users:", error);
      res.status(500).json({ message: "Failed to seed professional users" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup Socket.IO for video calling signaling and notifications
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: "/ws",
    transports: ['websocket']
  });
  
  // Connect notification service to Socket.IO
  notificationService.setSocketIO(io);

  // Store room information
  const rooms = new Map<string, { users: Set<string>, createdAt: Date }>();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Handle user authentication for notifications, calls, and chat
    socket.on('authenticate', (userId: string) => {
      socket.data.userId = userId;
      socket.join(`user-${userId}`);
      console.log(`User ${userId} authenticated for notifications, calls, and chat`);
    });

    // Handle joining a chat conversation
    socket.on('join-conversation', (conversationId: string, userId: string) => {
      console.log(`User ${userId} joining conversation ${conversationId}`);
      socket.join(`conversation-${conversationId}`);
    });

    // Handle leaving a chat conversation
    socket.on('leave-conversation', (conversationId: string, userId: string) => {
      console.log(`User ${userId} leaving conversation ${conversationId}`);
      socket.leave(`conversation-${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing', (data: { conversationId: string, userId: string, isTyping: boolean }) => {
      socket.to(`conversation-${data.conversationId}`).emit('user-typing', data);
    });

    // Handle marking messages as read
    socket.on('mark-messages-read', async (data: { conversationId: string, userId: string }) => {
      try {
        await storage.markConversationAsRead(data.userId, data.conversationId);
        // Notify the sender that their messages were read
        io.to(`user-${data.conversationId}`).emit('messages-read', {
          userId: data.userId,
          conversationId: data.conversationId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle joining a video call room
    socket.on('join-room', (roomId: string, userId: string) => {
      console.log(`User ${userId} joining room ${roomId}`);
      
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { users: new Set(), createdAt: new Date() });
      }
      
      const room = rooms.get(roomId)!;
      room.users.add(socket.id);
      
      socket.join(roomId);
      
      // Notify other users in the room about the new user
      socket.to(roomId).emit('user-joined', { userId, socketId: socket.id });
      
      // Send existing users to the new user
      const existingUsers = Array.from(room.users).filter(id => id !== socket.id);
      socket.emit('existing-users', existingUsers);
    });

    // Handle P2P WebRTC signaling for direct calls
    socket.on('call-offer', (data: { offer: any, to: string, callId: string }) => {
      console.log(`Call offer from ${socket.id} to ${data.to}`);
      socket.to(`user-${data.to}`).emit('call-offer', {
        offer: data.offer,
        from: socket.data.userId,
        callId: data.callId
      });
    });

    socket.on('call-answer', (data: { answer: any, to: string, callId: string }) => {
      console.log(`Call answer from ${socket.id} to ${data.to}`);
      socket.to(`user-${data.to}`).emit('call-answer', {
        answer: data.answer,
        from: socket.data.userId,
        callId: data.callId
      });
    });

    socket.on('ice-candidate', (data: { candidate: any, to: string, callId: string }) => {
      socket.to(`user-${data.to}`).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.data.userId,
        callId: data.callId
      });
    });

    socket.on('call-end', (data: { to: string, callId: string }) => {
      console.log(`Call ended by ${socket.id}`);
      socket.to(`user-${data.to}`).emit('call-end', {
        from: socket.data.userId,
        callId: data.callId
      });
    });

    // Handle WebRTC signaling for room-based calls
    socket.on('offer', (data: { to: string, offer: any, roomId: string }) => {
      socket.to(data.to).emit('offer', {
        from: socket.id,
        offer: data.offer
      });
    });

    socket.on('answer', (data: { to: string, answer: any, roomId: string }) => {
      socket.to(data.to).emit('answer', {
        from: socket.id,
        answer: data.answer
      });
    });

    socket.on('ice-candidate', (data: { to: string, candidate: any, roomId: string }) => {
      socket.to(data.to).emit('ice-candidate', {
        from: socket.id,
        candidate: data.candidate
      });
    });

    // Handle leaving room
    socket.on('leave-room', (roomId: string) => {
      handleUserLeaving(socket, roomId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Clean up user from all rooms
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          handleUserLeaving(socket, roomId);
        }
      });
    });
  });

  function handleUserLeaving(socket: any, roomId: string) {
    const room = rooms.get(roomId);
    if (room) {
      room.users.delete(socket.id);
      socket.to(roomId).emit('user-left', socket.id);
      
      // Clean up empty rooms
      if (room.users.size === 0) {
        rooms.delete(roomId);
      }
    }
    socket.leave(roomId);
  }

  // API endpoint to create a new call room
  app.post('/api/calls/create', sessionAuth, async (req: any, res) => {
    try {
      const roomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      res.json({ roomId, callUrl: `/call/${roomId}` });
    } catch (error) {
      console.error('Error creating call room:', error);
      res.status(500).json({ message: 'Failed to create call room' });
    }
  });

  return httpServer;
}
