import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, hashPassword, verifyPassword } from "./auth";
import {
  insertProfessionalProfileSchema,
  insertCompanyProfileSchema,
  insertProjectSchema,
  insertPostSchema,
  insertMessageSchema,
  insertFeedbackSchema,
  insertNotificationPreferencesSchema,
  registerUserSchema,
  loginUserSchema,
} from "@shared/schema";
import { notificationService, createMessageNotification, createLikeNotification, createCommentLikeNotification, createProjectLikeNotification, createCommentNotification, createFeedbackNotification } from "./notifications";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { z } from "zod";

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
        return res.status(400).json({ message: "User already exists with this email" });
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
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
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
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.get('/api/profile/professional/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getProfessionalProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Professional profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching professional profile:", error);
      res.status(500).json({ message: "Failed to fetch professional profile" });
    }
  });

  app.post('/api/profile/professional', isAuthenticated, async (req: any, res) => {
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
      res.status(500).json({ message: "Failed to create professional profile" });
    }
  });

  app.put('/api/profile/professional', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const profileData = insertProfessionalProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfessionalProfile(userId, profileData);
      res.json(profile);
    } catch (error) {
      console.error("Error updating professional profile:", error);
      res.status(500).json({ message: "Failed to update professional profile" });
    }
  });

  app.get('/api/profile/company/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const profile = await storage.getCompanyProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Company profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
      res.status(500).json({ message: "Failed to fetch company profile" });
    }
  });

  app.post('/api/profile/company', isAuthenticated, async (req: any, res) => {
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

  // Professional search routes
  app.get('/api/professionals/search', async (req, res) => {
    try {
      const { skills, availability, seniorityLevel, minRate, maxRate } = req.query;
      
      const filters: any = {};
      if (skills) filters.skills = Array.isArray(skills) ? skills : [skills];
      if (availability) filters.availability = availability as string;
      if (seniorityLevel) filters.seniorityLevel = seniorityLevel as string;
      if (minRate) filters.minRate = parseFloat(minRate as string);
      if (maxRate) filters.maxRate = parseFloat(maxRate as string);

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

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
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
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.session.userId!;
      
      // Verify project ownership
      const project = await storage.getProject(id);
      if (!project || project.companyUserId !== userId) {
        return res.status(403).json({ message: "Not authorized to update this project" });
      }

      const updateData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, updateData);
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
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

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/posts/:postId/like', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/posts/:postId/like', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/comments/:commentId/like', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/comments/:commentId/like', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/projects/:projectId/like', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/projects/:projectId/like', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/posts/:postId/like-status', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/comments/:commentId/like-status', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/projects/:projectId/like-status', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/posts/:postId/comments', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/messages/conversation/:userId', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.session.userId!;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });
      const message = await storage.sendMessage(messageData);
      
      // Create notification for the receiver
      await createMessageNotification(messageData.receiverId, senderId, messageData.content);
      
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/messages/:messageId/read', isAuthenticated, async (req, res) => {
    try {
      const { messageId } = req.params;
      await storage.markMessageAsRead(messageId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.get('/api/messages/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const count = await storage.getUnreadMessagesCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      res.status(500).json({ message: "Failed to fetch unread messages count" });
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

  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/connections', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/connections', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.session.userId!;
      const { addresseeId } = z.object({ addresseeId: z.string() }).parse(req.body);
      const connection = await storage.createConnection(requesterId, addresseeId);
      res.json(connection);
    } catch (error) {
      console.error("Error creating connection:", error);
      res.status(500).json({ message: "Failed to create connection" });
    }
  });

  app.put('/api/connections/:id', isAuthenticated, async (req: any, res) => {
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
    app.post('/api/test-notifications', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const count = await storage.getUnreadNotificationsCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Notification preferences routes
  app.get('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId!;
      const preferences = await storage.getNotificationPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.put('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/objects/upload', isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  app.get('/objects/:objectPath(*)', isAuthenticated, async (req, res) => {
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

  app.put('/api/profile/cv', isAuthenticated, async (req: any, res) => {
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
  app.put('/api/profile/avatar', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/import-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const { JobImportService } = await import('./job-import-service');
      const jobImportService = new JobImportService();
      const results = await jobImportService.importJobsFromWeb();
      res.json(results);
    } catch (error) {
      console.error("Error importing jobs:", error);
      res.status(500).json({ message: "Failed to import jobs" });
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
    
    // Handle user authentication for notifications and calls
    socket.on('authenticate', (userId: string) => {
      socket.data.userId = userId;
      socket.join(`user-${userId}`);
      console.log(`User ${userId} authenticated for notifications and calls`);
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
  app.post('/api/calls/create', isAuthenticated, async (req: any, res) => {
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
