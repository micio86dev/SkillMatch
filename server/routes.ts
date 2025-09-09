import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { extendedStorage as storage } from "./storage";
import { hashPassword, verifyPassword, isAuthenticated as sessionAuth } from "./auth";
import { setupAuth } from "./auth";
import {
  insertProfessionalProfileSchema,
  insertCompanyProfileSchema,
  insertProjectSchema,
  insertPostSchema,
  insertMessageSchema,
  insertFeedbackSchema,
  insertNotificationPreferencesSchema,
  insertProjectApplicationSchema,
  insertProjectPreventiveSchema,
  registerUserSchema,
  loginUserSchema,
} from "../shared/schema";
import { notificationService, createMessageNotification, createLikeNotification, createCommentLikeNotification, createProjectLikeNotification, createCommentNotification, createFeedbackNotification } from "./notifications";
// ... existing code ...