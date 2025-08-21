import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Check, Eye, EyeOff } from 'lucide-react';

interface AccessibleColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
  description?: string;
  presetColors?: string[];
  disabled?: boolean;
  showContrast?: boolean;
  contrastBgColor?: string;
}

const AccessibleColorPicker: React.FC<AccessibleColorPickerProps> = ({
  value,
  onChange,
  label,
  description,
  presetColors = [
    '#000000', '#1a1a1a', '#333333', '#4a4a4a', '#666666', '#808080',
    '#ffffff', '#f5f5f5', '#e0e0e0', '#cccccc', '#999999', '#737373',
    '#10B981', '#059669', '#047857', '#065f46', '#064e3b', '#022c22',
    '#FFD700', '#F59E0B', '#D97706', '#B45309', '#92400e', '#78350f',
    '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', '#450a0a',
    '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF', '#1E3A8A', '#1e3a8a',
  ],
  disabled = false,
  showContrast = false,
  contrastBgColor = '#ffffff'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const hexInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleColorChange = (newColor: string) => {
    const color = newColor.startsWith('#') ? newColor : `#${newColor}`;
    if (isValidHex(color)) {
      onChange(color);
      setInputValue(color);
    }
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (isValidHex(newValue)) {
      onChange(newValue);
    }
  };

  const isValidHex = (hex: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  };

  const getContrastRatio = (color1: string, color2: string): number => {
    const getLuminance = (hex: string): number => {
      const rgb = hexToRgb(hex);
      if (!rgb) return 0;
      
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  };

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const getAccessibilityLevel = (ratio: number): { level: string; description: string } => {
    if (ratio >= 7) return { level: 'AAA', description: 'Excellent contrast' };
    if (ratio >= 4.5) return { level: 'AA', description: 'Good contrast' };
    if (ratio >= 3) return { level: 'AA Large', description: 'Acceptable for large text' };
    return { level: 'Fail', description: 'Poor contrast - not recommended' };
  };

  const contrastRatio = showContrast ? getContrastRatio(value, contrastBgColor) : 0;
  const accessibilityLevel = showContrast ? getAccessibilityLevel(contrastRatio) : null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={`color-${label}`} className="text-sm font-medium">
          {label}
          {description && (
            <span className="text-xs text-muted-foreground ml-2">
              {description}
            </span>
          )}
        </Label>
        
        <div className="flex items-center space-x-2">
          {/* Color Preview Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="p-0 h-10 w-16 border-2 focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            style={{ backgroundColor: value }}
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            aria-label={`Current color: ${value}. Click to open color picker.`}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          >
            <span className="sr-only">Color preview</span>
          </Button>
          
          {/* Hex Input */}
          <Input
            ref={hexInputRef}
            type="text"
            value={inputValue}
            onChange={handleHexInputChange}
            placeholder="#000000"
            className="flex-1 font-mono text-sm"
            disabled={disabled}
            aria-label={`${label} hex color value`}
            aria-describedby={showContrast ? `contrast-${label}` : undefined}
          />
          
          {/* Native Color Input (Hidden) */}
          <input
            ref={colorInputRef}
            type="color"
            value={value}
            onChange={(e) => handleColorChange(e.target.value)}
            className="sr-only"
            disabled={disabled}
            aria-label={`${label} color picker`}
          />
          
          {/* Open Native Color Picker */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => colorInputRef.current?.click()}
            disabled={disabled}
            aria-label="Open system color picker"
          >
            <Palette className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contrast Information */}
      {showContrast && accessibilityLevel && (
        <div 
          id={`contrast-${label}`}
          className="p-3 bg-muted rounded-md text-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">Contrast Ratio: {contrastRatio.toFixed(2)}:1</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              accessibilityLevel.level === 'AAA' ? 'bg-green-100 text-green-800' :
              accessibilityLevel.level === 'AA' ? 'bg-blue-100 text-blue-800' :
              accessibilityLevel.level === 'AA Large' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {accessibilityLevel.level}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {accessibilityLevel.description}
          </p>
        </div>
      )}

      {/* Color Palette */}
      {isOpen && (
        <Card className="border-2 border-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Color Palette</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Preset Colors */}
            <div>
              <h4 className="text-sm font-medium mb-2">Preset Colors</h4>
              <div 
                className="grid grid-cols-6 gap-2"
                role="group"
                aria-label="Preset color options"
              >
                {presetColors.map((color, index) => (
                  <button
                    key={color}
                    type="button"
                    className={`
                      h-8 w-8 rounded border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                      transition-all duration-200 hover:scale-110
                      ${value === color ? 'ring-2 ring-primary ring-offset-2' : 'hover:border-gray-400'}
                    `}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    aria-label={`Select color ${color}`}
                    title={color}
                  >
                    {value === color && (
                      <Check 
                        className="h-4 w-4 text-white mx-auto" 
                        style={{ 
                          color: getContrastRatio(color, '#ffffff') > getContrastRatio(color, '#000000') ? '#ffffff' : '#000000'
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccessibleColorPicker;