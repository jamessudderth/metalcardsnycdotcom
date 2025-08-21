import React from 'react';
import { Template } from '@/hooks/useTemplates';
import { useLocation } from 'wouter';

interface TemplatePreviewProps {
  templateId: number;
  templateName: string;
  templateDescription: string;
  clickable?: boolean;
  side?: 'front' | 'back';
  className?: string;
  showHoverEffect?: boolean;
}

// Create both named and default exports for compatibility
export function TemplatePreview({ 
  templateId,
  templateName,
  templateDescription,
  clickable = false,
  side = 'front', 
  className = '',
  showHoverEffect = true 
}: TemplatePreviewProps) {
  const [currentSide, setCurrentSide] = React.useState<'front' | 'back'>(side);
  const [imageError, setImageError] = React.useState(false);
  const [, setLocation] = useLocation();

  const templateImageUrl = `/api/template-thumbnail/${templateId}/${currentSide}?v=${Date.now()}`;
  
  const handleMouseEnter = () => {
    if (showHoverEffect) {
      setCurrentSide('back');
    }
  };

  const handleMouseLeave = () => {
    if (showHoverEffect) {
      setCurrentSide('front');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (clickable) {
      setLocation('/templates');
    }
  };

  if (imageError) {
    // Display Metal Cards NYC logo when template image fails to load
    return (
      <div 
        className={`bg-black rounded-lg overflow-hidden ${clickable ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className="w-full h-40 bg-black flex items-center justify-center">
          <div className="text-center">
            <img 
              src="/metal-cards-logo-new.png" 
              alt="Metal Cards NYC Logo" 
              className="w-32 h-24 object-contain mx-auto mb-2 opacity-90"
              style={{ filter: 'brightness(1.1) contrast(1.1)' }}
            />
            <h3 className="font-bold text-sm text-white opacity-90">{templateName}</h3>
          </div>
        </div>
        {clickable && (
          <div className="p-4 bg-white dark:bg-gray-800">
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
              {templateName}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {templateDescription}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${clickable ? 'cursor-pointer hover:shadow-xl transition-shadow' : ''} ${className}`}
      onClick={handleClick}
    >
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={templateImageUrl}
          alt={`${templateName} - ${currentSide}`}
          className="w-full h-40 object-cover bg-black"
          onError={handleImageError}
          loading="lazy"
        />
        {showHoverEffect && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300" />
        )}
      </div>
      {clickable && (
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
            {templateName}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {templateDescription}
          </p>
        </div>
      )}
    </div>
  );
}

// Add default export for compatibility
export default TemplatePreview;