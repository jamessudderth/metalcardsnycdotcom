import {
  users, userProfiles, userLinks, businessCards, profileVisits, orders, localUsers, svgTemplates,
  type User, type UpsertUser, type UserProfile, type InsertUserProfile,
  type UserLink, type InsertUserLink, type BusinessCard, type InsertBusinessCard,
  type ProfileVisit, type InsertProfileVisit, type LocalUser, type InsertLocalUser,
  type SvgTemplate, type InsertSvgTemplate
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Local user operations
  getLocalUser(id: number): Promise<LocalUser | undefined>;
  getLocalUserByEmail(email: string): Promise<LocalUser | undefined>;
  getLocalUserByUsername(username: string): Promise<LocalUser | undefined>;
  createLocalUser(user: InsertLocalUser): Promise<LocalUser>;
  updateLocalUser(id: number, user: Partial<InsertLocalUser>): Promise<LocalUser>;
  
  // Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: number, profile: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Link operations
  getUserLinks(profileId: number): Promise<UserLink[]>;
  createUserLink(link: InsertUserLink): Promise<UserLink>;
  updateUserLink(id: number, link: Partial<InsertUserLink>): Promise<UserLink>;
  deleteUserLink(id: number): Promise<void>;
  clearUserLinks(profileId: number): Promise<void>;
  
  // Business card operations
  getBusinessCard(id: number): Promise<BusinessCard | undefined>;
  getBusinessCardByProfileId(profileId: number): Promise<BusinessCard | undefined>;
  createBusinessCard(card: InsertBusinessCard): Promise<BusinessCard>;
  updateBusinessCard(id: number, card: Partial<InsertBusinessCard>): Promise<BusinessCard>;
  saveBusinessCard(card: InsertBusinessCard): Promise<BusinessCard>;
  getPendingBusinessCards(): Promise<BusinessCard[]>;
  
  // Profile visit operations
  recordProfileVisit(visit: InsertProfileVisit): Promise<ProfileVisit>;
  getProfileVisits(profileId: number): Promise<ProfileVisit[]>;
  
  // Order operations
  getAllOrders(): Promise<any[]>;
  getOrder(id: number): Promise<any>;
  updateOrderStatus(id: number, status: string): Promise<any>;
  
  // Local user profile operations
  getLocalUserProfile(localUserId: number): Promise<UserProfile | undefined>;
  
  // SVG Template operations
  getAllSvgTemplates(): Promise<SvgTemplate[]>;
  getActiveSvgTemplates(): Promise<SvgTemplate[]>;
  getSvgTemplate(id: number): Promise<SvgTemplate | undefined>;
  createSvgTemplate(template: InsertSvgTemplate): Promise<SvgTemplate>;
  updateSvgTemplate(id: number, template: Partial<InsertSvgTemplate>): Promise<SvgTemplate>;
  deleteSvgTemplate(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  // Local user operations
  async getLocalUser(id: number): Promise<LocalUser | undefined> {
    const [user] = await db.select().from(localUsers).where(eq(localUsers.id, id));
    return user;
  }

  async getLocalUserByEmail(email: string): Promise<LocalUser | undefined> {
    const [user] = await db.select().from(localUsers).where(eq(localUsers.email, email));
    return user;
  }

  async getLocalUserByUsername(username: string): Promise<LocalUser | undefined> {
    const [user] = await db.select().from(localUsers).where(eq(localUsers.username, username));
    return user;
  }

  async createLocalUser(userData: InsertLocalUser): Promise<LocalUser> {
    const [user] = await db
      .insert(localUsers)
      .values(userData)
      .returning();
    return user;
  }

  async updateLocalUser(id: number, userData: Partial<InsertLocalUser>): Promise<LocalUser> {
    const [user] = await db
      .update(localUsers)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(localUsers.id, id))
      .returning();
    return user;
  }

  // Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async getLocalUserProfile(localUserId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.localUserId, localUserId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db
      .insert(userProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateUserProfile(id: number, profile: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  // Link operations
  async getUserLinks(profileId: number): Promise<UserLink[]> {
    return await db.select().from(userLinks).where(eq(userLinks.profileId, profileId));
  }

  async createUserLink(link: InsertUserLink): Promise<UserLink> {
    const [newLink] = await db
      .insert(userLinks)
      .values(link)
      .returning();
    return newLink;
  }

  async updateUserLink(id: number, link: Partial<InsertUserLink>): Promise<UserLink> {
    const [updatedLink] = await db
      .update(userLinks)
      .set({
        ...link,
        updatedAt: new Date(),
      })
      .where(eq(userLinks.id, id))
      .returning();
    return updatedLink;
  }

  async deleteUserLink(id: number): Promise<void> {
    await db.delete(userLinks).where(eq(userLinks.id, id));
  }

  async clearUserLinks(profileId: number): Promise<void> {
    await db.delete(userLinks).where(eq(userLinks.profileId, profileId));
  }

  // Business card operations
  async getBusinessCard(id: number): Promise<BusinessCard | undefined> {
    const [card] = await db.select().from(businessCards).where(eq(businessCards.id, id));
    return card;
  }

  async getBusinessCardByProfileId(profileId: number): Promise<BusinessCard | undefined> {
    const [card] = await db.select().from(businessCards).where(eq(businessCards.profileId, profileId));
    return card;
  }

  async createBusinessCard(card: InsertBusinessCard): Promise<BusinessCard> {
    const [newCard] = await db
      .insert(businessCards)
      .values(card)
      .returning();
    return newCard;
  }

  async updateBusinessCard(id: number, card: Partial<InsertBusinessCard>): Promise<BusinessCard> {
    const [updatedCard] = await db
      .update(businessCards)
      .set({
        ...card,
        updatedAt: new Date(),
      })
      .where(eq(businessCards.id, id))
      .returning();
    return updatedCard;
  }

  async saveBusinessCard(card: InsertBusinessCard): Promise<BusinessCard> {
    return this.createBusinessCard(card);
  }

  async getPendingBusinessCards(): Promise<BusinessCard[]> {
    return await db.select().from(businessCards).where(eq(businessCards.status, 'pending'));
  }

  async saveBusinessCard(card: InsertBusinessCard): Promise<BusinessCard> {
    return this.createBusinessCard(card);
  }

  async getPendingBusinessCards(): Promise<BusinessCard[]> {
    return await db.select().from(businessCards).where(eq(businessCards.status, 'pending'));
  }

  // Profile visit operations
  async recordProfileVisit(visit: InsertProfileVisit): Promise<ProfileVisit> {
    const [newVisit] = await db
      .insert(profileVisits)
      .values(visit)
      .returning();
    return newVisit;
  }

  async getProfileVisits(profileId: number): Promise<ProfileVisit[]> {
    return await db.select().from(profileVisits).where(eq(profileVisits.profileId, profileId));
  }
  
  // Order operations
  async getAllOrders(): Promise<any[]> {
    return await db.select().from(orders);
  }
  
  async getOrder(id: number): Promise<any> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<any> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
  
  // SVG Template operations
  async getAllSvgTemplates(): Promise<SvgTemplate[]> {
    return await db.select().from(svgTemplates);
  }
  
  async getActiveSvgTemplates(): Promise<SvgTemplate[]> {
    return await db.select().from(svgTemplates).where(eq(svgTemplates.isActive, true));
  }
  
  async getSvgTemplate(id: number): Promise<SvgTemplate | undefined> {
    const [template] = await db.select().from(svgTemplates).where(eq(svgTemplates.id, id));
    return template;
  }
  
  async createSvgTemplate(template: InsertSvgTemplate): Promise<SvgTemplate> {
    const [newTemplate] = await db
      .insert(svgTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }
  
  async updateSvgTemplate(id: number, template: Partial<InsertSvgTemplate>): Promise<SvgTemplate> {
    const [updatedTemplate] = await db
      .update(svgTemplates)
      .set({
        ...template,
        updatedAt: new Date(),
      })
      .where(eq(svgTemplates.id, id))
      .returning();
    return updatedTemplate;
  }
  
  async deleteSvgTemplate(id: number): Promise<void> {
    await db.delete(svgTemplates).where(eq(svgTemplates.id, id));
  }
}

export const storage = new DatabaseStorage();
