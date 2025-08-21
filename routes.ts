import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateDesignSuggestions, analyzeDesignFeedback, generateColorPalette } from "./aiDesignAssistant";
import { registerLocalUser, loginLocalUser } from "./localAuth";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import { upload, processImage } from "./upload";
import { generateQRCode } from "./qrcode";
import { generateQRCodeBuffer } from "./qrcode-buffer";
import { cardRenderer } from "./cardRenderer";
import { templateService } from "./templateService";
import { removeBackground } from "./photoroom";
import { db } from "./db";
import { userProfiles } from "@shared/schema";
import { eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { insertUserProfileSchema, insertUserLinkSchema, insertBusinessCardSchema, orders, reviews } from "@shared/schema";
import multer from 'multer';
import session from "express-session";
import connectPg from "connect-pg-simple";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set('trust proxy', 1);
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  // Serve SVG templates statically
  app.use('/templates', express.static(path.join(process.cwd(), 'public', 'templates')));

  // Authentication middleware for local users only
  const isAuthenticated = async (req: any, res: any, next: any) => {
    if (req.session.localUserId) {
      try {
        const localUser = await storage.getLocalUser(req.session.localUserId);
        if (localUser) {
          req.localUser = localUser;
          return next();
        }
      } catch (error) {
        console.error("Error fetching local user:", error);
      }
    }
    
    return res.status(401).json({ message: "Authentication required" });
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      // Remove password from response for security
      const { password, ...userWithoutPassword } = req.localUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Registration route
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      const userRegistrationData = {
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
        firstName: validatedData.firstName || undefined,
        lastName: validatedData.lastName || undefined,
      };
      const user = await registerLocalUser(userRegistrationData);
      
      // Create session
      (req as any).session.localUserId = user.id;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", errors: error.format() });
      }
      res.status(400).json({ message: error.message });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const user = await loginLocalUser(validatedData.email, validatedData.password);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Create session
      (req as any).session.localUserId = user.id;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid login data", errors: error.format() });
      }
      res.status(500).json({ message: 'Failed to login' });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Profile routes
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const profile = await storage.getLocalUserProfile(req.localUser.id);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const links = await storage.getUserLinks(profile.id);
      
      res.json({ profile, links });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertUserProfileSchema.parse({
        ...req.body,
        localUserId: req.localUser.id,
      });
      
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateUserProfile(existingProfile.id, validatedData);
      } else {
        profile = await storage.createUserProfile(validatedData);
      }
      
      res.status(201).json({ success: true, profile });
    } catch (error) {
      console.error("Error creating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  // Add PUT /api/profile endpoint for CardDesigner compatibility
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const { links, ...profileData } = req.body;
      
      const validatedData = insertUserProfileSchema.parse({
        ...profileData,
        localUserId: req.localUser.id,
      });
      
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateUserProfile(existingProfile.id, validatedData);
      } else {
        profile = await storage.createUserProfile(validatedData);
      }

      // Handle links if provided
      if (links && Array.isArray(links)) {
        // Clear existing links for this profile
        await storage.clearUserLinks(profile.id);
        
        // Add new links
        for (const link of links) {
          if (link.url && link.url.trim() !== '') {
            await storage.createUserLink({
              profileId: profile.id,
              linkType: link.platform,
              url: link.url
            });
          }
        }
      }

      // Auto-generate business card for admin review (CardDesigner workflow)
      if (req.body.templateId && req.body.cardType) {
        try {
          // Generate QR code for the profile
          const host = req.get('host');
          const protocol = req.protocol;
          const profileUrl = `${protocol}://${host}/p/${profile.id}`;
          const qrCodePath = await generateQRCode(profileUrl, {
            color: "#000000",
            margin: 2
          });

          // Create business card entry for admin review
          const businessCardData = {
            profileId: profile.id,
            templateId: req.body.templateId,
            customizations: {
              cardType: req.body.cardType,
              customerInfo: {
                fullName: profile.fullName,
                jobTitle: profile.jobTitle,
                email: profile.email,
                phoneNumber: profile.phoneNumber,
                address: profile.address
              }
            },
            qrCodeUrl: qrCodePath,
            status: 'pending'
          };

          // Generate preview images using templateService
          try {
            const frontBuffer = await templateService.generateCardWithTemplate(
              req.body.templateId,
              {
                fullName: profile.fullName,
                jobTitle: profile.jobTitle || undefined,
                email: profile.email || undefined,
                phoneNumber: profile.phoneNumber || undefined,
                address: profile.address || undefined,
              },
              'front'
            );

            const backBuffer = await templateService.generateCardWithTemplate(
              req.body.templateId,
              {
                fullName: profile.fullName,
                jobTitle: profile.jobTitle || undefined,
                email: profile.email || undefined,
                phoneNumber: profile.phoneNumber || undefined,
                address: profile.address || undefined,
              },
              'back',
              qrCodePath
            );

            // Save preview images for admin dashboard
            const timestamp = Date.now();
            const frontFileName = `card-front-${profile.id}-${timestamp}.jpg`;
            const backFileName = `card-back-${profile.id}-${timestamp}.jpg`;
            
            const frontPath = path.join(process.cwd(), 'public', 'uploads', frontFileName);
            const backPath = path.join(process.cwd(), 'public', 'uploads', backFileName);
            
            // Ensure uploads directory exists
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            fs.writeFileSync(frontPath, frontBuffer);
            fs.writeFileSync(backPath, backBuffer);

            businessCardData.frontImageUrl = `/uploads/${frontFileName}`;
            businessCardData.backImageUrl = `/uploads/${backFileName}`;

          } catch (previewError) {
            console.error('Preview generation failed:', previewError);
          }

          // Save business card to admin dashboard
          await storage.createBusinessCard(businessCardData);
          console.log(`✅ Business card auto-submitted for admin review - Profile: ${profile.fullName}`);

        } catch (cardError) {
          console.error('Business card auto-submission failed:', cardError);
          // Don't fail the profile creation if card generation fails
        }
      }
      
      res.json({ success: true, profile });
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.put('/api/profile/:id', isAuthenticated, async (req: any, res) => {
    try {
      const profileId = parseInt(req.params.id, 10);
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      
      if (!existingProfile || existingProfile.id !== profileId) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      
      const validatedData = insertUserProfileSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateUserProfile(profileId, validatedData);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Link routes
  app.post('/api/links', isAuthenticated, async (req: any, res) => {
    try {
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const validatedData = insertUserLinkSchema.parse({
        ...req.body,
        profileId: existingProfile.id,
      });
      
      const link = await storage.createUserLink(validatedData);
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid link data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create link" });
    }
  });

  app.put('/api/links/:id', isAuthenticated, async (req: any, res) => {
    try {
      const linkId = parseInt(req.params.id, 10);
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const validatedData = insertUserLinkSchema.partial().parse(req.body);
      const updatedLink = await storage.updateUserLink(linkId, validatedData);
      
      res.json(updatedLink);
    } catch (error) {
      console.error("Error updating link:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid link data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update link" });
    }
  });

  app.delete('/api/links/:id', isAuthenticated, async (req: any, res) => {
    try {
      const linkId = parseInt(req.params.id, 10);
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      await storage.deleteUserLink(linkId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting link:", error);
      res.status(500).json({ message: "Failed to delete link" });
    }
  });

  // File upload routes
  app.post('/api/upload/profile-image', isAuthenticated, upload.single('profileImage'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const processedPath = await processImage(req.file.path, {
        width: 300,
        height: 300,
        quality: 85
      });
      
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      
      if (existingProfile) {
        await storage.updateUserProfile(existingProfile.id, {
          customPhotoUrl: processedPath
        });
      }
      
      res.status(201).json({ url: processedPath });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  });

  app.post('/api/upload/logo', isAuthenticated, upload.single('logoImage'), async (req: any, res) => {
    try {
      console.log('Logo upload attempt - File received:', !!req.file);
      console.log('Request body:', req.body);
      console.log('File details:', req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file');
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const processedPath = await processImage(req.file.path, {
        width: 500,
        quality: 85
      });
      
      console.log('Processed path:', processedPath);
      
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      console.log('Existing profile found:', !!existingProfile);
      
      if (existingProfile) {
        await storage.updateUserProfile(existingProfile.id, {
          logoUrl: processedPath
        });
        console.log('Profile updated with logo URL');
      } else {
        console.log('No existing profile found, cannot update logo URL');
        return res.status(400).json({ message: "User profile not found. Please complete your profile first." });
      }
      
      res.status(201).json({ url: processedPath });
    } catch (error) {
      console.error("Error uploading logo:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ 
        message: "Failed to upload logo",
        error: error.message
      });
    }
  });

  app.post('/api/upload/banner-logo', isAuthenticated, upload.single('bannerLogoImage'), async (req: any, res) => {
    try {
      console.log('Banner logo upload attempt - File received:', !!req.file);
      console.log('File details:', req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : 'No file');
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const processedPath = await processImage(req.file.path, {
        width: 800,
        quality: 85
      });
      
      console.log('Banner logo processed path:', processedPath);
      
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      console.log('Existing profile found for banner logo:', !!existingProfile);
      
      if (existingProfile) {
        await storage.updateUserProfile(existingProfile.id, {
          bannerLogoUrl: processedPath
        });
        console.log('Profile updated with banner logo URL');
      } else {
        console.log('No existing profile found, cannot update banner logo URL');
        return res.status(400).json({ message: "User profile not found. Please complete your profile first." });
      }
      
      res.status(201).json({ url: processedPath });
    } catch (error) {
      console.error("Error uploading banner logo:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ 
        message: "Failed to upload banner logo",
        error: error.message
      });
    }
  });

  // Template preview routes using new template service
  app.get('/api/template-preview/:templateId/:side', async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId, 10);
      const side = req.params.side as 'front' | 'back';
      
      if (!['front', 'back'].includes(side)) {
        return res.status(400).json({ message: 'Invalid side parameter. Must be "front" or "back"' });
      }

      const imageBuffer = await templateService.getTemplatePreview(templateId, side);
      
      if (!imageBuffer) {
        return res.status(404).json({ message: 'Template preview not found' });
      }

      // Determine content type based on file content
      const contentType = imageBuffer.toString().startsWith('<svg') ? 'image/svg+xml' : 'image/png';

      res.set({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      });
      
      res.send(imageBuffer);
    } catch (error) {
      console.error('Error serving template preview:', error);
      res.status(500).json({ message: 'Failed to load template preview' });
    }
  });

  // Template customization endpoint for live customer data
  app.post('/api/template-customize/:templateId/:side', async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId, 10);
      const side = req.params.side as 'front' | 'back';
      const customerData = req.body;
      
      console.log(`Template customization request: templateId=${templateId}, side=${side}, customerData=`, customerData);
      
      if (!['front', 'back'].includes(side)) {
        return res.status(400).json({ message: 'Invalid side parameter. Must be "front" or "back"' });
      }

      const customizedSVG = await templateService.generateCustomizedSVG(templateId, side, customerData);
      
      console.log(`Generated SVG result: ${customizedSVG ? 'SUCCESS' : 'NULL'}`);
      console.log(`SVG content preview: ${customizedSVG ? customizedSVG.substring(0, 100) : 'NULL'}...`);
      
      if (!customizedSVG) {
        console.log('Returning 404 - template not found or customization failed');
        return res.status(404).json({ message: 'Template not found or customization failed' });
      }

      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      });
      
      res.send(customizedSVG);
    } catch (error) {
      console.error('Template customization error:', error);
      res.status(500).json({ message: 'Failed to customize template' });
    }
  });

  // Business card routes
  app.post('/api/cards', isAuthenticated, async (req: any, res) => {
    try {
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Generate QR code URL for the profile
      const host = req.get('host');
      const protocol = req.protocol;
      const profileUrl = `${protocol}://${host}/p/${existingProfile.id}`;
      const qrCodeUrl = await generateQRCode(profileUrl, {
        color: "#3B82F6",
        margin: 2
      });
      
      const validatedData = insertBusinessCardSchema.parse({
        ...req.body,
        profileId: existingProfile.id,
        qrCodeUrl
      });
      
      // Generate card preview images for admin review
      let frontImageUrl = null;
      let backImageUrl = null;
      
      try {
        // Get template from database or fallback
        const { cardTemplates } = await import("../client/src/lib/card-templates");
        const template = cardTemplates.find(t => t.id === validatedData.templateId) || cardTemplates[0];
        
        // Generate front and back card images
        const { CardRenderer } = await import('./cardRenderer');
        const cardRenderer = new CardRenderer();
        const result = await cardRenderer.renderDoubleSidedCard(
          existingProfile,
          template,
          qrCodeUrl,
          'jpeg'
        );
        
        // Save images to public directory for admin review
        const fs = await import('fs');
        const path = await import('path');
        
        const timestamp = Date.now();
        const frontFileName = `card-preview-front-${existingProfile.id}-${timestamp}.jpg`;
        const backFileName = `card-preview-back-${existingProfile.id}-${timestamp}.jpg`;
        
        const frontPath = path.join(process.cwd(), 'public', 'uploads', frontFileName);
        const backPath = path.join(process.cwd(), 'public', 'uploads', backFileName);
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        fs.writeFileSync(frontPath, result.front);
        fs.writeFileSync(backPath, result.back);
        
        frontImageUrl = `/uploads/${frontFileName}`;
        backImageUrl = `/uploads/${backFileName}`;
        
      } catch (error) {
        console.error('Error generating card preview images:', error);
        // Continue without preview images
      }
      
      // Add preview images and set status to pending for admin review
      const cardDataWithPreviews = {
        ...validatedData,
        frontImageUrl,
        backImageUrl,
        status: 'pending' // Automatically set to pending for admin review
      };
      
      // Check if card already exists for this profile
      const existingCard = await storage.getBusinessCardByProfileId(existingProfile.id);
      
      let card;
      if (existingCard) {
        card = await storage.updateBusinessCard(existingCard.id, cardDataWithPreviews);
      } else {
        card = await storage.createBusinessCard(cardDataWithPreviews);
      }
      
      res.status(201).json({
        ...card,
        message: "Business card created and submitted for admin review"
      });
    } catch (error) {
      console.error("Error creating business card:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid card data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create business card" });
    }
  });

  app.get('/api/cards', isAuthenticated, async (req: any, res) => {
    try {
      const existingProfile = await storage.getLocalUserProfile(req.localUser.id);
      
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const card = await storage.getBusinessCardByProfileId(existingProfile.id);
      if (!card) {
        return res.status(404).json({ message: "Business card not found" });
      }
      
      res.json(card);
    } catch (error) {
      console.error("Error fetching business card:", error);
      res.status(500).json({ message: "Failed to fetch business card" });
    }
  });

  // Public profile routes
  app.get('/api/p/:id', async (req, res) => {
    try {
      const profileId = parseInt(req.params.id, 10);
      
      // Get profile by ID (not user ID)
      const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, profileId));
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const links = await storage.getUserLinks(profile.id);
      
      // Record visit
      await storage.recordProfileVisit({
        profileId: profile.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || ''
      });
      
      res.json({ profile, links });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Stats routes
  app.get('/api/stats/visits', isAuthenticated, async (req: any, res) => {
    try {
      const localUserId = req.localUser.id;
      
      // Verify profile belongs to user
      const existingProfile = await storage.getLocalUserProfile(localUserId);
      if (!existingProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const visits = await storage.getProfileVisits(existingProfile.id);
      
      res.json({ totalVisits: visits.length, visits });
    } catch (error) {
      console.error("Error fetching profile visits:", error);
      res.status(500).json({ message: "Failed to fetch profile visits" });
    }
  });

  // Template customization endpoint - injects customer data into SVG templates for live preview
  app.post('/api/template-customize/:templateId/:side', async (req, res) => {
    try {
      const templateId = parseInt(req.params.templateId);
      const side = req.params.side as 'front' | 'back';
      const profileData = req.body;
      
      // Get template from database
      const [template] = await db.select().from(svgTemplates).where(eq(svgTemplates.id, templateId));
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Get appropriate SVG content
      let svgContent = side === 'front' ? template.frontSvg : template.backSvg;
      
      // Replace placeholders with actual customer data
      svgContent = svgContent
        .replace(/\{\{fullName\}\}/g, profileData.fullName || '')
        .replace(/\{\{jobTitle\}\}/g, profileData.jobTitle || '')
        .replace(/\{\{email\}\}/g, profileData.email || '')
        .replace(/\{\{phoneNumber\}\}/g, profileData.phoneNumber || '')
        .replace(/\{\{address\}\}/g, profileData.address || '');
      
      // For back side, add QR code if profile data exists
      if (side === 'back' && profileData.fullName) {
        try {
          const profileUrl = `${req.protocol}://${req.get('host')}/profile/guest`;
          const qrCodePath = await generateQRCode(profileUrl, {
            color: "#000000",
            background: "#ffffff",
            margin: 2,
            width: 200
          });
          
          // Read QR code and convert to base64
          const qrCodeBuffer = fs.readFileSync(qrCodePath);
          const qrCodeBase64 = qrCodeBuffer.toString('base64');
          const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;
          svgContent = svgContent.replace(/\{\{qrCode\}\}/g, qrCodeDataUrl);
        } catch (error) {
          console.error('QR code generation failed:', error);
          svgContent = svgContent.replace(/\{\{qrCode\}\}/g, '');
        }
      } else {
        svgContent = svgContent.replace(/\{\{qrCode\}\}/g, '');
      }
      
      // Return customized SVG
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svgContent);
      
    } catch (error) {
      console.error('Template customization error:', error);
      res.status(500).json({ message: "Failed to customize template" });
    }
  });

  // Card generation routes - Enhanced workflow with admin review
  app.post('/api/generate-card', isAuthenticated, async (req: any, res) => {
    try {
      const localUserId = req.localUser.id;
      const { templateId, format = 'jpeg', autoSubmitForReview = true } = req.body;
      
      // Get user profile
      const profile = await storage.getLocalUserProfile(localUserId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Get template from cardTemplates
      const { cardTemplates } = await import("../client/src/lib/card-templates");
      const template = cardTemplates.find(t => t.id === templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Generate QR code
      const host = req.get('host');
      const protocol = req.protocol;
      const profileUrl = `${protocol}://${host}/p/${profile.id}`;
      const qrCodePath = await generateQRCode(profileUrl, {
        color: "#000000",
        margin: 2
      });
      
      // Use new template service to generate cards with new PNG templates
      const frontBuffer = await templateService.generateCardWithTemplate(
        templateId,
        {
          fullName: profile.fullName,
          jobTitle: profile.jobTitle || undefined,
          email: profile.email || undefined,
          phoneNumber: profile.phoneNumber || undefined,
          address: profile.address || undefined,
          customPhotoUrl: profile.customPhotoUrl || undefined,
          logoUrl: profile.logoUrl || undefined
        },
        qrCodePath,
        'front'
      );
      
      const backBuffer = await templateService.generateCardWithTemplate(
        templateId,
        {
          fullName: profile.fullName,
          jobTitle: profile.jobTitle || undefined,
          email: profile.email || undefined,
          phoneNumber: profile.phoneNumber || undefined,
          address: profile.address || undefined,
          customPhotoUrl: profile.customPhotoUrl || undefined,
          logoUrl: profile.logoUrl || undefined
        },
        qrCodePath,
        'back'
      );
      
      if (!frontBuffer || !backBuffer) {
        return res.status(500).json({ message: "Failed to generate card using template" });
      }
      
      // Save card to admin review queue if requested
      if (autoSubmitForReview) {
        const businessCard = await storage.saveBusinessCard({
          profileId: profile.id,
          templateId: templateId,
          customizations: {
            template: template.name,
            cardType: template.category || "Standard",
            format: format
          },
          qrCodeUrl: profileUrl,
          frontImageUrl: `data:image/jpeg;base64,${frontBuffer.toString('base64')}`,
          backImageUrl: `data:image/jpeg;base64,${backBuffer.toString('base64')}`,
          status: 'pending'
        });
        
        console.log(`Business card submitted for admin review - Card ID: ${businessCard.id}, Customer: ${profile.fullName}`);
      }
      
      // Set appropriate headers
      const mimeType = 'image/jpeg';
      const extension = 'jpg';
      
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="business-card-${profile.fullName?.replace(/[^a-zA-Z0-9]/g, '-')}.zip"`
      });
      
      // Return both sides as base64 encoded data
      res.json({
        front: {
          data: frontBuffer.toString('base64'),
          filename: `business-card-front.${extension}`,
          mimeType
        },
        back: {
          data: backBuffer.toString('base64'),
          filename: `business-card-back.${extension}`,
          mimeType
        },
        submittedForReview: autoSubmitForReview,
        message: autoSubmitForReview ? "Card generated and submitted for admin review" : "Card generated successfully"
      });
      
    } catch (error) {
      console.error("Error generating card:", error);
      res.status(500).json({ message: "Failed to generate card" });
    }
  });

  // Generate single side for preview
  app.post('/api/generate-card-preview', isAuthenticated, async (req: any, res) => {
    try {
      const localUserId = req.localUser.id;
      const { templateId, side = 'front' } = req.body;
      
      const profile = await storage.getLocalUserProfile(localUserId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const { cardTemplates } = await import("../client/src/lib/card-templates");
      const template = cardTemplates.find(t => t.id === templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      let cardBuffer: Buffer;
      
      if (side === 'back') {
        const host = req.get('host');
        const protocol = req.protocol;
        const profileUrl = `${protocol}://${host}/p/${profile.id}`;
        const qrCodePath = await generateQRCode(profileUrl, {
          color: "#000000",
          margin: 2
        });
        
        cardBuffer = await cardRenderer.renderCardBack(
          {
            fullName: profile.fullName,
            jobTitle: profile.jobTitle || undefined,
            email: profile.email || undefined,
            phoneNumber: profile.phoneNumber || undefined,
            address: profile.address || undefined,
            customPhotoUrl: profile.customPhotoUrl || undefined,
            logoUrl: profile.logoUrl || undefined,
          },
          template,
          qrCodePath,
          'jpeg'
        );
      } else {
        cardBuffer = await cardRenderer.renderCardFront(
          {
            fullName: profile.fullName,
            jobTitle: profile.jobTitle || undefined,
            email: profile.email || undefined,
            phoneNumber: profile.phoneNumber || undefined,
            address: profile.address || undefined,
            customPhotoUrl: profile.customPhotoUrl || undefined,
            logoUrl: profile.logoUrl || undefined,
          },
          template,
          'jpeg'
        );
      }
      
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Length': cardBuffer.length.toString()
      });
      
      res.send(cardBuffer);
      
    } catch (error) {
      console.error("Error generating card preview:", error);
      res.status(500).json({ message: "Failed to generate card preview" });
    }
  });

  // Public demo card preview endpoint (no authentication required)
  app.post('/api/generate-demo-card', async (req, res) => {
    try {
      const { templateId, format = 'svg', demoData } = req.body;
      
      // Get template from cardTemplates
      const { cardTemplates } = await import("../client/src/lib/card-templates");
      const template = cardTemplates.find(t => t.id === templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      // Use demo data or default demo data
      const profileData = demoData || {
        fullName: 'John Doe',
        jobTitle: 'Business Professional',
        email: 'john@example.com',
        phoneNumber: '(555) 123-4567',
        address: 'New York, NY'
      };
      
      // Generate demo QR code
      const demoQrUrl = 'https://metalcardsnyc.com/demo-profile';
      const qrCodePath = await generateQRCode(demoQrUrl, {
        color: "#000000",
        margin: 2
      });
      
      // Generate both sides of the card
      let front: Buffer, back: Buffer;
      
      try {
        const result = await cardRenderer.renderDoubleSidedCard(
          profileData,
          template,
          qrCodePath,
          format as 'svg' | 'jpeg'
        );
        front = result.front;
        back = result.back;
      } catch (error) {
        console.warn('Template not found in database, using fallback:', error);
        // Use fallback rendering when template not found
        front = await cardRenderer.renderFallbackCard(profileData, 'front', qrCodePath, format as 'svg' | 'jpeg');
        back = await cardRenderer.renderFallbackCard(profileData, 'back', qrCodePath, format as 'svg' | 'jpeg');
      }
      
      // Set appropriate headers
      const mimeType = format === 'svg' ? 'image/svg+xml' : 'image/jpeg';
      const extension = format === 'svg' ? 'svg' : 'jpg';
      
      // Return both sides as base64 encoded data
      res.json({
        front: {
          data: front.toString('base64'),
          filename: `demo-card-front.${extension}`,
          mimeType
        },
        back: {
          data: back.toString('base64'),
          filename: `demo-card-back.${extension}`,
          mimeType
        }
      });
      
    } catch (error) {
      console.error("Error generating demo card preview:", error);
      res.status(500).json({ message: "Failed to generate demo card preview" });
    }
  });

  // SVG Template management endpoints
  app.get('/api/svg-templates', async (req, res) => {
    try {
      const templates = await storage.getActiveSvgTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching SVG templates:", error);
      res.status(500).json({ message: "Failed to fetch SVG templates" });
    }
  });
  
  app.get('/api/svg-templates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getSvgTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching SVG template:", error);
      res.status(500).json({ message: "Failed to fetch SVG template" });
    }
  });
  
  app.post('/api/svg-templates', isAuthenticated, async (req: any, res) => {
    try {
      const { name, description, frontSvg, backSvg } = req.body;
      
      if (!name || !frontSvg || !backSvg) {
        return res.status(400).json({ message: "Name, front SVG, and back SVG are required" });
      }
      
      const template = await storage.createSvgTemplate({
        name,
        description: description || null,
        frontSvg,
        backSvg,
        isActive: true
      });
      
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating SVG template:", error);
      res.status(500).json({ message: "Failed to create SVG template" });
    }
  });
  
  app.put('/api/svg-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, frontSvg, backSvg, isActive } = req.body;
      
      const template = await storage.updateSvgTemplate(id, {
        name,
        description,
        frontSvg,
        backSvg,
        isActive
      });
      
      res.json(template);
    } catch (error) {
      console.error("Error updating SVG template:", error);
      res.status(500).json({ message: "Failed to update SVG template" });
    }
  });
  
  app.delete('/api/svg-templates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSvgTemplate(id);
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error("Error deleting SVG template:", error);
      res.status(500).json({ message: "Failed to delete SVG template" });
    }
  });

  // Live card preview endpoint - renders templates with actual user data
  app.post('/api/card-preview/:id/:side', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const side = req.params.side as 'front' | 'back';
      const profileData = req.body;
      
      const template = await storage.getSvgTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Get the appropriate template content
      let svgContent = side === 'front' ? template.frontSvg : template.backSvg;
      
      // Replace placeholders with actual data
      svgContent = svgContent
        .replace(/\{\{fullName\}\}/g, profileData.fullName || '')
        .replace(/\{\{jobTitle\}\}/g, profileData.jobTitle || '')
        .replace(/\{\{email\}\}/g, profileData.email || '')
        .replace(/\{\{phoneNumber\}\}/g, profileData.phoneNumber || '')
        .replace(/\{\{address\}\}/g, profileData.address || '')
        .replace(/\{\{customPhotoUrl\}\}/g, profileData.customPhotoUrl || '')
        .replace(/\{\{logoUrl\}\}/g, profileData.logoUrl || '');

      // Handle QR code for back side
      if (side === 'back' && profileData.qrCodeUrl) {
        try {
          const qrCodePath = await generateQRCode(profileData.qrCodeUrl, {
            color: "#000000",
            margin: 2
          });
          
          const fs = await import('fs');
          const qrCodeBuffer = fs.readFileSync(qrCodePath);
          const qrCodeBase64 = qrCodeBuffer.toString('base64');
          const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;
          svgContent = svgContent.replace(/\{\{qrCode\}\}/g, qrCodeDataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
          svgContent = svgContent.replace(/\{\{qrCode\}\}/g, '');
        }
      } else {
        svgContent = svgContent.replace(/\{\{qrCode\}\}/g, '');
      }

      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      });
      
      res.send(svgContent);
      
    } catch (error) {
      console.error("Error generating live card preview:", error);
      res.status(500).json({ message: "Failed to generate card preview" });
    }
  });

  // Template thumbnail endpoint (PNG for selection interface)
  app.get('/api/template-thumbnail/:id/:side', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const side = req.params.side as 'front' | 'back';

      // First try the old PNG system for backwards compatibility
      const thumbnail = await templateService.getTemplateThumbnail(id, side);
      
      if (thumbnail) {
        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(thumbnail);
        return;
      }

      // For new SVG templates (IDs 19+), generate PNG from SVG data
      const svgTemplate = await storage.getSvgTemplate(id);
      if (svgTemplate) {
        const svgContent = side === 'front' ? svgTemplate.frontSvg : svgTemplate.backSvg;
        
        // Convert SVG to PNG using sharp
        const sharp = await import('sharp');
        const pngBuffer = await sharp.default(Buffer.from(svgContent))
          .png()
          .resize(400, 250) // Standard thumbnail size
          .toBuffer();

        res.set('Content-Type', 'image/png');
        res.set('Cache-Control', 'public, max-age=3600');
        res.send(pngBuffer);
        return;
      }
      
      return res.status(404).json({ message: 'Template thumbnail not found' });
    } catch (error) {
      console.error('Error serving template thumbnail:', error);
      res.status(500).json({ message: 'Failed to load template thumbnail' });
    }
  });

  // Direct SVG template file endpoint (enables client-side loading as suggested by user)
  app.get('/api/template-svg/:id/:side', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const side = req.params.side as 'front' | 'back';

      // Template ID to folder mapping
      const templateMapping: Record<number, string> = {
        15: 'minimal',
        16: 'classic',
        17: 'simple', 
        18: 'modern'
      };

      const templateFolder = templateMapping[id];
      if (!templateFolder) {
        return res.status(404).json({ message: 'Template not found' });
      }

      const fs = await import('fs');
      const path = await import('path');
      const svgPath = path.join(process.cwd(), 'public', 'templates', 'svg', templateFolder, `${side}.svg`);

      if (!fs.existsSync(svgPath)) {
        return res.status(404).json({ message: 'SVG template file not found' });
      }

      const svgContent = fs.readFileSync(svgPath, 'utf-8');

      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600'
      });
      res.send(svgContent);
    } catch (error) {
      console.error('Error serving SVG template:', error);
      res.status(500).json({ message: 'Failed to load SVG template' });
    }
  });

  // Template preview endpoint (SVG for card builder system)
  app.get('/api/template-preview/:id/:side', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const side = req.params.side as 'front' | 'back';

      console.log(`Template preview GET request: id=${id}, side=${side}`);

      // Use the same SVG generation method as the customization endpoint
      // but with placeholder data for preview
      const placeholderData = {
        fullName: 'Your Name',
        jobTitle: 'Your Title',
        email: 'email@example.com',
        phoneNumber: '(555) 123-4567',
        address: 'Your Address',
        company: 'Your Company',
        website: 'www.example.com'
      };

      const svgPreview = await templateService.generateCustomizedSVG(id, side, placeholderData);
      
      if (!svgPreview) {
        console.log('SVG preview generation failed, returning 404');
        return res.status(404).json({ message: 'Template preview not found' });
      }

      console.log(`Generated SVG preview: ${svgPreview.substring(0, 100)}...`);

      res.set('Content-Type', 'image/svg+xml');
      res.set('Cache-Control', 'public, max-age=3600');
      res.send(svgPreview);
    } catch (error) {
      console.error('Error serving template preview:', error);
      res.status(500).json({ message: 'Failed to load template preview' });
    }
  });

  // Legacy template preview endpoint
  app.get('/api/template-preview-legacy/:id/:side', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const side = req.params.side as 'front' | 'back';
      
      const template = await storage.getSvgTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Get the appropriate template content (now stored as PNG data URLs)
      const templateContent = side === 'front' ? template.frontSvg : template.backSvg;
      
      // Check if it's a PNG data URL
      if (templateContent.startsWith('data:image/png;base64,')) {
        // Extract base64 data and send as PNG
        const base64Data = templateContent.replace('data:image/png;base64,', '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        res.set({
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
          'Content-Length': imageBuffer.length.toString()
        });
        
        res.send(imageBuffer);
        
      } else if (templateContent.startsWith('<svg')) {
        // Fallback for SVG content (from old templates)
        const sampleData = {
          fullName: 'John Smith',
          jobTitle: 'CEO & Founder',
          email: 'john@company.com',
          phoneNumber: '(555) 123-4567',
          address: 'New York, NY'
        };

        let svgContent = templateContent
          .replace(/\{\{fullName\}\}/g, sampleData.fullName)
          .replace(/\{\{jobTitle\}\}/g, sampleData.jobTitle)
          .replace(/\{\{email\}\}/g, sampleData.email)
          .replace(/\{\{phoneNumber\}\}/g, sampleData.phoneNumber)
          .replace(/\{\{address\}\}/g, sampleData.address);

        if (side === 'back') {
          const sampleQrUrl = 'https://metalcardsnyc.com/sample';
          const qrCodePath = await generateQRCode(sampleQrUrl, {
            color: "#000000",
            margin: 2
          });
          
          try {
            const fs = await import('fs');
            const qrCodeBuffer = fs.readFileSync(qrCodePath);
            const qrCodeBase64 = qrCodeBuffer.toString('base64');
            const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;
            svgContent = svgContent.replace(/\{\{qrCode\}\}/g, qrCodeDataUrl);
          } catch (error) {
            console.error('Error reading QR code:', error);
            svgContent = svgContent.replace(/\{\{qrCode\}\}/g, '');
          }
        }

        res.set({
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600'
        });
        
        res.send(svgContent);
        
      } else {
        return res.status(400).json({ message: "Invalid template format" });
      }
      
    } catch (error) {
      console.error("Error generating template preview:", error);
      res.status(500).json({ message: "Failed to generate template preview" });
    }
  });

  // QR Code generation endpoint
  app.get('/api/qrcode', async (req, res) => {
    try {
      const { data, size = 200, color = '#000000', backgroundColor = '#ffffff' } = req.query;
      
      if (!data) {
        return res.status(400).json({ message: 'Data parameter is required' });
      }
      
      // Generate QR code as buffer
      const qrCodeBuffer = await generateQRCodeBuffer(data as string, {
        color: color as string,
        backgroundColor: backgroundColor as string,
        width: parseInt(size as string)
      });
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Length', qrCodeBuffer.length);
      res.send(qrCodeBuffer);
    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({ message: 'Failed to generate QR code' });
    }
  });

  // VCard generation endpoint (POST for custom data)
  app.post('/api/vcard/generate', async (req, res) => {
    try {
      const { profileData, links, profileUrl } = req.body;
      
      if (!profileData) {
        return res.status(400).json({ message: 'Profile data is required' });
      }
      
      // Generate VCard content
      let vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${profileData.fullName || 'Unknown'}`;

      if (profileData.jobTitle) {
        vCardContent += `\nTITLE:${profileData.jobTitle}`;
      }

      if (profileData.email) {
        vCardContent += `\nEMAIL:${profileData.email}`;
      }

      if (profileData.phoneNumber) {
        vCardContent += `\nTEL:${profileData.phoneNumber}`;
      }

      if (profileData.address) {
        vCardContent += `\nADR:;;${profileData.address};;;`;
      }

      const websiteLink = links?.find(link => link.linkType === 'website');
      if (websiteLink?.url) {
        vCardContent += `\nURL:${websiteLink.url}`;
      } else if (profileUrl) {
        vCardContent += `\nURL:${profileUrl}`;
      }

      if (profileData.customPhotoUrl) {
        vCardContent += `\nPHOTO:${profileData.customPhotoUrl}`;
      }

      if (profileData.logoUrl) {
        vCardContent += `\nLOGO:${profileData.logoUrl}`;
      }

      // Add QR code attachment
      if (profileUrl) {
        const qrCodeUrl = `${req.protocol}://${req.get('host')}/api/qrcode?data=${encodeURIComponent(profileUrl)}&size=200`;
        vCardContent += `\nATTACH:${qrCodeUrl}`;
      }

      // Add custom fields
      if (profileUrl) {
        vCardContent += `\nX-DIGITAL-PROFILE:${profileUrl}`;
      }
      vCardContent += `\nNOTE:Digital business card powered by Metal Cards NYC`;

      vCardContent += `\nEND:VCARD`;
      
      res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="${(profileData.fullName || 'contact').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.vcf"`);
      return res.send(vCardContent);
    } catch (error) {
      console.error('Error generating VCard:', error);
      return res.status(500).json({ message: 'Failed to generate VCard' });
    }
  });

  // VCard generation endpoint (GET for profile ID)
  app.get('/api/vcard/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;
      
      // Get profile data
      const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, parseInt(profileId)));
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      // Get user links
      const links = await storage.getUserLinks(profile.id);
      
      // Generate VCard content
      const websiteLink = links.find(link => link.linkType === 'website');
      const profileUrl = `${req.protocol}://${req.get('host')}/p/${profile.id}`;
      
      let vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${profile.fullName}`;

      if (profile.jobTitle) {
        vCardContent += `\nTITLE:${profile.jobTitle}`;
      }

      if (profile.email) {
        vCardContent += `\nEMAIL:${profile.email}`;
      }

      if (profile.phoneNumber) {
        vCardContent += `\nTEL:${profile.phoneNumber}`;
      }

      if (profile.address) {
        vCardContent += `\nADR:;;${profile.address};;;`;
      }

      if (websiteLink?.url) {
        vCardContent += `\nURL:${websiteLink.url}`;
      } else {
        vCardContent += `\nURL:${profileUrl}`;
      }

      if (profile.customPhotoUrl) {
        vCardContent += `\nPHOTO:${profile.customPhotoUrl}`;
      }

      if (profile.logoUrl) {
        vCardContent += `\nLOGO:${profile.logoUrl}`;
      }

      // Add QR code attachment
      const qrCodeUrl = `${req.protocol}://${req.get('host')}/api/qrcode?data=${encodeURIComponent(profileUrl)}&size=200`;
      vCardContent += `\nATTACH:${qrCodeUrl}`;

      // Add custom fields
      vCardContent += `\nX-DIGITAL-PROFILE:${profileUrl}`;
      vCardContent += `\nNOTE:Digital business card powered by Metal Cards NYC`;

      vCardContent += `\nEND:VCARD`;
      
      res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="${profile.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.vcf"`);
      return res.send(vCardContent);
    } catch (error) {
      console.error('Error generating VCard:', error);
      return res.status(500).json({ message: 'Failed to generate VCard' });
    }
  });

  // Orders API endpoint
  app.post('/api/orders/submit', async (req, res) => {
    try {
      const orderData = req.body;
      
      // Store order in database
      const order = await db.insert(orders).values({
        customerName: orderData.customerName,
        email: orderData.email,
        phone: orderData.phone,
        companyName: orderData.companyName,
        position: orderData.position,
        quantity: parseInt(orderData.quantity),
        cardType: orderData.cardType,
        cardStyle: orderData.cardStyle,
        deliveryOption: orderData.deliveryOption,
        specialRequests: orderData.specialRequests,
        status: 'pending'
      }).returning();
      
      res.status(201).json({ 
        success: true, 
        message: "Order submitted successfully",
        orderId: order[0].id 
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      res.status(500).json({ message: "Failed to submit order" });
    }
  });

  // Reviews API endpoints  
  app.get('/api/reviews', async (req, res) => {
    try {
      const reviewsList = await db.select().from(reviews).where(eq(reviews.verified, true));
      res.json(reviewsList);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const reviewData = req.body;
      
      const review = await db.insert(reviews).values({
        customerName: reviewData.customerName,
        email: reviewData.email,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        orderNumber: reviewData.orderNumber,
        verified: false // Reviews need verification before showing
      }).returning();
      
      res.status(201).json({ 
        success: true, 
        message: "Review submitted successfully",
        reviewId: review[0].id 
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ message: "Failed to submit review" });
    }
  });

  // Admin card generation endpoint (for downloading order cards)
  app.post("/api/admin/generate-card", isAuthenticated, async (req: any, res) => {
    try {
      const { customerData, templateId, cardType = 'standard', format = 'jpeg' } = req.body;
      
      if (!customerData || !customerData.fullName) {
        return res.status(400).json({ message: "Customer data with fullName is required" });
      }
      
      // Get template from cardTemplates
      const { cardTemplates } = await import("../client/src/lib/card-templates");
      const template = cardTemplates.find(t => t.id === templateId) || cardTemplates[0];
      
      // Generate QR code for customer profile
      const profileUrl = `${req.protocol}://${req.get('host')}/customer-profile/${encodeURIComponent(customerData.fullName)}`;
      const qrCodePath = await generateQRCode(profileUrl, {
        color: "#000000",
        margin: 2
      });
      
      // Generate business card front side
      const cardBuffer = await cardRenderer.renderCardFront(
        {
          fullName: customerData.fullName,
          jobTitle: customerData.jobTitle || '',
          email: customerData.email || '',
          phoneNumber: customerData.phoneNumber || '',
          address: customerData.address || '',
          customPhotoUrl: customerData.customPhotoUrl || null,
          logoUrl: customerData.logoUrl || null,
        },
        template,
        'jpeg'
      );
      
      res.set({
        'Content-Type': 'image/jpeg',
        'Content-Length': cardBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="business-card-${customerData.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg"`
      });
      
      res.send(cardBuffer);
      
    } catch (error) {
      console.error("Error generating admin card:", error);
      res.status(500).json({ message: "Failed to generate business card" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      const totalOrders = allOrders.length;
      const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
      const completedOrders = allOrders.filter(order => order.status === 'completed').length;
      
      // Calculate revenue based on card types and quantities
      const revenueCalculation = allOrders.reduce((sum, order) => {
        const cardPrices = {
          'standard': 4.00,
          'premium': 5.00,
          'black-anodized': 7.00,
          'luxury-titanium': 9.00
        };
        const basePrice = cardPrices[order.cardType] || 4.00;
        return sum + (basePrice * order.quantity);
      }, 0);
      
      // Get card type popularity
      const cardTypes = {};
      allOrders.forEach(order => {
        const cardType = order.cardType || 'standard';
        cardTypes[cardType] = (cardTypes[cardType] || 0) + 1;
      });

      const stats = {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: revenueCalculation,
        cardTypePopularity: cardTypes,
        recentOrders: allOrders.slice(-10).reverse()
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Get testing summary
  app.get("/api/admin/testing-summary", async (req, res) => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const testingFiles = [
        'TESTING_SUMMARY_REPORT.md',
        'comprehensive-test-report.json',
        'link-crawl-report.json',
        'admin-dashboard-data.json',
        'feature-test-report.json'
      ];
      
      const testingSummary = {};
      
      for (const filename of testingFiles) {
        try {
          const filePath = path.default.join(process.cwd(), filename);
          if (fs.default.existsSync(filePath)) {
            const content = fs.default.readFileSync(filePath, 'utf8');
            testingSummary[filename] = filename.endsWith('.json') ? JSON.parse(content) : content;
          }
        } catch (error) {
          console.error(`Error reading ${filename}:`, error);
        }
      }
      
      res.json(testingSummary);
    } catch (error) {
      console.error("Error fetching testing summary:", error);
      res.status(500).json({ message: "Failed to fetch testing summary" });
    }
  });

  // Business card review endpoints for admin
  app.get("/api/admin/business-cards/pending", async (req, res) => {
    try {
      const pendingCards = await storage.getPendingBusinessCards();
      
      // Get profile information for each card
      const cardsWithProfiles = await Promise.all(
        pendingCards.map(async (card) => {
          const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, card.profileId));
          return {
            ...card,
            profile: profile || null
          };
        })
      );
      
      res.json(cardsWithProfiles);
    } catch (error) {
      console.error("Error fetching pending business cards:", error);
      res.status(500).json({ message: "Failed to fetch pending business cards" });
    }
  });

  // Public card submission endpoint (no authentication required)
  app.post('/api/cards/submit-for-review', async (req, res) => {
    try {
      const { templateId, cardType, customerProfile, submittedAt } = req.body;
      
      // Validate required fields
      if (!customerProfile.fullName || !customerProfile.email || !customerProfile.phoneNumber) {
        return res.status(400).json({ 
          message: "Missing required fields: fullName, email, and phoneNumber are required" 
        });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerProfile.email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      // Generate unique order ID
      const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create a temporary profile for the customer (not in local_users table)
      const profileData = {
        fullName: customerProfile.fullName,
        jobTitle: customerProfile.jobTitle || '',
        phoneNumber: customerProfile.phoneNumber,
        address: customerProfile.address || '',
        customPhotoUrl: customerProfile.customPhotoUrl || null,
        logoUrl: customerProfile.logoUrl || null,
        profileTemplate: 'classic',
        userId: null, // No Replit user
        localUserId: null, // No local user - this is a public submission
        email: customerProfile.email, // Store email in profile for this workflow
        companyName: customerProfile.companyName || '', // Store company name
        website: customerProfile.website || '',
        linkedinUrl: customerProfile.linkedinUrl || ''
      };
      
      // Create profile in database
      const newProfile = await storage.createUserProfile(profileData);
      
      // Generate QR code that links to the public profile
      const host = req.get('host') || 'metalcardsnyc.com';
      const protocol = req.protocol;
      const profileUrl = `${protocol}://${host}/p/${newProfile.id}`;
      const qrCodePath = await generateQRCode(profileUrl, {
        color: "#000000",
        margin: 2
      });
      
      // Generate card preview images
      let frontImageUrl = '';
      let backImageUrl = '';
      
      try {
        const { cardTemplates } = await import("../client/src/lib/card-templates");
        const template = cardTemplates.find(t => t.id === templateId);
        
        if (template) {
          const result = await cardRenderer.renderDoubleSidedCard(
            {
              fullName: customerProfile.fullName,
              jobTitle: customerProfile.jobTitle || '',
              email: customerProfile.email,
              phoneNumber: customerProfile.phoneNumber,
              address: customerProfile.address || '',
              customPhotoUrl: customerProfile.customPhotoUrl || undefined,
              logoUrl: customerProfile.logoUrl || undefined,
            },
            template,
            qrCodePath,
            'jpeg'
          );
          
          // Save generated images
          const fs = await import('fs');
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const timestamp = Date.now();
          const frontFileName = `card-${orderId}-front-${timestamp}.jpg`;
          const backFileName = `card-${orderId}-back-${timestamp}.jpg`;
          const frontPath = path.join(uploadsDir, frontFileName);
          const backPath = path.join(uploadsDir, backFileName);
          
          fs.writeFileSync(frontPath, result.front);
          fs.writeFileSync(backPath, result.back);
          
          frontImageUrl = `/uploads/${frontFileName}`;
          backImageUrl = `/uploads/${backFileName}`;
        }
      } catch (error) {
        console.error('Error generating card preview images:', error);
        // Continue without preview images
      }
      
      // Create business card entry for admin review
      const cardData = {
        profileId: newProfile.id,
        templateId,
        customizations: {
          cardType,
          customerProfile,
          orderId
        },
        frontImageUrl,
        backImageUrl,
        status: 'pending', // Set to pending for admin review
        adminNotes: null
      };
      
      const businessCard = await storage.createBusinessCard(cardData);
      
      res.status(201).json({
        success: true,
        orderId,
        profileId: newProfile.id,
        profileUrl,
        cardId: businessCard.id,
        message: "Your business card has been submitted for review. You'll receive updates via email."
      });
      
    } catch (error) {
      console.error("Error submitting card for review:", error);
      res.status(500).json({ message: "Failed to submit card for review" });
    }
  });

  app.put("/api/admin/business-cards/:cardId/review", async (req, res) => {
    try {
      const cardId = parseInt(req.params.cardId);
      const { status, reviewNotes } = req.body;
      
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }
      
      const updatedCard = await storage.updateBusinessCard(cardId, {
        status,
        reviewNotes: reviewNotes || null
      });
      
      res.json(updatedCard);
    } catch (error) {
      console.error("Error updating business card review:", error);
      res.status(500).json({ message: "Failed to update business card review" });
    }
  });

  // Generate business card preview for completed orders
  app.post("/api/admin/generate-card-preview/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const { cardTemplates } = await import("../client/src/lib/card-templates");
      const template = cardTemplates.find(t => t.name.toLowerCase().includes('modern')) || cardTemplates[0];
      
      const profileData = {
        fullName: order.customerName,
        jobTitle: order.position,
        email: order.email,
        phoneNumber: order.phone,
        companyName: order.companyName,
        address: order.address || 'New York, NY'
      };
      
      const host = req.get('host');
      const protocol = req.protocol;
      const profileUrl = `${protocol}://${host}/p/order-${order.id}`;
      const qrCodePath = await generateQRCode(profileUrl, {
        color: "#000000",
        margin: 2
      });
      
      const cardBuffer = await cardRenderer.renderCardFront(
        profileData,
        {
          ...template,
          backgroundColor: order.cardType === 'black-anodized' ? '#1a1a1a' : template.backgroundColor,
          textColor: order.cardType === 'black-anodized' ? '#ffffff' : template.textColor
        },
        'jpeg'
      );
      
      res.set('Content-Type', 'image/jpeg');
      res.send(cardBuffer);
    } catch (error) {
      console.error("Error generating card preview:", error);
      res.status(500).json({ message: "Failed to generate card preview" });
    }
  });

  // Orders API endpoint - fetch all orders
  app.get("/api/orders", async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Profiles API endpoint - fetch all profiles
  app.get("/api/profiles", async (req, res) => {
    try {
      const allProfiles = await db.select().from(userProfiles);
      res.json(allProfiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      res.status(500).json({ message: "Failed to fetch profiles" });
    }
  });

  // Update order status
  app.patch("/api/admin/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Local Authentication Routes
  app.post('/api/local/register', async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      const user = await registerLocalUser(validatedData);
      
      // Set session
      req.session.localUserId = user.id;
      req.session.userType = 'local';
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/local/login', async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      const user = await loginLocalUser(validatedData.email, validatedData.password);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Set session
      req.session.localUserId = user.id;
      req.session.userType = 'local';
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post('/api/local/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/local/user', async (req, res) => {
    try {
      const localUserId = req.session.localUserId;
      if (!localUserId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getLocalUser(localUserId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // AI Design Assistant Routes
  app.post('/api/ai/design-suggestions', async (req, res) => {
    try {
      const { companyName, industry, role, targetAudience, brandPersonality, existingColors } = req.body;
      
      if (!companyName || !industry || !role) {
        return res.status(400).json({ 
          message: 'Company name, industry, and role are required' 
        });
      }

      try {
        const suggestions = await generateDesignSuggestions({
          companyName,
          industry,
          role,
          targetAudience: targetAudience || 'General business audience',
          brandPersonality: brandPersonality || 'Professional',
          existingColors
        });
        
        res.json(suggestions);
      } catch (aiError) {
        console.error('AI Design Assistant unavailable, providing fallback suggestions:', aiError.message);
        
        // Provide curated design suggestions when AI is unavailable
        const fallbackSuggestions = {
          colorPalette: ["#1a5f3f", "#d4af37", "#000000", "#f8f8f8", "#2c3e50"],
          fontRecommendations: ["Helvetica Neue", "Arial", "Times New Roman"],
          layoutSuggestions: [
            "Keep contact information prominently displayed on the front",
            "Use QR code strategically on the back for digital integration", 
            "Maintain clean white space for professional appearance"
          ],
          industryTips: [
            `For ${industry}: Focus on professional colors and clean typography`,
            "Consider industry-standard design practices for credibility",
            "Ensure all text is easily readable at business card size"
          ],
          brandingAdvice: `As a ${role} in ${industry}, your business card should reflect professionalism and trustworthiness. Use consistent colors and fonts that align with your brand identity.`
        };
        
        res.json({
          ...fallbackSuggestions,
          note: "AI suggestions temporarily unavailable - showing curated design recommendations"
        });
      }
    } catch (error) {
      console.error('Error in design suggestions endpoint:', error);
      res.status(500).json({ 
        message: 'Failed to generate design suggestions' 
      });
    }
  });

  app.post('/api/ai/design-feedback', async (req, res) => {
    try {
      const { currentDesign, userQuestion } = req.body;
      
      if (!currentDesign || !userQuestion) {
        return res.status(400).json({ 
          message: 'Current design and user question are required' 
        });
      }

      const feedback = await analyzeDesignFeedback(currentDesign, userQuestion);
      
      res.json({ feedback });
    } catch (error) {
      console.error('Error analyzing design feedback:', error);
      res.status(500).json({ 
        message: 'Failed to analyze design feedback' 
      });
    }
  });

  app.post('/api/ai/color-palette', async (req, res) => {
    try {
      const { baseColor, mood, industry } = req.body;
      
      if (!baseColor || !mood || !industry) {
        return res.status(400).json({ 
          message: 'Base color, mood, and industry are required' 
        });
      }

      const colors = await generateColorPalette(baseColor, mood, industry);
      
      res.json({ colors });
    } catch (error) {
      console.error('Error generating color palette:', error);
      res.status(500).json({ 
        message: 'Failed to generate color palette' 
      });
    }
  });

  // Photoroom API routes
  const multerUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });

  app.post('/api/photoroom/remove-background', multerUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const result = await removeBackground(req.file.buffer, req.file.originalname);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({ 
        success: true,
        processedImageUrl: result.processedImageUrl 
      });
    } catch (error) {
      console.error('Error processing image with Photoroom:', error);
      res.status(500).json({ 
        message: 'Failed to process image' 
      });
    }
  });

  // Alternative endpoint for custom card designer
  app.post('/api/photoroom/process', multerUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const result = await removeBackground(req.file.buffer, req.file.originalname);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({ 
        success: true,
        processedImageUrl: result.processedImageUrl 
      });
    } catch (error) {
      console.error('Error processing image with Photoroom:', error);
      res.status(500).json({ 
        message: 'Failed to process image' 
      });
    }
  });

  // Custom design endpoints
  app.post('/api/custom-designs/save', isAuthenticated, async (req, res) => {
    try {
      const designData = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Save custom design to database
      const designId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store design data in user's profile or a custom designs table
      // For now, we'll simulate saving and return success
      const designRecord = {
        id: designId,
        userId,
        designData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      res.json({ 
        success: true, 
        designId,
        message: 'Custom design saved successfully' 
      });
    } catch (error) {
      console.error('Error saving custom design:', error);
      res.status(500).json({ message: 'Failed to save custom design' });
    }
  });

  app.post('/api/custom-designs/preview', isAuthenticated, async (req, res) => {
    try {
      const designData = req.body;
      
      // Generate a simple preview URL (you can enhance this with actual canvas rendering)
      const previewId = `preview_${Date.now()}`;
      const previewUrl = `/api/custom-designs/preview-image/${previewId}`;
      
      res.json({ 
        success: true, 
        previewUrl,
        message: 'Preview generated successfully' 
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      res.status(500).json({ message: 'Failed to generate preview' });
    }
  });

  app.get('/api/custom-designs/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user?.id;
      
      // Check if user can access these designs
      if (requestingUserId !== parseInt(userId)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Return mock designs for now (implement proper database storage later)
      const designs = [];
      res.json(designs);
    } catch (error) {
      console.error('Error fetching custom designs:', error);
      res.status(500).json({ message: 'Failed to fetch designs' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
