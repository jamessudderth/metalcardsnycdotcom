import { storage } from './storage';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Convert image files to base64 and update SVG templates
export async function updateTemplateImages() {
  try {
    // Load the new template images from attached_assets
    const classicFrontPath = join(process.cwd(), 'attached_assets', 'Screenshot 2025-07-27 at 7.31.57 PM_1753659125004.png');
    const classicBackPath = join(process.cwd(), 'attached_assets', 'Screenshot 2025-07-27 at 7.33.47 PM_1753659240054.png');
    const modernFrontPath = join(process.cwd(), 'attached_assets', 'Screenshot 2025-07-27 at 7.35.25 PM_1753659406706.png');
    const modernBackPath = join(process.cwd(), 'attached_assets', 'Screenshot 2025-07-25 at 11.26.21 AM_1753457186673.png');

    // Read and convert to base64
    const classicFrontBase64 = readFileSync(classicFrontPath).toString('base64');
    const classicBackBase64 = readFileSync(classicBackPath).toString('base64');
    const modernFrontBase64 = readFileSync(modernFrontPath).toString('base64');
    const modernBackBase64 = readFileSync(modernBackPath).toString('base64');

    // Create data URLs
    const classicFrontDataUrl = `data:image/png;base64,${classicFrontBase64}`;
    const classicBackDataUrl = `data:image/png;base64,${classicBackBase64}`;
    const modernFrontDataUrl = `data:image/png;base64,${modernFrontBase64}`;
    const modernBackDataUrl = `data:image/png;base64,${modernBackBase64}`;

    // Copy to public directory for serving
    writeFileSync(join(process.cwd(), 'public', 'classic-professional-front.png'), readFileSync(classicFrontPath));
    writeFileSync(join(process.cwd(), 'public', 'classic-professional-back.png'), readFileSync(classicBackPath));
    writeFileSync(join(process.cwd(), 'public', 'modern-executive-front.png'), readFileSync(modernFrontPath));
    writeFileSync(join(process.cwd(), 'public', 'modern-executive-back.png'), readFileSync(modernBackPath));

    console.log('Template images updated successfully!');
    return {
      classicFront: classicFrontDataUrl,
      classicBack: classicBackDataUrl,
      modernFront: modernFrontDataUrl,
      modernBack: modernBackDataUrl
    };

  } catch (error) {
    console.error('Error updating template images:', error);
    throw error;
  }
}