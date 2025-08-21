import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Download, Eye } from 'lucide-react';

interface Card3DPreviewProps {
  frontImageUrl?: string;
  backImageUrl?: string;
  isLoading?: boolean;
  onDownloadSVG?: () => void;
  onDownloadJPEG?: () => void;
  className?: string;
}

const Card3DPreview: React.FC<Card3DPreviewProps> = ({
  frontImageUrl,
  backImageUrl,
  isLoading = false,
  onDownloadSVG,
  onDownloadJPEG,
  className = ''
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !isHovered) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateX = (e.clientY - centerY) / 10;
      const rotateY = (centerX - e.clientX) / 10;
      
      setMousePosition({ x: rotateX, y: rotateY });
    };

    if (isHovered) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isHovered]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const cardStyle = {
    transform: isHovered 
      ? `perspective(1000px) rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`
      : `perspective(1000px) ${isFlipped ? 'rotateY(180deg)' : ''}`,
    transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s ease-in-out',
  };

  return (
    <div className={`card-preview-container ${className}`}>
      <div className="relative">
        {/* 3D Card Container */}
        <div
          ref={cardRef}
          className="card-3d-wrapper relative mx-auto"
          style={{
            width: '350px',
            height: '200px',
            transformStyle: 'preserve-3d',
            cursor: 'pointer',
            ...cardStyle
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleFlip}
        >
          {/* Front Side */}
          <div
            className="card-face card-front absolute inset-0 rounded-lg shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              border: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : frontImageUrl ? (
              <img
                src={frontImageUrl}
                alt="Business Card Front"
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-gray-100 text-gray-500">
                <div className="text-center">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Front Preview</p>
                </div>
              </div>
            )}
          </div>

          {/* Back Side */}
          <div
            className="card-face card-back absolute inset-0 rounded-lg shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              border: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : backImageUrl ? (
              <img
                src={backImageUrl}
                alt="Business Card Back"
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-blue-100 text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <span className="text-xs">QR</span>
                  </div>
                  <p className="text-sm">Back Preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Flip Indicator */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-gray-500 mb-1">
            {isFlipped ? 'Back Side' : 'Front Side'}
          </p>
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full ${!isFlipped ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <div className={`w-2 h-2 rounded-full ${isFlipped ? 'bg-blue-500' : 'bg-gray-300'}`} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-12 flex flex-col items-center space-y-4">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlip}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Flip Card</span>
          </Button>
        </div>

        {/* Download Options */}
        {(frontImageUrl || backImageUrl) && (
          <div className="flex space-x-2">
            {onDownloadSVG && (
              <Button
                variant="default"
                size="sm"
                onClick={onDownloadSVG}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download SVG</span>
              </Button>
            )}
            {onDownloadJPEG && (
              <Button
                variant="default"
                size="sm"
                onClick={onDownloadJPEG}
                className="flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download JPEG</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Hover to interact • Click to flip • Mouse movement for 3D effect</p>
      </div>
    </div>
  );
};

export default Card3DPreview;