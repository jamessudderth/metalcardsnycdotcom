import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, ArrowLeft, ArrowRight, Grid, List } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  description: string;
  category: string;
  previewImageUrl: string;
  layout: string;
  backgroundColor: string;
  textColor: string;
  isAccessible?: boolean;
  contrastRatio?: number;
}

interface AccessibleTemplateSelectorProps {
  templates: Template[];
  selectedId: number;
  onSelect: (templateId: number) => void;
  className?: string;
}

const AccessibleTemplateSelector: React.FC<AccessibleTemplateSelectorProps> = ({
  templates,
  selectedId,
  onSelect,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const templateRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const selectedIndex = templates.findIndex(t => t.id === selectedId);
    if (selectedIndex !== -1) {
      setCurrentIndex(selectedIndex);
    }
  }, [selectedId, templates]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const gridCols = viewMode === 'grid' ? 2 : 1;
    const totalItems = templates.length;
    let newIndex = focusedIndex;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (viewMode === 'grid') {
          newIndex = Math.min(focusedIndex + 1, totalItems - 1);
        } else {
          newIndex = Math.min(focusedIndex + 1, totalItems - 1);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (viewMode === 'grid') {
          newIndex = Math.max(focusedIndex - 1, 0);
        } else {
          newIndex = Math.max(focusedIndex - 1, 0);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (viewMode === 'grid') {
          newIndex = Math.min(focusedIndex + gridCols, totalItems - 1);
        } else {
          newIndex = Math.min(focusedIndex + 1, totalItems - 1);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (viewMode === 'grid') {
          newIndex = Math.max(focusedIndex - gridCols, 0);
        } else {
          newIndex = Math.max(focusedIndex - 1, 0);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < totalItems) {
          handleSelect(templates[focusedIndex].id);
        }
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = totalItems - 1;
        break;
    }

    if (newIndex !== focusedIndex && newIndex >= 0 && newIndex < totalItems) {
      setFocusedIndex(newIndex);
      templateRefs.current[newIndex]?.focus();
    }
  };

  const handleSelect = (templateId: number) => {
    onSelect(templateId);
    const selectedIndex = templates.findIndex(t => t.id === templateId);
    setCurrentIndex(selectedIndex);
    
    // Announce selection for screen readers
    announceSelection(templates[selectedIndex]);
  };

  const announceSelection = (template: Template) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `Selected template: ${template.name}. ${template.description}`;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  const getAccessibilityInfo = (template: Template) => {
    // Calculate contrast ratio if colors are provided
    const contrastRatio = template.contrastRatio || calculateContrastRatio(template.backgroundColor, template.textColor);
    const isAccessible = contrastRatio >= 4.5;
    
    return {
      contrastRatio,
      isAccessible,
      level: contrastRatio >= 7 ? 'AAA' : contrastRatio >= 4.5 ? 'AA' : contrastRatio >= 3 ? 'AA Large' : 'Fail'
    };
  };

  const calculateContrastRatio = (bg: string, text: string): number => {
    const getLuminance = (hex: string): number => {
      const rgb = hexToRgb(hex);
      if (!rgb) return 0;
      
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(bg);
    const l2 = getLuminance(text);
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Choose Template</h3>
          <p className="text-sm text-muted-foreground">
            Use arrow keys to navigate, Enter to select
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Template Grid/List */}
      <div
        className={`
          ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-3'}
        `}
        role="radiogroup"
        aria-label="Business card templates"
        onKeyDown={handleKeyDown}
      >
        {templates.map((template, index) => {
          const accessibilityInfo = getAccessibilityInfo(template);
          const isSelected = template.id === selectedId;
          const isFocused = index === focusedIndex;

          return (
            <button
              key={template.id}
              ref={(el) => templateRefs.current[index] = el}
              className={`
                ${viewMode === 'grid' ? 'block' : 'flex items-center gap-4'}
                w-full p-4 rounded-lg border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                hover:border-primary/50 hover:shadow-md
                ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}
                ${isFocused ? 'ring-2 ring-primary ring-offset-2' : ''}
              `}
              onClick={() => handleSelect(template.id)}
              onFocus={() => setFocusedIndex(index)}
              role="radio"
              aria-checked={isSelected}
              aria-describedby={`template-${template.id}-description`}
              aria-label={`${template.name} template. ${template.description}. ${accessibilityInfo.isAccessible ? 'Accessible' : 'May have accessibility issues'}.`}
            >
              {/* Template Preview */}
              <div className={`
                ${viewMode === 'grid' ? 'aspect-[3/2] mb-3' : 'w-20 h-14 flex-shrink-0'}
                bg-gray-100 rounded border overflow-hidden relative
              `}>
                <div
                  className="w-full h-full flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: template.backgroundColor,
                    color: template.textColor 
                  }}
                >
                  {template.name}
                </div>
                
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className={`${viewMode === 'grid' ? 'text-center' : 'flex-1 text-left'}`}>
                <h4 className="font-semibold mb-1">{template.name}</h4>
                <p 
                  id={`template-${template.id}-description`}
                  className="text-sm text-muted-foreground mb-2"
                >
                  {template.description}
                </p>
                
                {/* Accessibility Badges */}
                <div className="flex flex-wrap gap-1 justify-center">
                  <Badge 
                    variant={accessibilityInfo.isAccessible ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {accessibilityInfo.level}
                  </Badge>
                  {accessibilityInfo.isAccessible && (
                    <Badge variant="outline" className="text-xs">
                      Accessible
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Help */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <strong>Keyboard Navigation:</strong>
        <ul className="mt-1 space-y-1">
          <li>• Arrow keys: Navigate between templates</li>
          <li>• Enter/Space: Select template</li>
          <li>• Home/End: Jump to first/last template</li>
        </ul>
      </div>
    </div>
  );
};

export default AccessibleTemplateSelector;