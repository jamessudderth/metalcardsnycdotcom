import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CardTemplate as CardTemplateType } from "@/lib/card-templates";

interface TemplateCardProps {
  template: CardTemplateType;
  actionButton: React.ReactNode;
}

const TemplateCard = ({ template, actionButton }: TemplateCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card className="group overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-emerald/25 bg-deep-black border-emerald/20 hover:border-gold/60 h-full template-card-animated">
      <div 
        className="relative aspect-[3/2] overflow-hidden bg-gradient-to-br from-gray-900 to-black p-4 template-preview-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald/5 via-transparent to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        
        <div className="w-full h-full transition-transform duration-500 group-hover:scale-110 relative z-10">
          {/* Template preview using database images */}
          <div className="w-full h-full relative bg-black rounded-lg overflow-hidden border border-gray-800 group-hover:border-emerald/40 transition-all duration-500">
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer"></div>
            </div>
            
            {/* Front side (default) - Use PNG thumbnails for template selection */}
            <div className={`absolute inset-0 w-full h-full transition-all duration-700 transform-gpu ${isHovered ? 'opacity-0 scale-95 rotate-x-12' : 'opacity-100 scale-100 rotate-x-0'}`}>
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src={`/api/template-thumbnail/${template.id}/front`}
                  alt={`${template.name} template front`}
                  className={`w-full h-full object-contain transition-all duration-500 ${[15, 16].includes(template.id) ? 'invert-template' : ''}`}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            </div>

            {/* Back side (on hover) - Use PNG thumbnails for template selection */}
            <div className={`absolute inset-0 w-full h-full transition-all duration-700 transform-gpu ${isHovered ? 'opacity-100 scale-100 rotate-x-0' : 'opacity-0 scale-95 rotate-x-12'}`}>
              <div className="w-full h-full flex items-center justify-center">
                <img 
                  src={`/api/template-thumbnail/${template.id}/back`}
                  alt={`${template.name} template back`}
                  className={`w-full h-full object-contain transition-all duration-500 ${[15, 16].includes(template.id) ? 'invert-template' : ''}`}
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
            </div>

            {/* Animated hover instruction */}
            <div className={`absolute top-2 left-2 backdrop-blur-sm text-white text-xs px-2 py-1 rounded transition-all duration-300 ${isHovered ? 'bg-emerald-600/90 scale-105 text-white' : 'bg-black/60'}`}>
              {isHovered ? '← Back view' : 'Hover to flip →'}
            </div>

            {/* Corner accent animation */}
            <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-gold/0 group-hover:border-t-gold/40 transition-all duration-500"></div>
            <div className="absolute bottom-0 left-0 w-0 h-0 border-r-[20px] border-r-transparent border-b-[20px] border-b-emerald/0 group-hover:border-b-emerald/40 transition-all duration-500"></div>
          </div>
        </div>
      </div>
      <CardContent className="p-4 bg-deep-black">
        <h3 className="text-lg font-medium text-white">{template.name}</h3>
        <p className="mt-2 text-sm text-gray-300">{template.description}</p>
        <div className="mt-3 flex items-center text-xs text-gold">
          <span className="inline-block w-2 h-2 bg-gold rounded-full mr-2"></span>
          Black Metal • {template.textColor === "#FFD700" ? "Gold" : "Silver"} Laser Engraving
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 bg-deep-black">
        {actionButton}
      </CardFooter>
    </Card>
  );
};

export default TemplateCard;