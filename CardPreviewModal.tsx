import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download, X } from 'lucide-react';
import Card3DPreview from './Card3DPreview';

interface CardPreviewModalProps {
  frontImageUrl?: string;
  backImageUrl?: string;
  isLoading?: boolean;
  onDownloadSVG?: () => void;
  onDownloadJPEG?: () => void;
  triggerButton?: React.ReactNode;
  title?: string;
}

const CardPreviewModal: React.FC<CardPreviewModalProps> = ({
  frontImageUrl,
  backImageUrl,
  isLoading = false,
  onDownloadSVG,
  onDownloadJPEG,
  triggerButton,
  title = "Business Card Preview"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="flex items-center space-x-2">
      <Eye className="w-4 h-4" />
      <span>Preview Card</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <Card3DPreview
            frontImageUrl={frontImageUrl}
            backImageUrl={backImageUrl}
            isLoading={isLoading}
            onDownloadSVG={() => {
              onDownloadSVG?.();
              setIsOpen(false);
            }}
            onDownloadJPEG={() => {
              onDownloadJPEG?.();
              setIsOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardPreviewModal;