export interface CardTemplate {
  id: number;
  name: string;
  description: string;
  category: string;
  previewImageUrl: string;
  layout: 'standard' | 'modern' | 'minimal' | 'creative';
  backgroundColor?: string;
  textColor?: string;
  backgroundImageUrl?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  qrStyle?: 'standard' | 'rounded' | 'dot' | 'circular' | 'square';
  qrBorder?: boolean;
  qrBorderColor?: string;
  qrBorderWidth?: number;
  profileTemplate?: 'classic' | 'modern' | 'minimal' | 'creative' | 'corporate';
}

export const cardTemplates: CardTemplate[] = [
  // Updated PNG Templates imported from database - Professional metal card designs with enhanced design elements
  {
    id: 15, // Updated Minimal Metal Card PNG from database
    name: "Minimal",
    description: "Clean and minimalist design with elegant typography and simple layout",
    category: "Business Card",
    previewImageUrl: "", // Will be generated from updated PNG
    layout: "minimal",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    qrStyle: "standard",
    qrBorder: false,
    profileTemplate: "minimal"
  },
  {
    id: 16, // Updated Classic Professional PNG from database
    name: "Classic",
    description: "Professional business card layout with traditional styling and balanced composition",
    category: "Business Card", 
    previewImageUrl: "", // Will be generated from updated PNG
    layout: "standard",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    qrStyle: "standard",
    qrBorder: true,
    qrBorderColor: "#10B981",
    qrBorderWidth: 2,
    profileTemplate: "classic"
  },
  {
    id: 17, // Updated Simple Modern PNG from database
    name: "Simple",
    description: "Contemporary design with clean lines and modern aesthetics",
    category: "Business Card",
    previewImageUrl: "", // Will be generated from updated PNG
    layout: "modern",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    qrStyle: "rounded",
    qrBorder: false,
    profileTemplate: "modern"
  },
  {
    id: 18, // Updated Modern Executive PNG from database
    name: "Modern",
    description: "Sophisticated modern design with premium metal card styling and professional layout",
    category: "Business Card",
    previewImageUrl: "", // Will be generated from updated PNG
    layout: "creative",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    qrStyle: "circular",
    qrBorder: true,
    qrBorderColor: "#10B981",
    qrBorderWidth: 2,
    profileTemplate: "creative"
  }
];
