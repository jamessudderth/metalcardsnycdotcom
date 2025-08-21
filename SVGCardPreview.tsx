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

interface SVGCardPreviewProps {
  templateId: number;
  profileData: ProfileData;
  className?: string;
  showBothSides?: boolean;
  side?: 'front' | 'back';
}

export function SVGCardPreview({ 
  templateId, 
  profileData, 
  className = '',
  showBothSides = true,
  side = 'front'
}: SVGCardPreviewProps) {
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>(side);
  const [isHovered, setIsHovered] = useState(false);
  
  // Auto-flip to back when hovering (if showBothSides is true)
  useEffect(() => {
    if (showBothSides && isHovered) {
      setCurrentSide('back');
    } else if (showBothSides && !isHovered) {
      setCurrentSide('front');
    } else if (!showBothSides) {
      setCurrentSide(side); // Use the specified side when not showing both
    }
  }, [isHovered, showBothSides, side]);
  
  // Force the current side to match the prop when showBothSides is false
  useEffect(() => {
    if (!showBothSides) {
      setCurrentSide(side);
    }
  }, [side, showBothSides]);

  // Generate real-time customized template with live data
  const [customizedSVG, setCustomizedSVG] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch customized SVG with real customer data
  useEffect(() => {
    const fetchCustomizedTemplate = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/template-customize/${templateId}/${currentSide}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(profileData),
        });
        
        if (response.ok) {
          const svgContent = await response.text();
          setCustomizedSVG(svgContent);
        } else {
          // Fallback to base template if customization fails
          const fallbackResponse = await fetch(`/api/template-preview/${templateId}/${currentSide}`);
          if (fallbackResponse.ok) {
            const fallbackContent = await fallbackResponse.text();
            setCustomizedSVG(fallbackContent);
          }
        }
      } catch (error) {
        console.error('Error fetching customized template:', error);
        // Use base template as fallback
        try {
          const fallbackResponse = await fetch(`/api/template-preview/${templateId}/${currentSide}`);
          if (fallbackResponse.ok) {
            const fallbackContent = await fallbackResponse.text();
            setCustomizedSVG(fallbackContent);
          }
        } catch (fallbackError) {
          console.error('Error fetching fallback template:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomizedTemplate();
  }, [templateId, currentSide, profileData]);

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <Card className="bg-black rounded-lg overflow-hidden shadow-2xl border-gold/20">
        <div 
          className="relative w-full h-64 bg-black cursor-pointer transition-transform duration-300 hover:scale-105"
          onMouseEnter={() => showBothSides && setIsHovered(true)}
          onMouseLeave={() => showBothSides && setIsHovered(false)}
        >
          {/* Loading state */}
          {isLoading && (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
              <span className="ml-2 text-white text-sm">Generating preview...</span>
            </div>
          )}
          
          {/* Live customized SVG template with real data */}
          {!isLoading && customizedSVG && (
            <div 
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: customizedSVG }}
              style={{ imageRendering: 'crisp-edges' }}
            />
          )}
          
          {/* Fallback if no SVG available */}
          {!isLoading && !customizedSVG && (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
              <span className="text-sm">Template preview unavailable</span>
            </div>
          )}
          
          {/* Side indicator */}
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentSide.toUpperCase()}
          </div>
          
          {showBothSides && (
            <div className="absolute bottom-2 left-2 text-white text-xs opacity-75">
              Hover to flip
            </div>
          )}
        </div>
        
        {showBothSides && (
          <div className="flex border-t border-gray-700">
            <button
              onClick={() => setCurrentSide('front')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                currentSide === 'front' 
                  ? 'bg-gold text-black' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setCurrentSide('back')}
              className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-gray-700 ${
                currentSide === 'back' 
                  ? 'bg-gold text-black' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Back
            </button>
          </div>
        )}
      </Card>
      
      {/* Template info */}
      <div className="mt-3 text-center">
        <p className="text-sm text-muted-foreground">
          Real-time preview • Template ID: {templateId}
        </p>
        {profileData.fullName && (
          <p className="text-xs text-emerald-400 mt-1">
            Personalized for {profileData.fullName}
          </p>
        )}
      </div>
    </div>
  );
}