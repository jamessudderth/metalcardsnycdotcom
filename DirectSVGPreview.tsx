import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface ProfileData {
  fullName?: string;
  jobTitle?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;
  bannerLogoUrl?: string;
}

interface DirectSVGPreviewProps {
  templateId: number;
  profileData: ProfileData;
  className?: string;
  showBothSides?: boolean;
  side?: 'front' | 'back';
}

// Template ID to folder name mapping
const templateMapping: Record<number, string> = {
  15: 'minimal',
  16: 'classic', 
  17: 'simple',
  18: 'modern'
};

export function DirectSVGPreview({ 
  templateId, 
  profileData, 
  className = '',
  showBothSides = true,
  side = 'front'
}: DirectSVGPreviewProps) {
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>(side);
  const [isHovered, setIsHovered] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Auto-flip to back when hovering (if showBothSides is true)
  useEffect(() => {
    if (showBothSides && isHovered) {
      setCurrentSide('back');
    } else if (showBothSides && !isHovered) {
      setCurrentSide('front');
    } else if (!showBothSides) {
      setCurrentSide(side);
    }
  }, [isHovered, showBothSides, side]);
  
  // Force the current side to match the prop when showBothSides is false
  useEffect(() => {
    if (!showBothSides) {
      setCurrentSide(side);
    }
  }, [side, showBothSides]);

  // Load SVG template and populate with data
  useEffect(() => {
    const loadAndPopulateSVG = async () => {
      setIsLoading(true);
      try {
        const templateFolder = templateMapping[templateId];
        if (!templateFolder) {
          console.error('Unknown template ID:', templateId);
          return;
        }

        // Load SVG file directly from filesystem
        const templatePath = `/templates/svg/${templateFolder}/${currentSide}.svg`;
        const response = await fetch(templatePath);
        
        if (!response.ok) {
          throw new Error(`Failed to load template: ${response.status}`);
        }
        
        let svgText = await response.text();
        
        // Populate template with actual data
        svgText = populateTemplateData(svgText, profileData);
        
        setSvgContent(svgText);
      } catch (error) {
        console.error('Error loading SVG template:', error);
        // Fallback to basic template
        setSvgContent(createFallbackSVG(currentSide, profileData));
      } finally {
        setIsLoading(false);
      }
    };

    loadAndPopulateSVG();
  }, [templateId, currentSide, profileData]);

  // Function to populate template data
  const populateTemplateData = (svgText: string, data: ProfileData): string => {
    return svgText
      .replace(/\{\{fullName\}\}/g, data.fullName || 'Your Name')
      .replace(/\{\{jobTitle\}\}/g, data.jobTitle || 'Your Title') 
      .replace(/\{\{email\}\}/g, data.email || 'your@email.com')
      .replace(/\{\{phoneNumber\}\}/g, data.phoneNumber || '(555) 123-4567')
      .replace(/\{\{address\}\}/g, data.address || 'Your Address')
      .replace(/\{\{qrCode\}\}/g, data.profileImageUrl ? `<image href="${data.profileImageUrl}" width="60" height="60"/>` : 'QR CODE');
  };

  // Fallback SVG for when template loading fails
  const createFallbackSVG = (side: string, data: ProfileData): string => {
    if (side === 'back') {
      return `
        <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
          <rect width="350" height="200" fill="#000000"/>
          <g transform="translate(175, 100)">
            <text x="0" y="0" text-anchor="middle" fill="#ffffff" font-size="12">QR CODE</text>
          </g>
        </svg>
      `;
    }
    
    return `
      <svg width="350" height="200" viewBox="0 0 350 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="350" height="200" fill="#000000"/>
        <text x="175" y="70" text-anchor="middle" fill="#ffffff" font-size="16" font-weight="bold">${data.fullName || 'Your Name'}</text>
        <text x="175" y="90" text-anchor="middle" fill="#ffffff" font-size="12">${data.jobTitle || 'Your Title'}</text>
        <text x="175" y="110" text-anchor="middle" fill="#ffffff" font-size="10">${data.email || 'your@email.com'}</text>
        <text x="175" y="125" text-anchor="middle" fill="#ffffff" font-size="10">${data.phoneNumber || '(555) 123-4567'}</text>
        <text x="175" y="140" text-anchor="middle" fill="#ffffff" font-size="10">${data.address || 'Your Address'}</text>
      </svg>
    `;
  };

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="text-sm text-gray-500">Loading template...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={`p-4 transition-transform duration-300 hover:scale-105 cursor-pointer ${className}`}
      onMouseEnter={() => showBothSides && setIsHovered(true)}
      onMouseLeave={() => showBothSides && setIsHovered(false)}
    >
      <div className="relative">
        {/* SVG Preview */}
        <div 
          className="w-full h-48 border border-gray-200 rounded-lg overflow-hidden bg-black"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        
        {/* Side indicator */}
        {showBothSides && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
            {currentSide === 'front' ? 'Front' : 'Back'}
          </div>
        )}
        
        {/* Hover instruction */}
        {showBothSides && (
          <div className="text-center text-xs text-gray-500 mt-2">
            Hover to see {currentSide === 'front' ? 'back' : 'front'} side
          </div>
        )}
      </div>
    </Card>
  );
}