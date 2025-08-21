import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Accessibility, 
  Eye, 
  Type, 
  Contrast, 
  Palette, 
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX
} from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: number;
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  audioFeedback: boolean;
  focusIndicators: boolean;
  zoom: number;
}

interface AccessibilityToolbarProps {
  onSettingsChange: (settings: AccessibilitySettings) => void;
  className?: string;
}

const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  onSettingsChange,
  className = ''
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSize: 16,
    colorBlindMode: 'none',
    reducedMotion: false,
    screenReaderMode: false,
    keyboardNavigation: true,
    audioFeedback: false,
    focusIndicators: true,
    zoom: 100,
  });

  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        onSettingsChange(parsed);
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
  }, [onSettingsChange]);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    onSettingsChange(settings);
    
    // Apply global accessibility settings
    applyGlobalSettings(settings);
  }, [settings, onSettingsChange]);

  const applyGlobalSettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Font size
    root.style.setProperty('--accessibility-font-size', `${settings.fontSize}px`);
    
    // Color blind mode
    root.setAttribute('data-colorblind-mode', settings.colorBlindMode);
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Enhanced focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }
    
    // Zoom level
    root.style.setProperty('--accessibility-zoom', `${settings.zoom}%`);
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      fontSize: 16,
      colorBlindMode: 'none',
      reducedMotion: false,
      screenReaderMode: false,
      keyboardNavigation: true,
      audioFeedback: false,
      focusIndicators: true,
      zoom: 100,
    };
    setSettings(defaultSettings);
  };

  const announceChange = (message: string) => {
    if (settings.screenReaderMode) {
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = message;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Accessibility Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-background/90 backdrop-blur-sm"
        aria-label="Toggle accessibility settings"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Accessibility className="h-4 w-4" />
        <span className="sr-only">Accessibility Settings</span>
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <Card className="fixed top-16 right-4 z-50 w-80 max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-sm border-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Accessibility className="h-5 w-5" />
              Accessibility Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">Visual</h3>
              
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm">
                  High Contrast Mode
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => {
                    updateSetting('highContrast', checked);
                    announceChange(`High contrast mode ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label htmlFor="font-size" className="text-sm">
                  Font Size: {settings.fontSize}px
                </Label>
                <Slider
                  id="font-size"
                  min={12}
                  max={24}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={([value]) => {
                    updateSetting('fontSize', value);
                    announceChange(`Font size set to ${value} pixels`);
                  }}
                  className="w-full"
                />
              </div>

              {/* Zoom Level */}
              <div className="space-y-2">
                <Label htmlFor="zoom" className="text-sm">
                  Zoom Level: {settings.zoom}%
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSetting('zoom', Math.max(50, settings.zoom - 10))}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Slider
                    id="zoom"
                    min={50}
                    max={200}
                    step={10}
                    value={[settings.zoom]}
                    onValueChange={([value]) => {
                      updateSetting('zoom', value);
                      announceChange(`Zoom level set to ${value} percent`);
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSetting('zoom', Math.min(200, settings.zoom + 10))}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Color Blind Mode */}
              <div className="space-y-2">
                <Label htmlFor="colorblind-mode" className="text-sm">
                  Color Vision Assistance
                </Label>
                <Select
                  value={settings.colorBlindMode}
                  onValueChange={(value: any) => {
                    updateSetting('colorBlindMode', value);
                    announceChange(`Color vision mode set to ${value}`);
                  }}
                >
                  <SelectTrigger id="colorblind-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia (Red-Green)</SelectItem>
                    <SelectItem value="protanopia">Protanopia (Red-Green)</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia (Blue-Yellow)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Motion Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">Motion</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="text-sm">
                  Reduce Motion
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => {
                    updateSetting('reducedMotion', checked);
                    announceChange(`Reduced motion ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            </div>

            {/* Navigation Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">Navigation</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard-nav" className="text-sm">
                  Enhanced Keyboard Navigation
                </Label>
                <Switch
                  id="keyboard-nav"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => {
                    updateSetting('keyboardNavigation', checked);
                    announceChange(`Keyboard navigation ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="focus-indicators" className="text-sm">
                  Enhanced Focus Indicators
                </Label>
                <Switch
                  id="focus-indicators"
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) => {
                    updateSetting('focusIndicators', checked);
                    announceChange(`Focus indicators ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            </div>

            {/* Audio Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-2">Audio</h3>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader" className="text-sm">
                  Screen Reader Mode
                </Label>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReaderMode}
                  onCheckedChange={(checked) => {
                    updateSetting('screenReaderMode', checked);
                    announceChange(`Screen reader mode ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="audio-feedback" className="text-sm">
                  Audio Feedback
                </Label>
                <Switch
                  id="audio-feedback"
                  checked={settings.audioFeedback}
                  onCheckedChange={(checked) => {
                    updateSetting('audioFeedback', checked);
                    announceChange(`Audio feedback ${checked ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={resetSettings}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccessibilityToolbar;