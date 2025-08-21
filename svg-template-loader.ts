// Direct SVG template loading utility - implements the approach suggested by user
// Loads SVG files directly from filesystem and populates data client-side for efficient real-time previews

interface ProfileData {
  fullName?: string;
  jobTitle?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;
  bannerLogoUrl?: string;
}

// Template ID to folder name mapping
const templateMapping: Record<number, string> = {
  15: 'minimal',
  16: 'classic', 
  17: 'simple',
  18: 'modern'
};

/**
 * Load SVG template directly from filesystem via API endpoint
 * This implements the user's suggested approach for efficient real-time previews
 */
export async function loadTemplateSVG(templateId: number, side: 'front' | 'back' = 'front'): Promise<string> {
  const templatePath = `/api/template-svg/${templateId}/${side}`;
  const response = await fetch(templatePath);
  
  if (!response.ok) {
    throw new Error(`Failed to load template: ${response.status}`);
  }
  
  return await response.text();
}

/**
 * Populate SVG template with actual customer data
 * Replaces {{placeholder}} tokens with real values
 */
export function populateTemplateData(svgContent: string, data: ProfileData): string {
  return svgContent
    .replace(/\{\{fullName\}\}/g, data.fullName || 'Your Name')
    .replace(/\{\{jobTitle\}\}/g, data.jobTitle || 'Your Title') 
    .replace(/\{\{email\}\}/g, data.email || 'your@email.com')
    .replace(/\{\{phoneNumber\}\}/g, data.phoneNumber || '(555) 123-4567')
    .replace(/\{\{address\}\}/g, data.address || 'Your Address')
    .replace(/\{\{qrCode\}\}/g, data.profileImageUrl ? `<image href="${data.profileImageUrl}" width="60" height="60"/>` : 'QR CODE');
}

/**
 * Complete workflow: load template SVG and populate with data
 * This implements the exact approach suggested: loadTemplateSVG + populateTemplateData
 */
export async function loadAndCustomizeTemplate(templateId: number, side: 'front' | 'back', profileData: ProfileData): Promise<string> {
  try {
    const svgTemplate = await loadTemplateSVG(templateId, side);
    return populateTemplateData(svgTemplate, profileData);
  } catch (error) {
    console.error('Error loading and customizing template:', error);
    throw error;
  }
}

/**
 * DOM manipulation version for direct injection into elements
 * Similar to the user's suggested approach with document.getElementById
 */
export async function loadTemplateIntoElement(templateId: number, side: 'front' | 'back', profileData: ProfileData, containerId: string): Promise<void> {
  try {
    const customizedSVG = await loadAndCustomizeTemplate(templateId, side, profileData);
    const container = document.getElementById(containerId);
    
    if (container) {
      container.innerHTML = customizedSVG;
    } else {
      console.error(`Container element with ID '${containerId}' not found`);
    }
  } catch (error) {
    console.error('Error loading template into element:', error);
    throw error;
  }
}