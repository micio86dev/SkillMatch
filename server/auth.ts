import bcrypt from "bcrypt";

declare module "express-session" {
  interface Session {
    userId?: string;
  }
}
import session from "express-session";
import MySQLStore from "express-mysql-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { translateMessage, getUserLanguage } from "./translations";

const SALT_ROUNDS = 12;

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const MySQLStoreConstructor = MySQLStore(session);
  const sessionStore = new MySQLStoreConstructor({
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '3306'),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutes
    expiration: sessionTtl,
    createDatabaseTable: false,
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: translateMessage("Unauthorized") });
  }
  next();
};

export function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
}