import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertProfessionalProfileSchema,
  insertCompanyProfileSchema,
  insertProjectSchema,
  insertPostSchema,
  insertMessageSchema,
  insertFeedbackSchema,
  insertNotificationPreferencesSchema,
} from "@shared/schema";
import { notificationService, createMessageNotification, createLikeNotification, createCommentNotification, createFeedbackNotification } from "./notifications";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const companyUserId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const posts = await storage.getPosts({
        userId: userId as string,
        isPublic: isPublic === 'true',
      });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      await storage.likeComment(commentId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking comment:", error);
      res.status(500).json({ message: "Failed to like comment" });
    }
  });

  app.delete('/api/comments/:commentId/like', isAuthenticated, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      await storage.likeProject(projectId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking project:", error);
      res.status(500).json({ message: "Failed to like project" });
    }
  });

  app.delete('/api/projects/:projectId/like', isAuthenticated, async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.claims.sub;
      await storage.unlikeProject(projectId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unliking project:", error);
      res.status(500).json({ message: "Failed to unlike project" });
    }
  });

  app.post('/api/posts/:postId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.claims.sub;
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

  // Message routes
  app.get('/api/messages/conversation/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
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
      const senderId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const fromUserId = req.user.claims.sub;
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        fromUserId,
      });
      const feedback = await storage.createFeedback(feedbackData);
      
      // Create notification for the feedback recipient
      await createFeedbackNotification(feedbackData.toUserId, fromUserId, feedbackData.rating, feedbackData.comment);
      
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Connection routes
  app.get('/api/connections', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/connections', isAuthenticated, async (req: any, res) => {
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
        const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const preferences = await storage.getNotificationPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.put('/api/notification-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  const httpServer = createServer(app);
  
  // Setup Socket.IO for video calling signaling and notifications
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: "/socket.io"
  });
  
  // Connect notification service to Socket.IO
  notificationService.setSocketIO(io);

  // Store room information
  const rooms = new Map<string, { users: Set<string>, createdAt: Date }>();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Handle user authentication for notifications
    socket.on('authenticate', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} authenticated for notifications`);
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

    // Handle WebRTC signaling
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
