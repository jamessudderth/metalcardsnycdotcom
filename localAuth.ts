import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { LocalUser } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerLocalUser(userData: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<LocalUser> {
  // Check if user already exists
  const existingUser = await storage.getLocalUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const existingUsername = await storage.getLocalUserByUsername(userData.username);
  if (existingUsername) {
    throw new Error("Username already taken");
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const user = await storage.createLocalUser({
    ...userData,
    password: hashedPassword,
  });

  return user;
}

export async function loginLocalUser(email: string, password: string): Promise<LocalUser | null> {
  const user = await storage.getLocalUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await comparePasswords(password, user.password);
  if (!isValid) {
    return null;
  }

  return user;
}