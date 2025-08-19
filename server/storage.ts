import {
  users,
  professionalProfiles,
  companyProfiles,
  projects,
  posts,
  postLikes,
  postComments,
  messages,
  feedback,
  connections,
  type User,
  type UpsertUser,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  }): Promise<(ProfessionalProfile & { user: User })[]>;
  
  // Company profile operations
  getCompanyProfile(userId: string): Promise<CompanyProfile | undefined>;
  createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile>;
  updateCompanyProfile(userId: string, profile: Partial<InsertCompanyProfile>): Promise<CompanyProfile>;
  
  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjects(filters?: { status?: string; companyUserId?: string }): Promise<(Project & { company: User })[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project>;
  
  // Post operations
  getPosts(filters?: { userId?: string; isPublic?: boolean }): Promise<(Post & { user: User })[]>;
  createPost(post: InsertPost): Promise<Post>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  addComment(postId: string, userId: string, content: string): Promise<void>;
  
  // Message operations
  getConversation(userId1: string, userId2: string): Promise<(Message & { sender: User; receiver: User })[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<void>;
  getUnreadMessagesCount(userId: string): Promise<number>;
  
  // Feedback operations
  getFeedbackForUser(userId: string): Promise<(Feedback & { fromUser: User })[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Connection operations
  getConnections(userId: string, status?: string): Promise<(Connection & { requester: User; addressee: User })[]>;
  createConnection(requesterId: string, addresseeId: string): Promise<Connection>;
  updateConnectionStatus(id: string, status: string): Promise<Connection>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
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
  }): Promise<(ProfessionalProfile & { user: User })[]> {
    let query = db
      .select()
      .from(professionalProfiles)
      .innerJoin(users, eq(professionalProfiles.userId, users.id));

    const conditions = [];

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

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
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
      .orderBy(desc(messages.createdAt));

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

    const query = db
      .select()
      .from(connections)
      .innerJoin(users, eq(connections.requesterId, users.id))
      .where(and(...conditions));

    const results = await query;
    return results.map(result => ({
      ...result.connections,
      requester: result.users,
      addressee: result.users, // Note: This is simplified, in reality you'd need a more complex query
    }));
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
}

export const storage = new DatabaseStorage();
