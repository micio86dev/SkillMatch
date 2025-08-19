import {
  users,
  professionalProfiles,
  companyProfiles,
  projects,
  posts,
  postLikes,
  commentLikes,
  projectLikes,
  projectSubscriptions,
  postComments,
  messages,
  feedback,
  connections,
  notifications,
  notificationPreferences,
  type User,
  type UpsertUser,
  type RegisterUser,
  type ProfessionalProfile,
  type InsertProfessionalProfile,
  type CompanyProfile,
  type InsertCompanyProfile,
  type Project,
  type InsertProject,
  type Post,
  type InsertPost,
  type Message,
  type InsertMessage,
  type Feedback,
  type InsertFeedback,
  type Connection,
  type InsertConnection,
  type Notification,
  type InsertNotification,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type ProjectSubscription,
  type InsertProjectSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql, ne } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<RegisterUser, 'confirmPassword'>): Promise<User>;
  upsertUser(user: { id: string; email?: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserLanguage(id: string, language: string): Promise<User>;
  
  // Professional profile operations
  getProfessionalProfile(userId: string): Promise<ProfessionalProfile | undefined>;
  createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile>;
  updateProfessionalProfile(userId: string, profile: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile>;
  searchProfessionals(filters: {
    skills?: string[];
    availability?: string;
    seniorityLevel?: string;
    minRate?: number;
    maxRate?: number;
    excludeUserId?: string;
  }): Promise<(ProfessionalProfile & { user: User })[]>;
  
  // Company profile operations
  getCompanyProfile(userId: string): Promise<CompanyProfile | undefined>;
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  updateCompanyProfile(userId: string, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile>;
  getCompanies(excludeUserId?: string): Promise<(CompanyProfile & { user: User; projectsCount: number })[]>;
  getCompanyWithProjects(id: string): Promise<(CompanyProfile & { user: User; projects: Project[] }) | undefined>;
  
  // Project operations
  getProject(id: string): Promise<(Project & { company: User }) | undefined>;
  getProjects(filters?: { status?: string; companyUserId?: string }): Promise<(Project & { company: User })[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  
  // Post operations
  getPosts(filters?: { userId?: string; isPublic?: boolean }): Promise<(Post & { user: User })[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(postId: string, userId: string, content: string): Promise<Post>;
  deletePost(postId: string, userId: string): Promise<void>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  addComment(postId: string, userId: string, content: string): Promise<void>;
  updateComment(commentId: string, userId: string, content: string): Promise<void>;
  deleteComment(commentId: string, userId: string): Promise<void>;
  getPostComments(postId: string): Promise<Array<{ id: string; content: string; createdAt: string; user: User; likesCount: number }>>;
  getComment(commentId: string): Promise<{ id: string; userId: string; content: string } | undefined>;
  likeComment(commentId: string, userId: string): Promise<void>;
  unlikeComment(commentId: string, userId: string): Promise<void>;
  likeProject(projectId: string, userId: string): Promise<void>;
  unlikeProject(projectId: string, userId: string): Promise<void>;
  isPostLikedByUser(postId: string, userId: string): Promise<boolean>;
  isCommentLikedByUser(commentId: string, userId: string): Promise<boolean>;
  isProjectLikedByUser(projectId: string, userId: string): Promise<boolean>;
  
  // Message operations
  getConversation(userId1: string, userId2: string): Promise<(Message & { sender: User; receiver: User })[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<void>;
  getUnreadMessagesCount(userId: string): Promise<number>;
  
  // Stats operations
  getActiveProfessionalsCount(): Promise<number>;
  getOpenProjectsCount(): Promise<number>;
  
  // Feedback operations
  getFeedbackForUser(userId: string): Promise<(Feedback & { fromUser: User })[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Connection operations
  getConnections(userId: string, status?: string): Promise<(Connection & { requester: User; addressee: User })[]>;
  createConnection(requesterId: string, addresseeId: string): Promise<Connection>;
  updateConnectionStatus(id: string, status: string): Promise<Connection>;
  
  // Notification operations
  getNotifications(userId: string, limit?: number): Promise<(Notification & { relatedUser?: User })[]>;
  getNotification(userId: string, title: string): Promise<(Notification & { relatedUser?: User }) | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markNotificationEmailSent(userId: string, title: string): Promise<void>;
  markNotificationPushSent(userId: string, title: string): Promise<void>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  getNotificationsSince(userId: string, since: Date): Promise<Notification[]>;
  
  // Notification preferences operations
  getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  upsertNotificationPreferences(preferences: InsertNotificationPreferences): Promise<NotificationPreferences>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<RegisterUser, 'confirmPassword'>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: { id: string; email?: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserLanguage(id: string, language: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ language, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Professional profile operations
  async getProfessionalProfile(userId: string): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db
      .select()
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId));
    return profile;
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile> {
    const [newProfile] = await db
      .insert(professionalProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateProfessionalProfile(userId: string, profile: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile> {
    const [updated] = await db
      .update(professionalProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(professionalProfiles.userId, userId))
      .returning();
    return updated;
  }

  async searchProfessionals(filters: {
    skills?: string[];
    availability?: string;
    seniorityLevel?: string;
    minRate?: number;
    maxRate?: number;
    excludeUserId?: string;
  }): Promise<(ProfessionalProfile & { user: User })[]> {
    let query = db
      .select()
      .from(professionalProfiles)
      .innerJoin(users, eq(professionalProfiles.userId, users.id));

    const conditions = [];

    // Exclude current user if specified
    if (filters.excludeUserId) {
      conditions.push(ne(users.id, filters.excludeUserId));
    }

    if (filters.skills && filters.skills.length > 0) {
      conditions.push(
        or(...filters.skills.map(skill => 
          sql`${professionalProfiles.skills} @> ARRAY[${skill}]::text[]`
        ))
      );
    }

    if (filters.availability) {
      conditions.push(eq(professionalProfiles.availability, filters.availability as any));
    }

    if (filters.seniorityLevel) {
      conditions.push(eq(professionalProfiles.seniorityLevel, filters.seniorityLevel as any));
    }

    if (filters.minRate !== undefined) {
      conditions.push(sql`${professionalProfiles.hourlyRate} >= ${filters.minRate}`);
    }

    if (filters.maxRate !== undefined) {
      conditions.push(sql`${professionalProfiles.hourlyRate} <= ${filters.maxRate}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query;
    return results.map(result => ({
      ...result.professional_profiles,
      user: result.users
    }));
  }

  // Company profile operations
  async getCompanyProfile(userId: string): Promise<CompanyProfile | undefined> {
    const [profile] = await db
      .select()
      .from(companyProfiles)
      .where(eq(companyProfiles.userId, userId));
    return profile;
  }

  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const [newProfile] = await db
      .insert(companyProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateCompanyProfile(userId: string, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile> {
    const [updated] = await db
      .update(companyProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(companyProfiles.userId, userId))
      .returning();
    return updated;
  }

  async getCompanies(excludeUserId?: string): Promise<(CompanyProfile & { user: User; projectsCount: number })[]> {
    // Build where conditions
    let whereConditions = [eq(users.userType, 'company')];
    
    // Exclude current user if specified
    if (excludeUserId) {
      whereConditions.push(ne(users.id, excludeUserId));
    }
    
    const companiesWithProjects = await db
      .select({
        id: companyProfiles.id,
        userId: companyProfiles.userId,
        companyName: companyProfiles.companyName,
        description: companyProfiles.description,
        industry: companyProfiles.industry,
        websiteUrl: companyProfiles.websiteUrl,
        linkedinUrl: companyProfiles.linkedinUrl,
        location: companyProfiles.location,
        companySize: companyProfiles.companySize,
        createdAt: companyProfiles.createdAt,
        updatedAt: companyProfiles.updatedAt,
        user: users,
        projectsCount: sql<number>`count(${projects.id})::int`
      })
      .from(companyProfiles)
      .innerJoin(users, eq(companyProfiles.userId, users.id))
      .leftJoin(projects, and(eq(projects.companyUserId, users.id), eq(projects.status, 'open')))
      .where(and(...whereConditions))
      .groupBy(companyProfiles.id, users.id)
      .orderBy(desc(companyProfiles.createdAt));

    return companiesWithProjects;
  }

  async getCompanyWithProjects(id: string): Promise<(CompanyProfile & { user: User; projects: Project[] }) | undefined> {
    const [company] = await db
      .select()
      .from(companyProfiles)
      .innerJoin(users, eq(companyProfiles.userId, users.id))
      .where(eq(companyProfiles.id, id));

    if (!company) {
      return undefined;
    }

    const companyProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.companyUserId, company.users.id))
      .orderBy(desc(projects.createdAt));

    return {
      ...company.company_profiles,
      user: company.users,
      projects: companyProjects
    };
  }

  // Project operations
  async getProject(id: string): Promise<(Project & { company: User }) | undefined> {
    const [result] = await db
      .select()
      .from(projects)
      .innerJoin(users, eq(projects.companyUserId, users.id))
      .where(eq(projects.id, id));
    
    if (!result) {
      return undefined;
    }
    
    return {
      ...result.projects,
      company: result.users
    };
  }

  async getProjects(filters?: { status?: string; companyUserId?: string }): Promise<(Project & { company: User })[]> {
    let query = db
      .select()
      .from(projects)
      .innerJoin(users, eq(projects.companyUserId, users.id))
      .orderBy(desc(projects.createdAt));

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(projects.status, filters.status as any));
    }

    if (filters?.companyUserId) {
      conditions.push(eq(projects.companyUserId, filters.companyUserId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query;
    return results.map(result => ({
      ...result.projects,
      company: result.users
    }));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  // Post operations
  async getPosts(filters?: { userId?: string; isPublic?: boolean }): Promise<(Post & { user: User })[]> {
    let query = db
      .select()
      .from(posts)
      .innerJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    const conditions = [];

    if (filters?.userId) {
      conditions.push(eq(posts.userId, filters.userId));
    }

    if (filters?.isPublic !== undefined) {
      conditions.push(eq(posts.isPublic, filters.isPublic));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query;
    return results.map(result => ({
      ...result.posts,
      user: result.users
    }));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async updatePost(postId: string, userId: string, content: string): Promise<Post> {
    // First verify the user owns the post
    const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!existingPost || existingPost.userId !== userId) {
      throw new Error("Post not found or user not authorized to edit");
    }

    const [updatedPost] = await db
      .update(posts)
      .set({ content, updatedAt: new Date() })
      .where(eq(posts.id, postId))
      .returning();
    return updatedPost;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    // First verify the user owns the post
    const [existingPost] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!existingPost || existingPost.userId !== userId) {
      throw new Error("Post not found or user not authorized to delete");
    }

    // Delete in transaction to maintain consistency
    await db.transaction(async (tx) => {
      // Delete all comments and their likes
      await tx.delete(commentLikes).where(
        sql`${commentLikes.commentId} IN (SELECT id FROM ${postComments} WHERE ${postComments.postId} = ${postId})`
      );
      await tx.delete(postComments).where(eq(postComments.postId, postId));
      
      // Delete post likes
      await tx.delete(postLikes).where(eq(postLikes.postId, postId));
      
      // Delete the post
      await tx.delete(posts).where(eq(posts.id, postId));
    });
  }

  async likePost(postId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(postLikes).values({ postId, userId });
      await tx
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));
    });
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
      await tx
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));
    });
  }

  async addComment(postId: string, userId: string, content: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(postComments).values({ postId, userId, content });
      await tx
        .update(posts)
        .set({ commentsCount: sql`${posts.commentsCount} + 1` })
        .where(eq(posts.id, postId));
    });
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<void> {
    // First verify the user owns the comment
    const [existingComment] = await db.select().from(postComments).where(eq(postComments.id, commentId));
    if (!existingComment || existingComment.userId !== userId) {
      throw new Error("Comment not found or user not authorized to edit");
    }

    await db
      .update(postComments)
      .set({ content })
      .where(eq(postComments.id, commentId));
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    // First verify the user owns the comment
    const [existingComment] = await db.select().from(postComments).where(eq(postComments.id, commentId));
    if (!existingComment || existingComment.userId !== userId) {
      throw new Error("Comment not found or user not authorized to delete");
    }

    await db.transaction(async (tx) => {
      // Delete comment likes
      await tx.delete(commentLikes).where(eq(commentLikes.commentId, commentId));
      
      // Delete the comment
      await tx.delete(postComments).where(eq(postComments.id, commentId));
      
      // Decrease comment count on the post
      await tx
        .update(posts)
        .set({ commentsCount: sql`${posts.commentsCount} - 1` })
        .where(eq(posts.id, existingComment.postId));
    });
  }

  async getPostComments(postId: string): Promise<Array<{ id: string; content: string; createdAt: string; user: User; likesCount: number }>> {
    const results = await db
      .select()
      .from(postComments)
      .innerJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt));
    
    return results.map(result => ({
      id: result.post_comments.id,
      content: result.post_comments.content,
      createdAt: result.post_comments.createdAt?.toISOString() || new Date().toISOString(),
      likesCount: result.post_comments.likesCount || 0,
      user: result.users
    }));
  }

  async getComment(commentId: string): Promise<{ id: string; userId: string; content: string } | undefined> {
    const [comment] = await db
      .select({ id: postComments.id, userId: postComments.userId, content: postComments.content })
      .from(postComments)
      .where(eq(postComments.id, commentId));
    return comment;
  }

  async likeComment(commentId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(commentLikes).values({ commentId, userId });
      await tx
        .update(postComments)
        .set({ likesCount: sql`${postComments.likesCount} + 1` })
        .where(eq(postComments.id, commentId));
    });
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .delete(commentLikes)
        .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
      await tx
        .update(postComments)
        .set({ likesCount: sql`${postComments.likesCount} - 1` })
        .where(eq(postComments.id, commentId));
    });
  }

  async likeProject(projectId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(projectLikes).values({ projectId, userId });
      await tx
        .update(projects)
        .set({ likesCount: sql`${projects.likesCount} + 1` })
        .where(eq(projects.id, projectId));
    });
  }

  async unlikeProject(projectId: string, userId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .delete(projectLikes)
        .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));
      await tx
        .update(projects)
        .set({ likesCount: sql`${projects.likesCount} - 1` })
        .where(eq(projects.id, projectId));
    });
  }

  // Project subscription methods
  async subscribeToProject(projectId: string, userId: string): Promise<void> {
    await db.insert(projectSubscriptions).values({ projectId, userId });
  }

  async unsubscribeFromProject(projectId: string, userId: string): Promise<void> {
    await db
      .delete(projectSubscriptions)
      .where(and(eq(projectSubscriptions.projectId, projectId), eq(projectSubscriptions.userId, userId)));
  }

  async isSubscribedToProject(projectId: string, userId: string): Promise<boolean> {
    const [subscription] = await db
      .select()
      .from(projectSubscriptions)
      .where(and(eq(projectSubscriptions.projectId, projectId), eq(projectSubscriptions.userId, userId)))
      .limit(1);
    return !!subscription;
  }

  async getProjectSubscribers(projectId: string): Promise<User[]> {
    const results = await db
      .select()
      .from(projectSubscriptions)
      .innerJoin(users, eq(projectSubscriptions.userId, users.id))
      .where(eq(projectSubscriptions.projectId, projectId));
    
    return results.map(result => result.users);
  }

  async getUserProjectSubscriptions(userId: string): Promise<(Project & { company: User })[]> {
    const results = await db
      .select()
      .from(projectSubscriptions)
      .innerJoin(projects, eq(projectSubscriptions.projectId, projects.id))
      .innerJoin(users, eq(projects.companyUserId, users.id))
      .where(eq(projectSubscriptions.userId, userId))
      .orderBy(desc(projectSubscriptions.createdAt));
    
    return results.map(result => ({
      ...result.projects,
      company: result.users,
    }));
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
      .limit(1);
    return !!like;
  }

  async isCommentLikedByUser(commentId: string, userId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(commentLikes)
      .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)))
      .limit(1);
    return !!like;
  }

  async isProjectLikedByUser(projectId: string, userId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(projectLikes)
      .where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)))
      .limit(1);
    return !!like;
  }

  // Message operations
  async getConversation(userId1: string, userId2: string): Promise<(Message & { sender: User; receiver: User })[]> {
    const results = await db
      .select({
        message: messages,
        sender: users,
        receiver: users,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(messages.createdAt); // Changed to ascending order for proper chat display

    return results.map(result => ({
      ...result.message,
      sender: result.sender,
      receiver: result.receiver,
    }));
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql`count(*)` })
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));
    return Number(result.count) || 0;
  }

  async getConversations(userId: string): Promise<any[]> {
    // Get all conversations where the user is either sender or receiver
    const latestMessages = await db
      .select({
        messageId: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        createdAt: messages.createdAt,
        isRead: messages.isRead,
        otherUserId: sql<string>`CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId} ELSE ${messages.senderId} END`,
      })
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));

    // Group by other user and get the latest message for each conversation
    const conversationMap = new Map();
    for (const msg of latestMessages) {
      if (!conversationMap.has(msg.otherUserId)) {
        conversationMap.set(msg.otherUserId, msg);
      }
    }

    // Get user details for each conversation partner
    const conversations = [];
    for (const [otherUserId, lastMessage] of Array.from(conversationMap.entries())) {
      const otherUser = await this.getUser(otherUserId);
      if (otherUser) {
        // Count unread messages from this user
        const [unreadResult] = await db
          .select({ count: sql`count(*)` })
          .from(messages)
          .where(
            and(
              eq(messages.senderId, otherUserId),
              eq(messages.receiverId, userId),
              eq(messages.isRead, false)
            )
          );
        
        conversations.push({
          id: otherUserId,
          contact: {
            id: otherUser.id,
            name: `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'User',
            title: 'Professional', // Could be enhanced with profile data
            profileImageUrl: otherUser.profileImageUrl,
            isOnline: false // Could be enhanced with real-time status
          },
          lastMessage: {
            content: lastMessage.content,
            timestamp: lastMessage.createdAt,
            senderId: lastMessage.senderId
          },
          unreadCount: Number(unreadResult.count) || 0
        });
      }
    }

    return conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    );
  }

  async markConversationAsRead(currentUserId: string, otherUserId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, otherUserId),
          eq(messages.receiverId, currentUserId),
          eq(messages.isRead, false)
        )
      );
  }

  async getActiveProfessionalsCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(professionalProfiles)
      .innerJoin(users, eq(professionalProfiles.userId, users.id))
      .where(eq(users.userType, 'professional'));
    return result.count || 0;
  }

  async getOpenProjectsCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(projects)
      .where(eq(projects.status, 'open'));
    return result.count || 0;
  }

  // Feedback operations
  async getFeedbackForUser(userId: string): Promise<(Feedback & { fromUser: User })[]> {
    const results = await db
      .select()
      .from(feedback)
      .innerJoin(users, eq(feedback.fromUserId, users.id))
      .where(eq(feedback.toUserId, userId))
      .orderBy(desc(feedback.createdAt));

    return results.map(result => ({
      ...result.feedback,
      fromUser: result.users,
    }));
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackData)
      .returning();
    return newFeedback;
  }

  // Connection operations
  async getConnections(userId: string, status?: string): Promise<(Connection & { requester: User; addressee: User })[]> {
    const conditions = [
      or(eq(connections.requesterId, userId), eq(connections.addresseeId, userId))
    ];

    if (status) {
      conditions.push(eq(connections.status, status as any));
    }

    // Get connections with both requester and addressee details
    const results = await db
      .select({
        connection: connections,
        requester: users,
      })
      .from(connections)
      .innerJoin(users, eq(connections.requesterId, users.id))
      .where(and(...conditions));

    // Now get addressee details for each connection
    const connectionsWithDetails = [];
    for (const result of results) {
      const addressee = await this.getUser(result.connection.addresseeId);
      if (addressee) {
        connectionsWithDetails.push({
          ...result.connection,
          requester: result.requester,
          addressee: addressee,
        });
      }
    }

    return connectionsWithDetails;
  }

  async getConnectionStatus(userId1: string, userId2: string): Promise<Connection | null> {
    const [connection] = await db
      .select()
      .from(connections)
      .where(
        or(
          and(eq(connections.requesterId, userId1), eq(connections.addresseeId, userId2)),
          and(eq(connections.requesterId, userId2), eq(connections.addresseeId, userId1))
        )
      )
      .limit(1);
    
    return connection || null;
  }

  async createConnection(requesterId: string, addresseeId: string): Promise<Connection> {
    const [connection] = await db
      .insert(connections)
      .values({ requesterId, addresseeId })
      .returning();
    return connection;
  }

  async updateConnectionStatus(id: string, status: string): Promise<Connection> {
    const [updated] = await db
      .update(connections)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(connections.id, id))
      .returning();
    return updated;
  }

  // Notification operations
  async getNotifications(userId: string, limit = 20): Promise<(Notification & { relatedUser?: User })[]> {
    const results = await db
      .select()
      .from(notifications)
      .leftJoin(users, eq(notifications.relatedUserId, users.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return results.map(result => ({
      ...result.notifications,
      relatedUser: result.users || undefined,
    }));
  }

  async getNotification(userId: string, title: string): Promise<(Notification & { relatedUser?: User }) | undefined> {
    const results = await db
      .select()
      .from(notifications)
      .leftJoin(users, eq(notifications.relatedUserId, users.id))
      .where(and(eq(notifications.userId, userId), eq(notifications.title, title)))
      .orderBy(desc(notifications.createdAt))
      .limit(1);

    if (results.length === 0) return undefined;

    const result = results[0];
    return {
      ...result.notifications,
      relatedUser: result.users || undefined,
    };
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async markNotificationEmailSent(userId: string, title: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isEmailSent: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.title, title)));
  }

  async markNotificationPushSent(userId: string, title: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isPushSent: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.title, title)));
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.count || 0;
  }

  async getNotificationsSince(userId: string, since: Date): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), sql`${notifications.createdAt} >= ${since}`))
      .orderBy(desc(notifications.createdAt));
  }

  // Notification preferences operations
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return preferences;
  }

  async upsertNotificationPreferences(preferencesData: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const [preferences] = await db
      .insert(notificationPreferences)
      .values(preferencesData)
      .onConflictDoUpdate({
        target: notificationPreferences.userId,
        set: {
          ...preferencesData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return preferences;
  }
}

export const storage = new DatabaseStorage();
