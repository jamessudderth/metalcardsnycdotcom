import { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
  style?: 'standard' | 'rounded' | 'dot' | 'circular' | 'square';
  border?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

const QRCode = ({ 
  value, 
  size = 200, 
  color = '#000000', 
  backgroundColor = '#ffffff', 
  className = '',
  style = 'standard',
  border = false,
  borderColor = '#000000',
  borderWidth = 2
}: QRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    const options = {
      errorCorrectionLevel: 'H',
      margin: style === 'circular' ? 0 : 2,
      width: size,
      color: {
        dark: color,
        light: backgroundColor
      }
    };

    // For dot and circular styles, we'll use a custom rendering approach after generating
    QRCodeLib.toCanvas(canvasRef.current, value, options, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
        return;
      }
      
      // Apply style customizations
      if (style !== 'standard') {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        
        if (canvas && ctx) {
          const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = pixelData.data;
          
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Add border if specified
          if (border) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            
            if (style === 'circular') {
              // Draw circular border
              ctx.beginPath();
              ctx.arc(canvas.width/2, canvas.height/2, (canvas.width/2) - borderWidth/2, 0, Math.PI * 2);
              ctx.stroke();
              // Fill with background color
              ctx.fillStyle = backgroundColor;
              ctx.beginPath();
              ctx.arc(canvas.width/2, canvas.height/2, (canvas.width/2) - borderWidth, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Draw rectangular border with optional rounded corners
              const radius = style === 'rounded' ? 10 : 0;
              ctx.beginPath();
              ctx.moveTo(borderWidth/2 + radius, borderWidth/2);
              ctx.lineTo(canvas.width - borderWidth/2 - radius, borderWidth/2);
              ctx.arcTo(canvas.width - borderWidth/2, borderWidth/2, canvas.width - borderWidth/2, borderWidth/2 + radius, radius);
              ctx.lineTo(canvas.width - borderWidth/2, canvas.height - borderWidth/2 - radius);
              ctx.arcTo(canvas.width - borderWidth/2, canvas.height - borderWidth/2, canvas.width - borderWidth/2 - radius, canvas.height - borderWidth/2, radius);
              ctx.lineTo(borderWidth/2 + radius, canvas.height - borderWidth/2);
              ctx.arcTo(borderWidth/2, canvas.height - borderWidth/2, borderWidth/2, canvas.height - borderWidth/2 - radius, radius);
              ctx.lineTo(borderWidth/2, borderWidth/2 + radius);
              ctx.arcTo(borderWidth/2, borderWidth/2, borderWidth/2 + radius, borderWidth/2, radius);
              ctx.stroke();
            }
          } else {
            // Just add the background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          
          // Draw QR code with special styling
          const cellSize = Math.ceil(canvas.width / Math.sqrt(pixels.length / 4));
          
          for (let y = 0; y < canvas.height; y += cellSize) {
            for (let x = 0; x < canvas.width; x += cellSize) {
              const pixelIndex = (y * canvas.width + x) * 4;
              
              // Only draw dark pixels (the QR code pattern)
              if (pixels[pixelIndex] === 0) {
                ctx.fillStyle = color;
                
                switch(style) {
                  case 'dot':
                    // Draw circles for each module
                    const radius = cellSize * 0.4;
                    ctx.beginPath();
                    ctx.arc(x + cellSize/2, y + cellSize/2, radius, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                    
                  case 'rounded':
                    // Draw rounded squares
                    const roundRadius = cellSize * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(x + roundRadius, y);
                    ctx.lineTo(x + cellSize - roundRadius, y);
                    ctx.arcTo(x + cellSize, y, x + cellSize, y + roundRadius, roundRadius);
                    ctx.lineTo(x + cellSize, y + cellSize - roundRadius);
                    ctx.arcTo(x + cellSize, y + cellSize, x + cellSize - roundRadius, y + cellSize, roundRadius);
                    ctx.lineTo(x + roundRadius, y + cellSize);
                    ctx.arcTo(x, y + cellSize, x, y + cellSize - roundRadius, roundRadius);
                    ctx.lineTo(x, y + roundRadius);
                    ctx.arcTo(x, y, x + roundRadius, y, roundRadius);
                    ctx.fill();
                    break;
                  
                  case 'circular':
                    // Calculate distance from center
                    const centerX = canvas.width / 2;
                    const centerY = canvas.height / 2;
                    const distance = Math.sqrt(Math.pow(x + cellSize/2 - centerX, 2) + 
                                             Math.pow(y + cellSize/2 - centerY, 2));
                    
                    // Only draw within a circle
                    if (distance < (canvas.width / 2) - borderWidth - cellSize/2) {
                      ctx.beginPath();
                      ctx.rect(x, y, cellSize, cellSize);
                      ctx.fill();
                    }
                    break;
                  
                  case 'square':
                  default:
                    // Regular square modules
                    ctx.beginPath();
                    ctx.rect(x, y, cellSize, cellSize);
                    ctx.fill();
                    break;
                }
              }
            }
          }
        }
      }
    });
  }, [value, size, color, backgroundColor, style, border, borderColor, borderWidth]);

  return (
    <div className={`inline-block ${className}`}>
      {value ? (
        <canvas ref={canvasRef} className="rounded" />
      ) : (
        <div 
          className="flex items-center justify-center bg-gray-100 rounded" 
          style={{ width: size, height: size }}
        >
          <span className="text-gray-400 text-xs">QR Code</span>
        </div>
      )}
    </div>
  );
};

export default QRCode;
