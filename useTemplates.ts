import { useQuery } from '@tanstack/react-query';

export interface Template {
  id: number;
  name: string;
  description: string;
  frontSvg: string;
  backSvg: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Fetch templates from database instead of static array
export function useTemplates() {
  return useQuery({
    queryKey: ['/api/svg-templates'],
    queryFn: async (): Promise<Template[]> => {
      const response = await fetch('/api/svg-templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });
}

// Convert database template to CardTemplate format for compatibility
export function templateToCardTemplate(template: Template): import('@/lib/card-templates').CardTemplate {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: "Business Card",
    previewImageUrl: `/api/template-preview/${template.id}/front?v=${Date.now()}`, // Updated preview URL
    layout: template.name.toLowerCase().includes('minimal') ? 'minimal' :
             template.name.toLowerCase().includes('classic') ? 'standard' :
             template.name.toLowerCase().includes('simple') ? 'modern' : 'creative',
    backgroundColor: "#000000",
    textColor: "#ffffff",
    qrStyle: "standard" as const,
    qrBorder: false,
    profileTemplate: template.name.toLowerCase().includes('minimal') ? 'minimal' :
                     template.name.toLowerCase().includes('classic') ? 'classic' :
                     template.name.toLowerCase().includes('simple') ? 'modern' : 'creative'
  } as import('@/lib/card-templates').CardTemplate;
}