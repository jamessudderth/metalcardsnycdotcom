import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db';
import { svgTemplates } from '@shared/schema';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template mapping for backwards compatibility
const templateMappings = {
  15: { name: 'minimal', displayName: 'Minimal Metal Card' },
  16: { name: 'classic', displayName: 'Classic Professional' },
  17: { name: 'simple', displayName: 'Simple Modern' },
  18: { name: 'modern', displayName: 'Modern Executive' }
};

export interface Template {
  id: number;
  name: string;
  displayName: string;
  frontSvg?: string;
  backSvg?: string;
}

export class TemplateService {
  // Get a specific template by ID
  async getTemplate(templateId: number): Promise<Template | null> {
    try {
      // First try to get from database
      const dbTemplate = await db.select().from(svgTemplates).where(eq(svgTemplates.id, templateId)).limit(1);
      
      if (dbTemplate.length > 0) {
        const template = dbTemplate[0];
        return {
          id: template.id,
          name: template.name,
          displayName: template.displayName || template.name,
          frontSvg: template.frontSvg,
          backSvg: template.backSvg
        };
      }

      // Fallback to file system mapping - load SVG files directly
      const mapping = templateMappings[templateId as keyof typeof templateMappings];
      if (mapping) {
        const frontSvgPath = path.join(process.cwd(), 'public/templates/svg', mapping.name, 'front.svg');
        const backSvgPath = path.join(process.cwd(), 'public/templates/svg', mapping.name, 'back.svg');
        
        let frontSvg = null;
        let backSvg = null;
        
        if (fs.existsSync(frontSvgPath)) {
          frontSvg = fs.readFileSync(frontSvgPath, 'utf-8');
        }
        
        if (fs.existsSync(backSvgPath)) {
          backSvg = fs.readFileSync(backSvgPath, 'utf-8');
        }
        
        return {
          id: templateId,
          name: mapping.name,
          displayName: mapping.displayName,
          frontSvg,
          backSvg
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  // Get all available templates
  async getAllTemplates(): Promise<Template[]> {
    try {
      const dbTemplates = await db.select().from(svgTemplates);
      
      if (dbTemplates.length > 0) {
        return dbTemplates.map(t => ({
          id: t.id,
          name: t.name,
          displayName: t.displayName || t.name,
          frontSvg: t.frontSvg,
          backSvg: t.backSvg
        }));
      }

      // Fallback to hardcoded templates
      return Object.entries(templateMappings).map(([id, mapping]) => ({
        id: parseInt(id),
        name: mapping.name,
        displayName: mapping.displayName
      }));
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  // Get template thumbnail (PNG for previews)
  async getTemplateThumbnail(templateId: number, side: 'front' | 'back'): Promise<Buffer | null> {
    try {
      // Direct mapping to PNG files without database lookup for faster loading
      const templateFolderMap: Record<number, string> = {
        15: 'minimal',
        16: 'classic', 
        17: 'simple',
        18: 'modern'
      };
      
      const folderName = templateFolderMap[templateId];
      if (!folderName) {
        console.log(`No folder mapping found for template ID ${templateId}`);
        return null;
      }

      const pngTemplatePath = path.join(
        process.cwd(),
        'public/templates/clean', 
        folderName, 
        `${side}.png`
      );

      console.log(`Looking for PNG thumbnail at: ${pngTemplatePath}`);
      console.log(`File exists: ${fs.existsSync(pngTemplatePath)}`);

      if (fs.existsSync(pngTemplatePath)) {
        const buffer = fs.readFileSync(pngTemplatePath);
        console.log(`Successfully read PNG file, size: ${buffer.length} bytes`);
        return buffer;
      }

      return null;
    } catch (error) {
      console.error('Error getting template thumbnail:', error);
      return null;
    }
  }

  // Get template preview (SVG for card builder)
  async generateCustomizedSVG(templateId: number, side: 'front' | 'back', customerData: any): Promise<string | null> {
    try {
      console.log(`Generating customized SVG for template ${templateId}, side ${side}`);
      
      // Always generate proper SVG content with customer data
      // Since database templates are PNG data URLs, we'll create SVG templates based on template ID
      const svgContent = this.createSVGTemplateByID(templateId, side, customerData);
      
      console.log(`Generated SVG content type: ${typeof svgContent}`);
      console.log(`Generated SVG content length: ${svgContent.length}`);
      console.log(`SVG starts with: ${svgContent.substring(0, 50)}`);
      console.log(`SVG content preview: ${svgContent.substring(0, 200)}...`);
      
      // Replace placeholders with actual customer data
      const customizedSVG = this.replacePlaceholders(svgContent, customerData);
      
      console.log(`Final customized SVG starts with: ${customizedSVG.substring(0, 50)}`);
      
      return customizedSVG;
    } catch (error) {
      console.error('Error generating customized SVG:', error);
      return null;
    }
  }

  private createSVGTemplateByID(templateId: number, side: 'front' | 'back', customerData: any): string {
    // Create proper SVG templates based on template ID and style
    if (side === 'back') {
      return this.createBackSVGTemplate(templateId);
    }

    // Create front side templates based on template ID
    switch (templateId) {
      case 15: // Minimal
        return this.createMinimalFrontSVG();
      case 16: // Classic
        return this.createClassicFrontSVG();
      case 17: // Simple
        return this.createSimpleFrontSVG();
      case 18: // Modern
        return this.createModernFrontSVG();
      default:
        return this.createBasicSVGTemplate(templateId, side, customerData);
    }
  }

  private createMinimalFrontSVG(): string {
    return `
      <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="350" height="200" fill="#000000"/>
        <text x="175" y="70" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="bold" font-family="Arial, sans-serif">
          {{fullName}}
        </text>
        <text x="175" y="95" text-anchor="middle" fill="#cccccc" font-size="14" font-family="Arial, sans-serif">
          {{jobTitle}}
        </text>
        <text x="175" y="120" text-anchor="middle" fill="#aaaaaa" font-size="12" font-family="Arial, sans-serif">
          {{email}}
        </text>
        <text x="175" y="140" text-anchor="middle" fill="#aaaaaa" font-size="11" font-family="Arial, sans-serif">
          {{phoneNumber}}
        </text>
        <text x="175" y="160" text-anchor="middle" fill="#888888" font-size="10" font-family="Arial, sans-serif">
          {{address}}
        </text>
      </svg>
    `;
  }

  private createClassicFrontSVG(): string {
    return `
      <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="350" height="200" fill="#000000"/>
        <rect x="10" y="10" width="330" height="180" fill="none" stroke="white" stroke-width="1"/>
        <text x="30" y="50" fill="#ffffff" font-size="18" font-weight="bold" font-family="Arial, sans-serif">
          {{fullName}}
        </text>
        <text x="30" y="75" fill="#cccccc" font-size="14" font-family="Arial, sans-serif">
          {{jobTitle}}
        </text>
        <text x="30" y="110" fill="#aaaaaa" font-size="12" font-family="Arial, sans-serif">
          Email: {{email}}
        </text>
        <text x="30" y="130" fill="#aaaaaa" font-size="12" font-family="Arial, sans-serif">
          Phone: {{phoneNumber}}
        </text>
        <text x="30" y="150" fill="#888888" font-size="10" font-family="Arial, sans-serif">
          {{address}}
        </text>
      </svg>
    `;
  }

  private createSimpleFrontSVG(): string {
    return `
      <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="350" height="200" fill="#1a1a1a"/>
        <text x="175" y="60" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="bold" font-family="Arial, sans-serif">
          {{fullName}}
        </text>
        <text x="175" y="85" text-anchor="middle" fill="#10b981" font-size="14" font-family="Arial, sans-serif">
          {{jobTitle}}
        </text>
        <text x="175" y="115" text-anchor="middle" fill="#cccccc" font-size="12" font-family="Arial, sans-serif">
          {{email}}
        </text>
        <text x="175" y="135" text-anchor="middle" fill="#cccccc" font-size="12" font-family="Arial, sans-serif">
          {{phoneNumber}}
        </text>
        <text x="175" y="155" text-anchor="middle" fill="#999999" font-size="10" font-family="Arial, sans-serif">
          {{address}}
        </text>
      </svg>
    `;
  }

  private createModernFrontSVG(): string {
    return `
      <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="350" height="200" fill="#000000"/>
        <rect x="0" y="0" width="350" height="60" fill="#10b981"/>
        <text x="30" y="35" fill="#ffffff" font-size="20" font-weight="bold" font-family="Arial, sans-serif">
          {{fullName}}
        </text>
        <text x="30" y="85" fill="#10b981" font-size="16" font-weight="bold" font-family="Arial, sans-serif">
          {{jobTitle}}
        </text>
        <text x="30" y="110" fill="#ffffff" font-size="12" font-family="Arial, sans-serif">
          {{email}}
        </text>
        <text x="30" y="130" fill="#ffffff" font-size="12" font-family="Arial, sans-serif">
          {{phoneNumber}}
        </text>
        <text x="30" y="150" fill="#cccccc" font-size="10" font-family="Arial, sans-serif">
          {{address}}
        </text>
      </svg>
    `;
  }

  private createBackSVGTemplate(templateId: number): string {
    return `
      <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="350" height="200" fill="#000000"/>
        <g transform="translate(175, 100)">
          <rect x="-60" y="-60" width="120" height="120" fill="#ffffff" rx="8"/>
          <text x="0" y="85" text-anchor="middle" fill="#ffffff" font-size="12" font-family="Arial, sans-serif">
            Scan for Digital Profile
          </text>
        </g>
      </svg>
    `;
  }

  private createBasicSVGTemplate(templateId: number, side: 'front' | 'back', customerData: any): string {
    if (side === 'back') {
      return `
        <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="350" height="200" fill="#000000"/>
          <g transform="translate(175, 100)">
            <rect x="-50" y="-50" width="100" height="100" fill="#ffffff" rx="10"/>
            <text x="0" y="75" text-anchor="middle" fill="#ffffff" font-size="12" font-family="Arial">
              QR Code
            </text>
          </g>
        </svg>
      `;
    }

    // Front side basic template
    return `
      <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="350" height="200" fill="#000000"/>
        <text x="175" y="60" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold" font-family="Arial">
          {{fullName}}
        </text>
        <text x="175" y="85" text-anchor="middle" fill="#cccccc" font-size="14" font-family="Arial">
          {{jobTitle}}
        </text>
        <text x="175" y="110" text-anchor="middle" fill="#aaaaaa" font-size="12" font-family="Arial">
          {{email}}
        </text>
        <text x="175" y="130" text-anchor="middle" fill="#aaaaaa" font-size="12" font-family="Arial">
          {{phoneNumber}}
        </text>
        <text x="175" y="150" text-anchor="middle" fill="#aaaaaa" font-size="10" font-family="Arial">
          {{address}}
        </text>
      </svg>
    `;
  }

  private replacePlaceholders(svgContent: string, customerData: any): string {
    let result = svgContent;
    
    // Replace common placeholders
    const replacements = {
      '{{fullName}}': customerData.fullName || 'Your Name',
      '{{jobTitle}}': customerData.jobTitle || 'Your Title',
      '{{email}}': customerData.email || 'email@example.com',
      '{{phoneNumber}}': customerData.phoneNumber || '(555) 123-4567',
      '{{address}}': customerData.address || 'Your Address',
      '{{company}}': customerData.company || 'Your Company',
      '{{website}}': customerData.website || 'www.example.com'
    };

    for (const [placeholder, value] of Object.entries(replacements)) {
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }

    return result;
  }

  async getTemplatePreview(templateId: number, side: 'front' | 'back'): Promise<Buffer | null> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) return null;

      // Use SVG content for card builder system (enables live editing)
      const svgContent = side === 'front' ? template.frontSvg : template.backSvg;
      
      if (svgContent) {
        return Buffer.from(svgContent, 'utf-8');
      }

      return null;
    } catch (error) {
      console.error('Error getting template preview:', error);
      return null;
    }
  }

  // This method was replaced by the primary generateCustomizedSVG method above

  // Generate card composition with both sides
  async generateCardComposition(templateId: number, customerData: any): Promise<{ front: string; back: string } | null> {
    try {
      const frontSVG = await this.generateCustomizedSVG(templateId, 'front', customerData);
      const backSVG = await this.generateCustomizedSVG(templateId, 'back', customerData);

      if (!frontSVG || !backSVG) {
        return null;
      }

      return {
        front: frontSVG,
        back: backSVG
      };
    } catch (error) {
      console.error('Error generating card composition:', error);
      return null;
    }
  }

  // Integration method for existing card generation system
  async generateCardWithTemplate(templateId: number, profileData: any, qrCodePath?: string): Promise<{ front: Buffer; back: Buffer } | null> {
    try {
      // Import existing card renderer
      const { cardRenderer } = await import('./cardRenderer');
      
      // Create template object that matches CardTemplate interface
      const template = { id: templateId, name: `Template ${templateId}` };
      
      // Use the updated card renderer which now uses templateService
      const result = await cardRenderer.renderDoubleSidedCard(profileData, template, qrCodePath, 'svg');
      
      return result;
    } catch (error) {
      console.error('Error generating card with template:', error);
      return null;
    }
  }
}

export const templateService = new TemplateService();