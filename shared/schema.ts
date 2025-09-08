import { z } from "zod";

// Re-export all Prisma types
export * from '../generated/prisma';

// Session storage interface for compatibility
export interface ISession {
  sid: string;
  sess: any;
  expire: Date;
}

// Validation schemas
export const insertUserSchema = z.object({
  email: z.string().email("validation.email"),
  password: z.string().min(8, "validation.passwordLength"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  userType: z.enum(["PROFESSIONAL", "COMPANY"]).default("PROFESSIONAL"),
  language: z.string().default("en"),
  isEmailVerified: z.boolean().default(false),
  isBot: z.boolean().default(false),
});

// Authentication schemas
export const registerUserSchema = z.object({
  email: z.string().email("validation.email"),
  password: z.string().min(8, "validation.passwordLength"),
  confirmPassword: z.string(),
  firstName: z.string().min(1, "validation.firstNameRequired"),
  lastName: z.string().min(1, "validation.lastNameRequired"),
  userType: z.enum(["PROFESSIONAL", "COMPANY"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "validation.passwordsDontMatch",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email("validation.email"),
  password: z.string().min(1, "validation.passwordRequired"),
});

export const insertProfessionalProfileSchema = z.object({
  userId: z.string(),
  title: z.string().optional(),
  bio: z.string().optional(),
  cv: z.string().optional(),
  skills: z.array(z.string()).optional(),
  seniorityLevel: z.enum(["JUNIOR", "MID", "SENIOR", "LEAD", "PRINCIPAL"]).optional(),
  hourlyRate: z.number().optional(),
  availability: z.enum(["AVAILABLE", "PARTIALLY_AVAILABLE", "UNAVAILABLE"]).default("AVAILABLE"),
  cvUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
});

export const insertCompanyProfileSchema = z.object({
  userId: z.string(),
  companyName: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  websiteUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  location: z.string().optional(),
  companySize: z.enum(["SIZE_1_10", "SIZE_11_50", "SIZE_51_200", "SIZE_201_1000", "SIZE_1000_PLUS"]).optional(),
});

export const insertProjectSchema = z.object({
  companyUserId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  seniorityLevel: z.enum(["JUNIOR", "MID", "SENIOR", "LEAD", "PRINCIPAL"]).optional(),
  contractType: z.enum(["HOURLY", "PROJECT_BASED", "FULL_TIME", "PART_TIME"]).default("PROJECT_BASED"),
  teamSize: z.number().default(1),
  estimatedHours: z.number().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  status: z.enum(["OPEN", "IN_REVIEW", "ASSIGNED", "COMPLETED", "CANCELLED"]).default("OPEN"),
  location: z.string().optional(),
  isRemote: z.boolean().default(true),
  likesCount: z.number().default(0),
}).refine(
  (data) => {
    // Preventive 1: Budget range validation - budgetMin must be less than budgetMax
    if (data.budgetMin && data.budgetMax && data.budgetMin >= data.budgetMax) {
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
    if (data.budgetMin && data.budgetMin < 50) {
      return false;
    }
    if (data.budgetMax && data.budgetMax < 50) {
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
    if (data.budgetMin && data.budgetMin > 1000000) {
      return false;
    }
    if (data.budgetMax && data.budgetMax > 1000000) {
      return false;
    }
    return true;
  },
  {
    message: "Budget cannot exceed $1,000,000. Contact support for larger projects",
    path: ["budgetMax"],
  }
);

export const insertPostSchema = z.object({
  userId: z.string(),
  content: z.string().min(1),
  isPublic: z.boolean().default(true),
});

export const insertPostCommentSchema = z.object({
  postId: z.string(),
  userId: z.string(),
  content: z.string().min(1),
});

export const insertConnectionSchema = z.object({
  requesterId: z.string(),
  addresseeId: z.string(),
  status: z.enum(["PENDING", "ACCEPTED", "DECLINED"]).default("PENDING"),
});

export const insertMessageSchema = z.object({
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string().min(1),
  isRead: z.boolean().default(false),
});

export const insertFeedbackSchema = z.object({
  fromUserId: z.string(),
  toUserId: z.string(),
  projectId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const insertNotificationSchema = z.object({
  userId: z.string(),
  type: z.enum(["MESSAGE", "LIKE", "COMMENT", "FEEDBACK", "CONNECTION", "APPLICATION_RECEIVED", "APPLICATION_ACCEPTED", "APPLICATION_REJECTED"]),
  title: z.string().min(1),
  message: z.string().min(1),
  relatedId: z.string().optional(),
  relatedUserId: z.string().optional(),
  isRead: z.boolean().default(false),
  isEmailSent: z.boolean().default(false),
  isPushSent: z.boolean().default(false),
});

export const insertNotificationPreferencesSchema = z.object({
  userId: z.string(),
  messageInApp: z.boolean().default(true),
  messageEmail: z.boolean().default(false),
  messagePush: z.boolean().default(false),
  likeInApp: z.boolean().default(true),
  likeEmail: z.boolean().default(false),
  likePush: z.boolean().default(false),
  commentInApp: z.boolean().default(true),
  commentEmail: z.boolean().default(false),
  commentPush: z.boolean().default(false),
  feedbackInApp: z.boolean().default(true),
  feedbackEmail: z.boolean().default(false),
  feedbackPush: z.boolean().default(false),
  weeklyDigest: z.boolean().default(true),
});

export const insertProjectPreventiveSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  validationRule: z.string().min(1, "validation.validationRuleRequired"),
  errorMessage: z.string().min(1),
  category: z.enum(["BUDGET", "TIMELINE", "TEAM", "SKILLS", "GENERAL"]).default("GENERAL"),
  isActive: z.boolean().default(true),
  isGlobal: z.boolean().default(false),
});

export const insertProjectSubscriptionSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
});

export const insertProjectApplicationSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]).default("PENDING"),
  coverLetter: z.string().optional(),
  proposedRate: z.number().optional(),
  appliedAt: z.date().default(() => new Date()),
  respondedAt: z.date().optional(),
  respondedBy: z.string().optional(),
});

// Type exports for backward compatibility
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertProfessionalProfile = z.infer<typeof insertProfessionalProfileSchema>;
export type InsertCompanyProfile = z.infer<typeof insertCompanyProfileSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type InsertProjectPreventive = z.infer<typeof insertProjectPreventiveSchema>;
export type InsertProjectSubscription = z.infer<typeof insertProjectSubscriptionSchema>;
export type InsertProjectApplication = z.infer<typeof insertProjectApplicationSchema>;