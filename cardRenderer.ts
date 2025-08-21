// Note: Canvas import removed as we'll use SVG rendering instead
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { CardTemplate } from '../client/src/lib/card-templates';
import { storage } from './storage';
import { SvgTemplate } from '@shared/schema';

export interface ProfileData {
  fullName?: string;
  jobTitle?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  customPhotoUrl?: string;
  logoUrl?: string;
}

export class CardRenderer {
  private cardWidth = 1050;
  private cardHeight = 600;
  private margin = 50;

  constructor() {
    // Register fonts for canvas rendering
    try {
      // You can add custom fonts here if needed
    } catch (error) {
      console.warn('Font registration failed, using default fonts');
    }
  }

  private replaceTemplatePlaceholders(svgTemplate: string, profileData: ProfileData): string {
    return svgTemplate
      .replace(/\{\{fullName\}\}/g, profileData.fullName || '')
      .replace(/\{\{jobTitle\}\}/g, profileData.jobTitle || '')
      .replace(/\{\{email\}\}/g, profileData.email || '')
      .replace(/\{\{phoneNumber\}\}/g, profileData.phoneNumber || '')
      .replace(/\{\{address\}\}/g, profileData.address || '')
      .replace(/\{\{customPhotoUrl\}\}/g, profileData.customPhotoUrl || '')
      .replace(/\{\{logoUrl\}\}/g, profileData.logoUrl || '');
  }

  private replaceQRCodePlaceholder(svgTemplate: string, qrCodePath?: string): string {
    if (!qrCodePath) {
      return svgTemplate.replace(/\{\{qrCode\}\}/g, '');
    }
    
    // Read QR code as base64
    try {
      const qrCodeBuffer = fs.readFileSync(qrCodePath);
      const qrCodeBase64 = qrCodeBuffer.toString('base64');
      const qrCodeDataUrl = `data:image/png;base64,${qrCodeBase64}`;
      return svgTemplate.replace(/\{\{qrCode\}\}/g, qrCodeDataUrl);
    } catch (error) {
      console.error('Error reading QR code:', error);
      return svgTemplate.replace(/\{\{qrCode\}\}/g, '');
    }
  }

  async renderCardFront(profileData: ProfileData, template: CardTemplate, format: 'svg' | 'jpeg' = 'svg'): Promise<Buffer> {
    try {
      // Import templateService for integration
      const { templateService } = await import('./templateService');
      
      // Get SVG template using templateService (integrates file system and database)
      const templateData = await templateService.getTemplate(template.id);
      if (!templateData || !templateData.frontSvg) {
        throw new Error(`Template ${template.id} not found or missing front SVG`);
      }

      // Replace placeholders with actual data
      const processedSVG = this.replaceTemplatePlaceholders(templateData.frontSvg, profileData);

      if (format === 'svg') {
        return Buffer.from(processedSVG, 'utf8');
      } else {
        // Convert SVG to JPEG using sharp
        const jpegBuffer = await sharp(Buffer.from(processedSVG))
          .jpeg({ quality: 95 })
          .toBuffer();
        return jpegBuffer;
      }
    } catch (error) {
      console.error('Error rendering card front:', error);
      // Return a fallback SVG for demo purposes
      const fallbackSVG = this.generateFallbackSVG(profileData, 'front');
      if (format === 'svg') {
        return Buffer.from(fallbackSVG, 'utf8');
      } else {
        const jpegBuffer = await sharp(Buffer.from(fallbackSVG))
          .jpeg({ quality: 95 })
          .toBuffer();
        return jpegBuffer;
      }
    }
  }

  async renderCardBack(profileData: ProfileData, template: CardTemplate, qrCodePath?: string, format: 'svg' | 'jpeg' = 'svg'): Promise<Buffer> {
    try {
      // Import templateService for integration
      const { templateService } = await import('./templateService');
      
      // Get SVG template using templateService (integrates file system and database)
      const templateData = await templateService.getTemplate(template.id);
      if (!templateData || !templateData.backSvg) {
        throw new Error(`Template ${template.id} not found or missing back SVG`);
      }

      // Replace placeholders with actual data
      let processedSVG = this.replaceTemplatePlaceholders(templateData.backSvg, profileData);
      processedSVG = this.replaceQRCodePlaceholder(processedSVG, qrCodePath);

      if (format === 'svg') {
        return Buffer.from(processedSVG, 'utf8');
      } else {
        // Convert SVG to JPEG using sharp
        const jpegBuffer = await sharp(Buffer.from(processedSVG))
          .jpeg({ quality: 95 })
          .toBuffer();
        return jpegBuffer;
      }
    } catch (error) {
      console.error('Error rendering card back:', error);
      // Return a fallback SVG for demo purposes
      const fallbackSVG = this.generateFallbackSVG(profileData, 'back');
      if (format === 'svg') {
        return Buffer.from(fallbackSVG, 'utf8');
      } else {
        const jpegBuffer = await sharp(Buffer.from(fallbackSVG))
          .jpeg({ quality: 95 })
          .toBuffer();
        return jpegBuffer;
      }
    }
  }

  async renderDoubleSidedCard(profileData: ProfileData, template: CardTemplate, qrCodePath?: string, format: 'svg' | 'jpeg' = 'svg'): Promise<{front: Buffer, back: Buffer}> {
    try {
      const [front, back] = await Promise.all([
        this.renderCardFront(profileData, template, format),
        this.renderCardBack(profileData, template, qrCodePath, format)
      ]);

      return { front, back };
    } catch (error) {
      console.error('Error rendering double-sided card:', error);
      // Fallback: generate both sides using fallback SVGs
      const frontSVG = this.generateFallbackSVG(profileData, 'front');
      const backSVG = this.generateFallbackSVG(profileData, 'back');
      
      if (format === 'svg') {
        return {
          front: Buffer.from(frontSVG, 'utf8'),
          back: Buffer.from(backSVG, 'utf8')
        };
      } else {
        const [frontJpeg, backJpeg] = await Promise.all([
          sharp(Buffer.from(frontSVG)).jpeg({ quality: 95 }).toBuffer(),
          sharp(Buffer.from(backSVG)).jpeg({ quality: 95 }).toBuffer()
        ]);
        return { front: frontJpeg, back: backJpeg };
      }
    }
  }

  // Fallback method for when no templates exist in database
  private generateFallbackSVG(profileData: ProfileData, side: 'front' | 'back', qrCodePath?: string): string {
    const backgroundColor = '#000000';
    const textColor = '#ffffff';
    const centerX = this.cardWidth / 2;
    
    if (side === 'front') {
      return `
        <svg width="${this.cardWidth}" height="${this.cardHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${backgroundColor}"/>
          <text x="${centerX}" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${textColor}">
            ${profileData.fullName || 'Name'}
          </text>
          <text x="${centerX}" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#cccccc">
            ${profileData.jobTitle || 'Title'}
          </text>
          <text x="${centerX}" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="${textColor}">
            ${profileData.email || 'Email'}
          </text>
          <text x="${centerX}" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="${textColor}">
            ${profileData.phoneNumber || 'Phone'}
          </text>
          <text x="${centerX}" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#10B981">
            No template uploaded - Upload SVG templates to customize
          </text>
        </svg>
      `;
    } else {
      return `
        <svg width="${this.cardWidth}" height="${this.cardHeight}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${backgroundColor}"/>
          <text x="${centerX}" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="${textColor}">
            Scan to view my digital profile
          </text>
          <rect x="${centerX - 140}" y="200" width="280" height="280" fill="#ffffff" stroke="${textColor}" stroke-width="2" rx="10"/>
          <text x="${centerX}" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#000000">
            QR CODE
          </text>
          <text x="${centerX}" y="520" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#10B981">
            No template uploaded - Upload SVG templates to customize
          </text>
        </svg>
      `;
    }
  }

  // Method to handle rendering when no templates exist in database
  async renderFallbackCard(profileData: ProfileData, side: 'front' | 'back', qrCodePath?: string, format: 'svg' | 'jpeg' = 'svg'): Promise<Buffer> {
    try {
      const fallbackSVG = this.generateFallbackSVG(profileData, side, qrCodePath);

      if (format === 'svg') {
        return Buffer.from(fallbackSVG, 'utf8');
      } else {
        const jpegBuffer = await sharp(Buffer.from(fallbackSVG))
          .jpeg({ quality: 95 })
          .toBuffer();
        return jpegBuffer;
      }
    } catch (error) {
      console.error('Error rendering fallback card:', error);
      throw error;
    }
  }
}

export const cardRenderer = new CardRenderer();