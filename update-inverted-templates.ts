#!/usr/bin/env tsx

import { db } from './server/db';
import { svgTemplates } from './shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function updateInvertedTemplates() {
  console.log('Updating database with inverted templates...');
  
  try {
    const pngDir = 'public/templates/png';
    
    // Templates that were inverted (minimal ID: 15, classic ID: 16)
    const templatesUpdated = [
      { id: 15, name: 'minimal', description: 'Minimal Metal Card' },
      { id: 16, name: 'classic', description: 'Classic Professional' }
    ];
    
    for (const template of templatesUpdated) {
      console.log(`\nUpdating ${template.description} in database...`);
      
      const frontPngPath = path.join(pngDir, `${template.name}-front.png`);
      const backPngPath = path.join(pngDir, `${template.name}-back.png`);
      
      // Read the inverted PNG files as base64
      const frontPngBuffer = fs.readFileSync(frontPngPath);
      const backPngBuffer = fs.readFileSync(backPngPath);
      
      const frontPngBase64 = frontPngBuffer.toString('base64');
      const backPngBase64 = backPngBuffer.toString('base64');
      
      // Create data URLs
      const frontDataUrl = `data:image/png;base64,${frontPngBase64}`;
      const backDataUrl = `data:image/png;base64,${backPngBase64}`;
      
      // Update the database record
      await db.update(svgTemplates)
        .set({
          frontSvg: frontDataUrl,
          backSvg: backDataUrl,
          updatedAt: new Date()
        })
        .where(eq(svgTemplates.id, template.id));
      
      console.log(`  ✓ Updated ${template.description} (ID: ${template.id}) with inverted colors`);
    }
    
    console.log('\nDatabase update completed successfully!');
    console.log('Templates now have uniform black backgrounds in the system.');
    
  } catch (error) {
    console.error('Error updating inverted templates:', error);
    process.exit(1);
  }
}

// Run the update
if (import.meta.url === `file://${process.argv[1]}`) {
  updateInvertedTemplates()
    .then(() => {
      console.log('\nTemplate database update finished successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nTemplate database update failed:', error);
      process.exit(1);
    });
}

export { updateInvertedTemplates };