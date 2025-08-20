import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type", { enum: ["professional", "company"] }).notNull().default("professional"),
  language: varchar("language", { length: 5 }).default("en"),
  isEmailVerified: boolean("is_email_verified").default(false),
  isBot: boolean("is_bot").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// IT Professional profiles
export const professionalProfiles = pgTable("professional_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title"),
  bio: text("bio"),
  cv: text("cv"),
  skills: text("skills").array(),
  seniorityLevel: varchar("seniority_level", { enum: ["junior", "mid", "senior", "lead", "principal"] }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  availability: varchar("availability", { enum: ["available", "partially_available", "unavailable"] }).default("available"),
  cvUrl: varchar("cv_url"),
  portfolioUrl: varchar("portfolio_url"),
  githubUrl: varchar("github_url"),
  linkedinUrl: varchar("linkedin_url"),
  twitterUrl: varchar("twitter_url"),
  websiteUrl: varchar("website_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Company profiles
export const companyProfiles = pgTable("company_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  companyName: varchar("company_name"),
  description: text("description"),
  industry: varchar("industry"),
  websiteUrl: varchar("website_url"),
  linkedinUrl: varchar("linkedin_url"),
  location: varchar("location"),
  companySize: varchar("company_size", { enum: ["1-10", "11-50", "51-200", "201-1000", "1000+"] }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects posted by companies
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyUserId: varchar("company_user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  requiredSkills: text("required_skills").array(),
  seniorityLevel: varchar("seniority_level", { enum: ["junior", "mid", "senior", "lead", "principal"] }),
  contractType: varchar("contract_type", { enum: ["hourly", "project_based", "full_time", "part_time"] }).default("project_based"),
  teamSize: integer("team_size").default(1),
  estimatedHours: integer("estimated_hours"),
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
  status: varchar("status", { enum: ["open", "in_review", "assigned", "completed", "cancelled"] }).default("open"),
  location: varchar("location"),
  isRemote: boolean("is_remote").default(true),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social posts
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(true),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post likes
export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comment likes
export const commentLikes = pgTable("comment_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commentId: varchar("comment_id").references(() => postComments.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project likes
export const projectLikes = pgTable("project_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project subscriptions - professionals can subscribe to projects for updates
export const projectSubscriptions = pgTable("project_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project applications - professionals apply to join projects, companies can accept/reject
export const projectApplications = pgTable("project_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: varchar("status", { enum: ["pending", "accepted", "rejected"] }).default("pending"),
  coverLetter: text("cover_letter"),
  proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }),
  appliedAt: timestamp("applied_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  respondedBy: varchar("responded_by").references(() => users.id),
});

// Project preventives - custom validation rules for projects
export const projectPreventives = pgTable("project_preventives", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  validationRule: text("validation_rule").notNull(), // JSON string with validation logic
  errorMessage: text("error_message").notNull(),
  category: varchar("category", { enum: ["budget", "timeline", "team", "skills", "general"] }).default("general"),
  isActive: boolean("is_active").default(true),
  isGlobal: boolean("is_global").default(false), // Global preventives apply to all users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post comments
export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professional connections
export const connections = pgTable("connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => users.id).notNull(),
  addresseeId: varchar("addressee_id").references(() => users.id).notNull(),
  status: varchar("status", { enum: ["pending", "accepted", "declined"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages between users
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ratings and feedback
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").references(() => users.id).notNull(),
  toUserId: varchar("to_user_id").references(() => users.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type", { enum: ["message", "like", "comment", "feedback", "connection"] }).notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  relatedId: varchar("related_id"), // ID of related post, message, etc.
  relatedUserId: varchar("related_user_id").references(() => users.id), // User who triggered the notification
  isRead: boolean("is_read").default(false),
  isEmailSent: boolean("is_email_sent").default(false),
  isPushSent: boolean("is_push_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User notification preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  messageInApp: boolean("message_in_app").default(true),
  messageEmail: boolean("message_email").default(false),
  messagePush: boolean("message_push").default(false),
  likeInApp: boolean("like_in_app").default(true),
  likeEmail: boolean("like_email").default(false),
  likePush: boolean("like_push").default(false),
  commentInApp: boolean("comment_in_app").default(true),
  commentEmail: boolean("comment_email").default(false),
  commentPush: boolean("comment_push").default(false),
  feedbackInApp: boolean("feedback_in_app").default(true),
  feedbackEmail: boolean("feedback_email").default(false),
  feedbackPush: boolean("feedback_push").default(false),
  weeklyDigest: boolean("weekly_digest").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  professionalProfile: one(professionalProfiles, {
    fields: [users.id],
    references: [professionalProfiles.userId],
  }),
  companyProfile: one(companyProfiles, {
    fields: [users.id],
    references: [companyProfiles.userId],
  }),
  posts: many(posts),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  sentFeedback: many(feedback, { relationName: "sentFeedback" }),
  receivedFeedback: many(feedback, { relationName: "receivedFeedback" }),
  notifications: many(notifications),
  notificationPreferences: one(notificationPreferences, {
    fields: [users.id],
    references: [notificationPreferences.userId],
  }),
  projectSubscriptions: many(projectSubscriptions),
  projectApplications: many(projectApplications),
  projectPreventives: many(projectPreventives),
}));

export const professionalProfilesRelations = relations(professionalProfiles, ({ one }) => ({
  user: one(users, {
    fields: [professionalProfiles.userId],
    references: [users.id],
  }),
}));

export const companyProfilesRelations = relations(companyProfiles, ({ one }) => ({
  user: one(users, {
    fields: [companyProfiles.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(users, {
    fields: [projects.companyUserId],
    references: [users.id],
  }),
  likes: many(projectLikes),
  subscriptions: many(projectSubscriptions),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
  comments: many(postComments),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const commentLikesRelations = relations(commentLikes, ({ one }) => ({
  comment: one(postComments, {
    fields: [commentLikes.commentId],
    references: [postComments.id],
  }),
  user: one(users, {
    fields: [commentLikes.userId],
    references: [users.id],
  }),
}));

export const projectLikesRelations = relations(projectLikes, ({ one }) => ({
  project: one(projects, {
    fields: [projectLikes.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectLikes.userId],
    references: [users.id],
  }),
}));

export const projectSubscriptionsRelations = relations(projectSubscriptions, ({ one }) => ({
  project: one(projects, {
    fields: [projectSubscriptions.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectSubscriptions.userId],
    references: [users.id],
  }),
}));

export const projectApplicationsRelations = relations(projectApplications, ({ one }) => ({
  project: one(projects, {
    fields: [projectApplications.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectApplications.userId],
    references: [users.id],
  }),
  respondedByUser: one(users, {
    fields: [projectApplications.respondedBy],
    references: [users.id],
  }),
}));

export const projectPreventivesRelations = relations(projectPreventives, ({ one }) => ({
  user: one(users, {
    fields: [projectPreventives.userId],
    references: [users.id],
  }),
}));

export const postCommentsRelations = relations(postComments, ({ one, many }) => ({
  post: one(posts, {
    fields: [postComments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
  likes: many(commentLikes),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  requester: one(users, {
    fields: [connections.requesterId],
    references: [users.id],
  }),
  addressee: one(users, {
    fields: [connections.addresseeId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  fromUser: one(users, {
    fields: [feedback.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [feedback.toUserId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [feedback.projectId],
    references: [projects.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  relatedUser: one(users, {
    fields: [notifications.relatedUserId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isEmailVerified: true,
}).extend({
  language: z.string().optional(),
});

// Authentication schemas
export const registerUserSchema = z.object({
  email: z.string().email("validation.email"),
  password: z.string().min(8, "validation.passwordLength"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "validation.firstNameRequired"),
  lastName: z.string().min(1, "validation.lastNameRequired"),
  userType: z.enum(["professional", "company"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "validation.passwordsDontMatch",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email("validation.email"),
  password: z.string().min(1, "validation.passwordRequired"),
});

export const insertProfessionalProfileSchema = createInsertSchema(professionalProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  cv: z.string().optional(),
  twitterUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
});

export const insertCompanyProfileSchema = createInsertSchema(companyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).refine(
  (data) => {
    // Preventive 1: Budget range validation - budgetMin must be less than budgetMax
    if (data.budgetMin && data.budgetMax && Number(data.budgetMin) >= Number(data.budgetMax)) {
      return false;
    }
    return true;
  },
  {
    message: "Minimum budget must be less than maximum budget",
    path: ["budgetMin"],
  }
).refine(
  (data) => {
    // Preventive 2: Minimum budget threshold - prevent unreasonably low budgets
    if (data.budgetMin && Number(data.budgetMin) < 50) {
      return false;
    }
    if (data.budgetMax && Number(data.budgetMax) < 50) {
      return false;
    }
    return true;
  },
  {
    message: "Budget must be at least $50 to ensure fair compensation",
    path: ["budgetMin"],
  }
).refine(
  (data) => {
    // Preventive 3: Maximum budget limit - prevent spam or unrealistic budgets
    if (data.budgetMin && Number(data.budgetMin) > 1000000) {
      return false;
    }
    if (data.budgetMax && Number(data.budgetMax) > 1000000) {
      return false;
    }
    return true;
  },
  {
    message: "Budget cannot exceed $1,000,000. Contact support for larger projects",
    path: ["budgetMax"],
  }
);

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  isEmailSent: true,
  isPushSent: true,
  createdAt: true,
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;

// Job imports tracking table
export const jobImports = pgTable("job_imports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  companyName: varchar("company_name"),
  sourceUrl: varchar("source_url").notNull(),
  importedAt: timestamp("imported_at").defaultNow(),
});

export type JobImport = typeof jobImports.$inferSelect;
export type InsertJobImport = typeof jobImports.$inferInsert;
export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type InsertProfessionalProfile = z.infer<typeof insertProfessionalProfileSchema>;
export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type ProjectSubscription = typeof projectSubscriptions.$inferSelect;
export type InsertProjectSubscription = typeof projectSubscriptions.$inferInsert;
export type ProjectApplication = typeof projectApplications.$inferSelect;
export type InsertProjectApplication = typeof projectApplications.$inferInsert;
export type ProjectPreventive = typeof projectPreventives.$inferSelect;
export type InsertProjectPreventive = typeof projectPreventives.$inferInsert;

// Schemas for project subscriptions
export const insertProjectSubscriptionSchema = createInsertSchema(projectSubscriptions).omit({
  id: true,
  createdAt: true,
});

// Schemas for project applications
export const insertProjectApplicationSchema = createInsertSchema(projectApplications).omit({
  id: true,
  appliedAt: true,
  respondedAt: true,
  respondedBy: true,
});

// Schemas for project preventives
export const insertProjectPreventiveSchema = createInsertSchema(projectPreventives).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
