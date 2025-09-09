import * as bcrypt from "bcrypt";
import * as session from "express-session";
import MongoStore = require("connect-mongo");
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { translateMessage, getUserLanguage } from "./translations";
import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface Session {
    userId?: string;
  }
}
// ... existing code ...