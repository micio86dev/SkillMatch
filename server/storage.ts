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
  projectApplications,
  projectPreventives,
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
  type ProjectApplication,
  type InsertProjectApplication,
  type ProjectPreventive,
  type InsertProjectPreventive,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql, ne } from "drizzle-orm";
import { nanoid } from "nanoid";

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
    search?: string;
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
  getNotifications(userId: string, limit?: number): Promise<(Notification & { relatedUser: User | null })[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  
  // Notification preferences operations
  getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  updateNotificationPreferences(userId: string, preferences: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences>;
  
  // Conversation operations
  getConversations(userId: string): Promise<Array<{
    user: User;
    lastMessage: Message;
    unreadCount: number;
  }>>;
  
  // Project subscription operations
  subscribeToProject(userId: string, projectId: string): Promise<ProjectSubscription>;
  unsubscribeFromProject(userId: string, projectId: string): Promise<void>;
  isSubscribedToProject(userId: string, projectId: string): Promise<boolean>;
  
  // Project application operations
  getProjectApplications(projectId: string): Promise<(ProjectApplication & { user: User })[]>;
  getUserApplications(userId: string): Promise<(ProjectApplication & { project: Project & { company: User } })[]>;
  createProjectApplication(application: InsertProjectApplication): Promise<ProjectApplication>;
  updateProjectApplicationStatus(applicationId: string, status: string, respondedBy: string): Promise<ProjectApplication>;
  getProjectApplicationsCount(projectId: string): Promise<number>;
  getAcceptedProjectApplicationsCount(projectId: string): Promise<number>;
  
  // Project preventive operations
  getProjectPreventives(userId: string): Promise<ProjectPreventive[]>;
  createProjectPreventive(preventive: InsertProjectPreventive): Promise<ProjectPreventive>;
  updateProjectPreventive(id: string, preventive: Partial<InsertProjectPreventive>): Promise<ProjectPreventive>;
  deleteProjectPreventive(id: string): Promise<void>;
  validateProjectAgainstPreventives(project: InsertProject, userId: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: Omit<RegisterUser, 'confirmPassword'>): Promise<User> {
    const id = nanoid();
    await db.insert(users).values({
      id,
      ...user,
    });
    
    // Get the created user since MySQL doesn't have .returning()
    const [createdUser] = await db.select().from(users).where(eq(users.id, id));
    return createdUser;
  }

  async upsertUser(user: { id: string; email?: string; firstName?: string; lastName?: string; profileImageUrl?: string }): Promise<User> {
    // For MySQL, we need to handle upsert differently since drizzle-orm MySQL doesn't have onDuplicateKeyUpdate in all versions
    // First try to get existing user
    const existing = await this.getUser(user.id);
    
    if (existing) {
      // Update existing user
      await db.update(users)
        .set({
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    } else {
      // Create new user
      await db.insert(users).values({
        id: user.id,
        email: user.email || `${user.id}@oauth.local`,
        password: nanoid(), // Random password for OAuth users
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
    }

    const [upsertedUser] = await db.select().from(users).where(eq(users.id, user.id));
    return upsertedUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    await db.update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    const [updatedUser] = await db.select().from(users).where(eq(users.id, id));
    return updatedUser;
  }

  async updateUserLanguage(id: string, language: string): Promise<User> {
    await db.update(users)
      .set({
        language,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    const [updatedUser] = await db.select().from(users).where(eq(users.id, id));
    return updatedUser;
  }

  // Professional profile operations
  async getProfessionalProfile(userId: string): Promise<ProfessionalProfile | undefined> {
    const [profile] = await db.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId));
    return profile || undefined;
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<ProfessionalProfile> {
    const id = nanoid();
    await db.insert(professionalProfiles).values({
      id,
      ...profile,
    });

    const [createdProfile] = await db.select().from(professionalProfiles).where(eq(professionalProfiles.id, id));
    return createdProfile;
  }

  async updateProfessionalProfile(userId: string, profile: Partial<InsertProfessionalProfile>): Promise<ProfessionalProfile> {
    await db.update(professionalProfiles)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(professionalProfiles.userId, userId));

    const [updatedProfile] = await db.select().from(professionalProfiles).where(eq(professionalProfiles.userId, userId));
    return updatedProfile;
  }

  async searchProfessionals(filters: {
    skills?: string[];
    availability?: string;
    seniorityLevel?: string;
    minRate?: number;
    maxRate?: number;
    search?: string;
    excludeUserId?: string;
  }): Promise<(ProfessionalProfile & { user: User })[]> {
    let query = db
      .select()
      .from(professionalProfiles)
      .innerJoin(users, eq(professionalProfiles.userId, users.id));

    const conditions = [];

    if (filters.availability) {
      conditions.push(eq(professionalProfiles.availability, filters.availability as any));
    }

    if (filters.seniorityLevel) {
      conditions.push(eq(professionalProfiles.seniorityLevel, filters.seniorityLevel as any));
    }

    if (filters.minRate) {
      conditions.push(sql`${professionalProfiles.hourlyRate} >= ${filters.minRate}`);
    }

    if (filters.maxRate) {
      conditions.push(sql`${professionalProfiles.hourlyRate} <= ${filters.maxRate}`);
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          like(users.firstName, searchTerm),
          like(users.lastName, searchTerm),
          like(users.email, searchTerm),
          like(professionalProfiles.title, searchTerm),
          like(professionalProfiles.bio, searchTerm),
          sql`CONCAT(${users.firstName}, ' ', ${users.lastName}) LIKE ${searchTerm}`
        )
      );
    }

    if (filters.excludeUserId) {
      conditions.push(ne(users.id, filters.excludeUserId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const results = await query;
    return results.map(result => ({
      ...result.professional_profiles,
      user: result.users,
    }));
  }

  // Company profile operations
  async getCompanyProfile(userId: string): Promise<CompanyProfile | undefined> {
    const [profile] = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, userId));
    return profile || undefined;
  }

  async createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
    const id = nanoid();
    await db.insert(companyProfiles).values({
      id,
      ...profile,
    });

    const [createdProfile] = await db.select().from(companyProfiles).where(eq(companyProfiles.id, id));
    return createdProfile;
  }

  async updateCompanyProfile(userId: string, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile> {
    await db.update(companyProfiles)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(companyProfiles.userId, userId));

    const [updatedProfile] = await db.select().from(companyProfiles).where(eq(companyProfiles.userId, userId));
    return updatedProfile;
  }

  async getCompanies(excludeUserId?: string): Promise<(CompanyProfile & { user: User; projectsCount: number })[]> {
    let query = db
      .select({
        company: companyProfiles,
        user: users,
        projectsCount: sql<number>`COUNT(${projects.id})`,
      })
      .from(companyProfiles)
      .innerJoin(users, eq(companyProfiles.userId, users.id))
      .leftJoin(projects, eq(projects.companyUserId, users.id))
      .groupBy(companyProfiles.id, users.id);

    if (excludeUserId) {
      query = query.where(ne(users.id, excludeUserId)) as any;
    }

    const results = await query;
    return results.map(result => ({
      ...result.company,
      user: result.user,
      projectsCount: result.projectsCount,
    }));
  }

  async getCompanyWithProjects(id: string): Promise<(CompanyProfile & { user: User; projects: Project[] }) | undefined> {
    const [company] = await db
      .select()
      .from(companyProfiles)
      .innerJoin(users, eq(companyProfiles.userId, users.id))
      .where(eq(companyProfiles.id, id));

    if (!company) return undefined;

    const companyProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.companyUserId, company.users.id));

    return {
      ...company.company_profiles,
      user: company.users,
      projects: companyProjects,
    };
  }

  // Project operations
  async getProject(id: string): Promise<(Project & { company: User }) | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .innerJoin(users, eq(projects.companyUserId, users.id))
      .where(eq(projects.id, id));

    if (!project) return undefined;

    return {
      ...project.projects,
      company: project.users,
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
      company: result.users,
    }));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = nanoid();
    await db.insert(projects).values({
      id,
      ...project,
    });

    const [createdProject] = await db.select().from(projects).where(eq(projects.id, id));
    return createdProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
    await db.update(projects)
      .set({
        ...project,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id));

    const [updatedProject] = await db.select().from(projects).where(eq(projects.id, id));
    return updatedProject;
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
      user: result.users,
    }));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const id = nanoid();
    await db.insert(posts).values({
      id,
      ...post,
    });

    const [createdPost] = await db.select().from(posts).where(eq(posts.id, id));
    return createdPost;
  }

  async updatePost(postId: string, userId: string, content: string): Promise<Post> {
    await db.update(posts)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)));

    const [updatedPost] = await db.select().from(posts).where(eq(posts.id, postId));
    return updatedPost;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    await db.delete(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const id = nanoid();
    await db.insert(postLikes).values({
      id,
      postId,
      userId,
    });

    // Update like count
    await db.update(posts)
      .set({
        likesCount: sql`${posts.likesCount} + 1`,
      })
      .where(eq(posts.id, postId));
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    await db.delete(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));

    // Update like count
    await db.update(posts)
      .set({
        likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)`,
      })
      .where(eq(posts.id, postId));
  }

  async addComment(postId: string, userId: string, content: string): Promise<void> {
    const id = nanoid();
    await db.insert(postComments).values({
      id,
      postId,
      userId,
      content,
    });

    // Update comment count
    await db.update(posts)
      .set({
        commentsCount: sql`${posts.commentsCount} + 1`,
      })
      .where(eq(posts.id, postId));
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<void> {
    await db.update(postComments)
      .set({ content })
      .where(and(eq(postComments.id, commentId), eq(postComments.userId, userId)));
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const [comment] = await db.select({ postId: postComments.postId }).from(postComments).where(eq(postComments.id, commentId));
    
    await db.delete(postComments).where(and(eq(postComments.id, commentId), eq(postComments.userId, userId)));

    if (comment) {
      // Update comment count
      await db.update(posts)
        .set({
          commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)`,
        })
        .where(eq(posts.id, comment.postId));
    }
  }

  async getPostComments(postId: string): Promise<Array<{ id: string; content: string; createdAt: string; user: User; likesCount: number }>> {
    const results = await db
      .select({
        comment: postComments,
        user: users,
      })
      .from(postComments)
      .innerJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt));

    return results.map(result => ({
      id: result.comment.id,
      content: result.comment.content,
      createdAt: result.comment.createdAt!.toISOString(),
      user: result.user,
      likesCount: result.comment.likesCount || 0,
    }));
  }

  async getComment(commentId: string): Promise<{ id: string; userId: string; content: string } | undefined> {
    const [comment] = await db.select().from(postComments).where(eq(postComments.id, commentId));
    return comment || undefined;
  }

  async likeComment(commentId: string, userId: string): Promise<void> {
    const id = nanoid();
    await db.insert(commentLikes).values({
      id,
      commentId,
      userId,
    });

    // Update like count
    await db.update(postComments)
      .set({
        likesCount: sql`${postComments.likesCount} + 1`,
      })
      .where(eq(postComments.id, commentId));
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    await db.delete(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));

    // Update like count
    await db.update(postComments)
      .set({
        likesCount: sql`GREATEST(${postComments.likesCount} - 1, 0)`,
      })
      .where(eq(postComments.id, commentId));
  }

  async likeProject(projectId: string, userId: string): Promise<void> {
    const id = nanoid();
    await db.insert(projectLikes).values({
      id,
      projectId,
      userId,
    });

    // Update like count
    await db.update(projects)
      .set({
        likesCount: sql`${projects.likesCount} + 1`,
      })
      .where(eq(projects.id, projectId));
  }

  async unlikeProject(projectId: string, userId: string): Promise<void> {
    await db.delete(projectLikes).where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));

    // Update like count
    await db.update(projects)
      .set({
        likesCount: sql`GREATEST(${projects.likesCount} - 1, 0)`,
      })
      .where(eq(projects.id, projectId));
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const [like] = await db.select().from(postLikes).where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)));
    return !!like;
  }

  async isCommentLikedByUser(commentId: string, userId: string): Promise<boolean> {
    const [like] = await db.select().from(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)));
    return !!like;
  }

  async isProjectLikedByUser(projectId: string, userId: string): Promise<boolean> {
    const [like] = await db.select().from(projectLikes).where(and(eq(projectLikes.projectId, projectId), eq(projectLikes.userId, userId)));
    return !!like;
  }

  // Message operations
  async getConversation(userId1: string, userId2: string): Promise<(Message & { sender: User; receiver: User })[]> {
    const results = await db
      .select()
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, userId1), eq(messages.receiverId, userId2)),
          and(eq(messages.senderId, userId2), eq(messages.receiverId, userId1))
        )
      )
      .orderBy(desc(messages.createdAt));

    // Get receiver data separately since we can't join twice with the same table
    const messagesWithSender = await Promise.all(results.map(async (result) => {
      const [receiver] = await db.select().from(users).where(eq(users.id, result.messages.receiverId));
      return {
        ...result.messages,
        sender: result.users,
        receiver: receiver!,
      };
    }));

    return messagesWithSender;
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const id = nanoid();
    await db.insert(messages).values({
      id,
      ...message,
    });

    const [createdMessage] = await db.select().from(messages).where(eq(messages.id, id));
    return createdMessage;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await db.update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, messageId));
  }

  async getUnreadMessagesCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(messages)
      .where(and(eq(messages.receiverId, userId), eq(messages.isRead, false)));

    return result?.count || 0;
  }

  // Stats operations
  async getActiveProfessionalsCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.availability, 'available'));

    return result?.count || 0;
  }

  async getOpenProjectsCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(projects)
      .where(eq(projects.status, 'open'));

    return result?.count || 0;
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
    const id = nanoid();
    await db.insert(feedback).values({
      id,
      ...feedbackData,
    });

    const [createdFeedback] = await db.select().from(feedback).where(eq(feedback.id, id));
    return createdFeedback;
  }

  // Connection operations
  async getConnections(userId: string, status?: string): Promise<(Connection & { requester: User; addressee: User })[]> {
    let query = db
      .select()
      .from(connections)
      .where(or(eq(connections.requesterId, userId), eq(connections.addresseeId, userId)))
      .orderBy(desc(connections.createdAt));

    if (status) {
      query = query.where(and(
        or(eq(connections.requesterId, userId), eq(connections.addresseeId, userId)),
        eq(connections.status, status as any)
      )) as any;
    }

    const results = await query;

    // Get user data for requester and addressee
    const connectionsWithUsers = await Promise.all(results.map(async (result) => {
      const [requester] = await db.select().from(users).where(eq(users.id, result.requesterId));
      const [addressee] = await db.select().from(users).where(eq(users.id, result.addresseeId));

      return {
        ...result,
        requester: requester!,
        addressee: addressee!,
      };
    }));

    return connectionsWithUsers;
  }

  async createConnection(requesterId: string, addresseeId: string): Promise<Connection> {
    const id = nanoid();
    await db.insert(connections).values({
      id,
      requesterId,
      addresseeId,
    });

    const [createdConnection] = await db.select().from(connections).where(eq(connections.id, id));
    return createdConnection;
  }

  async updateConnectionStatus(id: string, status: string): Promise<Connection> {
    await db.update(connections)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(connections.id, id));

    const [updatedConnection] = await db.select().from(connections).where(eq(connections.id, id));
    return updatedConnection;
  }

  // Notification operations
  async getNotifications(userId: string, limit = 50): Promise<(Notification & { relatedUser: User | null })[]> {
    const results = await db
      .select()
      .from(notifications)
      .leftJoin(users, eq(notifications.relatedUserId, users.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return results.map(result => ({
      ...result.notifications,
      relatedUser: result.users,
    }));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = nanoid();
    await db.insert(notifications).values({
      id,
      ...notification,
    });

    const [createdNotification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return createdNotification;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    return result?.count || 0;
  }

  // Notification preferences operations
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [preferences] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return preferences || undefined;
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences> {
    // First try to update existing preferences
    const existing = await this.getNotificationPreferences(userId);
    
    if (existing) {
      await db.update(notificationPreferences)
        .set({
          ...preferences,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, userId));
    } else {
      // Create new preferences if none exist
      const id = nanoid();
      await db.insert(notificationPreferences).values({
        id,
        userId,
        ...preferences,
      });
    }

    const [updatedPreferences] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return updatedPreferences;
  }

  // Conversation operations
  async getConversations(userId: string): Promise<Array<{
    user: User;
    lastMessage: Message;
    unreadCount: number;
  }>> {
    // Get all conversations for this user
    const conversations = await db
      .select({
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        createdAt: messages.createdAt,
        isRead: messages.isRead,
      })
      .from(messages)
      .where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)))
      .orderBy(desc(messages.createdAt));

    // Group by other user and get latest message
    const conversationMap = new Map();
    
    for (const message of conversations) {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Count unread messages from the other user
      if (message.receiverId === userId && !message.isRead) {
        conversationMap.get(otherUserId).unreadCount++;
      }
    }

    // Get user data for each conversation
    const result = [];
    for (const [otherUserId, data] of conversationMap) {
      const [user] = await db.select().from(users).where(eq(users.id, otherUserId));
      if (user) {
        result.push({
          user,
          lastMessage: data.lastMessage,
          unreadCount: data.unreadCount,
        });
      }
    }

    return result;
  }

  // Project subscription operations
  async subscribeToProject(userId: string, projectId: string): Promise<ProjectSubscription> {
    const id = nanoid();
    await db.insert(projectSubscriptions).values({
      id,
      userId,
      projectId,
    });

    const [subscription] = await db.select().from(projectSubscriptions).where(eq(projectSubscriptions.id, id));
    return subscription;
  }

  async unsubscribeFromProject(userId: string, projectId: string): Promise<void> {
    await db.delete(projectSubscriptions).where(
      and(eq(projectSubscriptions.userId, userId), eq(projectSubscriptions.projectId, projectId))
    );
  }

  async isSubscribedToProject(userId: string, projectId: string): Promise<boolean> {
    const [subscription] = await db.select().from(projectSubscriptions).where(
      and(eq(projectSubscriptions.userId, userId), eq(projectSubscriptions.projectId, projectId))
    );
    return !!subscription;
  }

  // Project application operations
  async getProjectApplications(projectId: string): Promise<(ProjectApplication & { user: User })[]> {
    const results = await db
      .select()
      .from(projectApplications)
      .innerJoin(users, eq(projectApplications.userId, users.id))
      .where(eq(projectApplications.projectId, projectId))
      .orderBy(desc(projectApplications.appliedAt));

    return results.map(result => ({
      ...result.project_applications,
      user: result.users,
    }));
  }

  async getUserApplications(userId: string): Promise<(ProjectApplication & { project: Project & { company: User } })[]> {
    const results = await db
      .select()
      .from(projectApplications)
      .innerJoin(projects, eq(projectApplications.projectId, projects.id))
      .innerJoin(users, eq(projects.companyUserId, users.id))
      .where(eq(projectApplications.userId, userId))
      .orderBy(desc(projectApplications.appliedAt));

    return results.map(result => ({
      ...result.project_applications,
      project: {
        ...result.projects,
        company: result.users,
      },
    }));
  }

  async createProjectApplication(application: InsertProjectApplication): Promise<ProjectApplication> {
    const id = nanoid();
    await db.insert(projectApplications).values({
      id,
      ...application,
    });

    const [createdApplication] = await db.select().from(projectApplications).where(eq(projectApplications.id, id));
    return createdApplication;
  }

  async updateProjectApplicationStatus(applicationId: string, status: string, respondedBy: string): Promise<ProjectApplication> {
    await db.update(projectApplications)
      .set({
        status: status as any,
        respondedAt: new Date(),
        respondedBy,
      })
      .where(eq(projectApplications.id, applicationId));

    const [updatedApplication] = await db.select().from(projectApplications).where(eq(projectApplications.id, applicationId));
    return updatedApplication;
  }

  async getProjectApplicationsCount(projectId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(projectApplications)
      .where(eq(projectApplications.projectId, projectId));

    return result?.count || 0;
  }

  async getAcceptedProjectApplicationsCount(projectId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(projectApplications)
      .where(and(eq(projectApplications.projectId, projectId), eq(projectApplications.status, 'accepted')));

    return result?.count || 0;
  }

  // Project preventive operations
  async getProjectPreventives(userId: string): Promise<ProjectPreventive[]> {
    return await db.select().from(projectPreventives).where(eq(projectPreventives.userId, userId));
  }

  async createProjectPreventive(preventive: InsertProjectPreventive): Promise<ProjectPreventive> {
    const id = nanoid();
    await db.insert(projectPreventives).values({
      id,
      ...preventive,
    });

    const [createdPreventive] = await db.select().from(projectPreventives).where(eq(projectPreventives.id, id));
    return createdPreventive;
  }

  async updateProjectPreventive(id: string, preventive: Partial<InsertProjectPreventive>): Promise<ProjectPreventive> {
    await db.update(projectPreventives)
      .set({
        ...preventive,
        updatedAt: new Date(),
      })
      .where(eq(projectPreventives.id, id));

    const [updatedPreventive] = await db.select().from(projectPreventives).where(eq(projectPreventives.id, id));
    return updatedPreventive;
  }

  async deleteProjectPreventive(id: string): Promise<void> {
    await db.delete(projectPreventives).where(eq(projectPreventives.id, id));
  }

  async validateProjectAgainstPreventives(project: InsertProject, userId: string): Promise<string[]> {
    const preventives = await db.select().from(projectPreventives).where(
      and(
        or(eq(projectPreventives.userId, userId), eq(projectPreventives.isGlobal, true)),
        eq(projectPreventives.isActive, true)
      )
    );

    const errors: string[] = [];

    for (const preventive of preventives) {
      try {
        const rule = JSON.parse(preventive.validationRule);
        
        // Simple validation logic - can be extended
        if (rule.type === 'budget' && rule.minBudget && project.budgetMin && Number(project.budgetMin) < rule.minBudget) {
          errors.push(preventive.errorMessage);
        }
        
        if (rule.type === 'skills' && rule.requiredSkills && project.requiredSkills) {
          const projectSkills = Array.isArray(project.requiredSkills) ? project.requiredSkills : [];
          const hasRequiredSkills = rule.requiredSkills.some((skill: string) => 
            projectSkills.some(ps => ps.toLowerCase().includes(skill.toLowerCase()))
          );
          
          if (!hasRequiredSkills) {
            errors.push(preventive.errorMessage);
          }
        }
      } catch (e) {
        // Skip invalid validation rules
        console.error('Invalid validation rule:', e);
      }
    }

    return errors;
  }
}

export const storage = new DatabaseStorage();