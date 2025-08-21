// Template helper functions for dual PNG/SVG system

export interface TemplateInfo {
  id: number;
  name: string;
  displayName: string;
  thumbnailUrl: string; // PNG for selection interface
  previewUrl: string;   // SVG for card builder
}

// Get template thumbnail URL (PNG for template selection)
export function getTemplateThumbnailUrl(templateId: number, side: 'front' | 'back'): string {
  return `/api/template-thumbnail/${templateId}/${side}`;
}

// Get template preview URL (SVG for card builder)
export function getTemplatePreviewUrl(templateId: number, side: 'front' | 'back'): string {
  return `/api/template-preview/${templateId}/${side}`;
}

// Template data with both thumbnail and preview URLs
export const templateConfigs: TemplateInfo[] = [
  {
    id: 15,
    name: "minimal",
    displayName: "Minimal Metal Card",
    thumbnailUrl: getTemplateThumbnailUrl(15, 'front'),
    previewUrl: getTemplatePreviewUrl(15, 'front')
  },
  {
    id: 16,
    name: "classic",
    displayName: "Classic Professional",
    thumbnailUrl: getTemplateThumbnailUrl(16, 'front'),
    previewUrl: getTemplatePreviewUrl(16, 'front')
  },
  {
    id: 17,
    name: "simple",
    displayName: "Simple Modern",
    thumbnailUrl: getTemplateThumbnailUrl(17, 'front'),
    previewUrl: getTemplatePreviewUrl(17, 'front')
  },
  {
    id: 18,
    name: "modern",
    displayName: "Modern Executive",
    thumbnailUrl: getTemplateThumbnailUrl(18, 'front'),
    previewUrl: getTemplatePreviewUrl(18, 'front')
  }
];

// Get template configuration by ID
export function getTemplateConfig(templateId: number): TemplateInfo | undefined {
  return templateConfigs.find(t => t.id === templateId);
}

// Get all template configurations
export function getAllTemplateConfigs(): TemplateInfo[] {
  return templateConfigs;
}