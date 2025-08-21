import {
  pgTable,
  text,
  varchar,
  timestamp,
  serial,
  jsonb,
  index,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Local user accounts table for direct website registration
export const localUsers = pgTable("local_users", {
  id: serial("id").primaryKey(),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // hashed password
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => localUsers.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  localUserId: integer("local_user_id").references(() => localUsers.id),
  fullName: varchar("full_name").notNull(),
  jobTitle: varchar("job_title"),
  email: varchar("email"), // Added for public card submissions
  phoneNumber: varchar("phone_number"),
  address: varchar("address"),
  customPhotoUrl: varchar("custom_photo_url"),
  logoUrl: varchar("logo_url"),
  bannerLogoUrl: varchar("banner_logo_url"),
  profileTemplate: varchar("profile_template").default("classic"),
  companyName: varchar("company_name"), // Added for public submissions
  website: varchar("website"), // Added for public submissions
  linkedinUrl: varchar("linkedin_url"), // Added for public submissions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userLinks = pgTable("user_links", {
  id: serial("id").primaryKey(),
  profileId: serial("profile_id").notNull().references(() => userProfiles.id),
  linkType: varchar("link_type").notNull(),
  url: varchar("url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businessCards = pgTable("business_cards", {
  id: serial("id").primaryKey(),
  profileId: serial("profile_id").notNull().references(() => userProfiles.id),
  templateId: serial("template_id").notNull(),
  customizations: jsonb("customizations"),
  qrCodeUrl: varchar("qr_code_url"),
  frontImageUrl: varchar("front_image_url"),
  backImageUrl: varchar("back_image_url"),
  status: varchar("status").default("pending").notNull(), // pending, approved, rejected
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profileVisits = pgTable("profile_visits", {
  id: serial("id").primaryKey(),
  profileId: serial("profile_id").notNull().references(() => userProfiles.id),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
});

// SVG Templates table for storing custom business card templates
export const svgTemplates = pgTable("svg_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  frontSvg: text("front_svg").notNull(),
  backSvg: text("back_svg").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
  links: many(userLinks),
  businessCards: many(businessCards),
  visits: many(profileVisits),
}));

export const userLinksRelations = relations(userLinks, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [userLinks.profileId],
    references: [userProfiles.id],
  }),
}));

export const businessCardsRelations = relations(businessCards, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [businessCards.profileId],
    references: [userProfiles.id],
  }),
}));

export const profileVisitsRelations = relations(profileVisits, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [profileVisits.profileId],
    references: [userProfiles.id],
  }),
}));

// Orders table for quote requests
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  companyName: varchar("company_name"),
  position: varchar("position").notNull(),
  quantity: integer("quantity").notNull(),
  cardType: varchar("card_type").notNull(),
  cardStyle: varchar("card_style").notNull(),
  deliveryOption: varchar("delivery_option"),
  specialRequests: text("special_requests"),
  logoUrl: varchar("logo_url"),
  status: varchar("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table for customer feedback
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name").notNull(),
  email: varchar("email").notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title").notNull(),
  comment: text("comment").notNull(),
  orderNumber: varchar("order_number"),
  verified: boolean("verified").default(false),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas for data validation
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export const insertUserLinkSchema = createInsertSchema(userLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserLink = z.infer<typeof insertUserLinkSchema>;
export type UserLink = typeof userLinks.$inferSelect;

export const insertBusinessCardSchema = createInsertSchema(businessCards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBusinessCard = z.infer<typeof insertBusinessCardSchema>;
export type BusinessCard = typeof businessCards.$inferSelect;

export const insertProfileVisitSchema = createInsertSchema(profileVisits).omit({
  id: true,
});
export type InsertProfileVisit = z.infer<typeof insertProfileVisitSchema>;
export type ProfileVisit = typeof profileVisits.$inferSelect;

export const insertLocalUserSchema = createInsertSchema(localUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const registerUserSchema = insertLocalUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Business card generation request schema
export const generateCardSchema = z.object({
  templateId: z.number(),
  autoSubmitForReview: z.boolean().default(true),
});

export const insertSvgTemplateSchema = createInsertSchema(svgTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSvgTemplate = z.infer<typeof insertSvgTemplateSchema>;
export type SvgTemplate = typeof svgTemplates.$inferSelect;
