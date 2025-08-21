import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Eye, RefreshCw } from 'lucide-react';
import Card3DPreview from './Card3DPreview';
import CardPreviewModal from './CardPreviewModal';
import { cardTemplates } from '@/lib/card-templates';
import { useToast } from '@/hooks/use-toast';

interface BusinessCardPreviewProps {
  profileData: any;
}

const BusinessCardPreview: React.FC<BusinessCardPreviewProps> = ({ profileData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardUrls, setCardUrls] = useState<{ front?: string; back?: string }>({});
  const { toast } = useToast();

  const generateCardPreviews = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          templateId: selectedTemplate,
          format: 'svg'
        })
      });
      
      if (!response.ok) {
        // If user is not authenticated, show demo cards instead
        if (response.status === 401) {
          setCardUrls({
            front: generateDemoCard('front'),
            back: generateDemoCard('back')
          });
          toast({
            title: "Demo Preview",
            description: "Log in to generate cards with your profile data.",
            variant: "default",
          });
          return;
        }
        throw new Error('Failed to generate card');
      }
      
      const cardData = await response.json();
      
      // Convert base64 to data URLs for preview
      const frontUrl = `data:${cardData.front.mimeType};base64,${cardData.front.data}`;
      const backUrl = `data:${cardData.back.mimeType};base64,${cardData.back.data}`;
      
      setCardUrls({ front: frontUrl, back: backUrl });
      
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Could not generate business card preview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDemoCard = (side: 'front' | 'back') => {
    const selectedTemplateInfo = cardTemplates.find(t => t.id === selectedTemplate);
    const bgColor = selectedTemplateInfo?.backgroundColor || '#ffffff';
    const textColor = selectedTemplateInfo?.textColor || '#000000';
    
    if (side === 'front') {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="350" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="350" height="200" fill="${bgColor}" stroke="#ddd" stroke-width="1" rx="10"/>
          <text x="175" y="60" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="${textColor}" text-anchor="middle">John Doe</text>
          <text x="175" y="80" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="middle">Senior Developer</text>
          <text x="175" y="120" font-family="Arial, sans-serif" font-size="12" fill="${textColor}" text-anchor="middle">john.doe@email.com</text>
          <text x="175" y="140" font-family="Arial, sans-serif" font-size="12" fill="${textColor}" text-anchor="middle">(555) 123-4567</text>
          <text x="175" y="170" font-family="Arial, sans-serif" font-size="10" fill="${textColor}" text-anchor="middle">Demo Preview - Login to use your data</text>
        </svg>
      `)}`;
    } else {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="350" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="350" height="200" fill="${bgColor}" stroke="#ddd" stroke-width="1" rx="10"/>
          <g transform="translate(175, 100)">
            <rect x="-40" y="-40" width="80" height="80" fill="#f0f0f0" stroke="${textColor}" stroke-width="1" rx="5"/>
            <text x="0" y="0" font-family="Arial, sans-serif" font-size="12" fill="${textColor}" text-anchor="middle">QR Code</text>
          </g>
          <text x="175" y="170" font-family="Arial, sans-serif" font-size="10" fill="${textColor}" text-anchor="middle">Scan to view profile</text>
        </svg>
      `)}`;
    }
  };

  const downloadCards = async (format: 'svg' | 'jpeg') => {
    try {
      const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          templateId: selectedTemplate,
          format: format
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate card');
      
      const cardData = await response.json();
      
      // Download front
      const frontLink = document.createElement('a');
      frontLink.href = `data:${cardData.front.mimeType};base64,${cardData.front.data}`;
      frontLink.download = cardData.front.filename;
      frontLink.click();
      
      // Download back after a brief delay
      setTimeout(() => {
        const backLink = document.createElement('a');
        backLink.href = `data:${cardData.back.mimeType};base64,${cardData.back.data}`;
        backLink.download = cardData.back.filename;
        backLink.click();
      }, 1000);
      
      toast({
        title: "Cards downloaded!",
        description: `Your business card files (${format.toUpperCase()}) have been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download business card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedTemplateInfo = cardTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Choose Template</label>
        <Select value={selectedTemplate.toString()} onValueChange={(value) => setSelectedTemplate(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {cardTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id.toString()}>
                {template.name} - {template.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Generate Preview Button */}
      <div className="flex justify-center">
        <Button 
          onClick={generateCardPreviews} 
          disabled={isGenerating}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Generate Preview'}</span>
        </Button>
      </div>

      {/* 3D Card Preview */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Card3DPreview
              frontImageUrl={cardUrls.front}
              backImageUrl={cardUrls.back}
              isLoading={isGenerating}
              onDownloadSVG={() => downloadCards('svg')}
              onDownloadJPEG={() => downloadCards('jpeg')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Actions */}
      <div className="flex justify-center space-x-4">
        <CardPreviewModal
          frontImageUrl={cardUrls.front}
          backImageUrl={cardUrls.back}
          isLoading={isGenerating}
          onDownloadSVG={() => downloadCards('svg')}
          onDownloadJPEG={() => downloadCards('jpeg')}
          triggerButton={
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Full Preview
            </Button>
          }
        />
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => downloadCards('svg')}
          disabled={!cardUrls.front || !cardUrls.back}
        >
          <Download className="w-4 h-4 mr-2" />
          Download SVG
        </Button>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => downloadCards('jpeg')}
          disabled={!cardUrls.front || !cardUrls.back}
        >
          <Download className="w-4 h-4 mr-2" />
          Download JPEG
        </Button>
      </div>

      {/* Template Info */}
      {selectedTemplateInfo && (
        <div className="text-center text-sm text-gray-500">
          <p>Selected: <strong>{selectedTemplateInfo.name}</strong> - {selectedTemplateInfo.description}</p>
        </div>
      )}
    </div>
  );
};

export default BusinessCardPreview;