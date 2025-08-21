import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, QrCode, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadProfileVCard, generateProfileVCard, generateVCardQRCode } from "@/lib/vcard";
import QRCode from "@/components/QRCode";
import { useState } from "react";

interface VCardDownloadProps {
  profileData: any;
}

export default function VCardDownload({ profileData }: VCardDownloadProps) {
  const { toast } = useToast();
  const [showVCardQR, setShowVCardQR] = useState(false);
  
  if (!profileData?.profile) {
    return null;
  }

  const handleDownloadVCard = () => {
    try {
      // Use server-side VCard generation for better reliability
      const vCardUrl = `/api/vcard/${profileData.profile.id}`;
      const link = document.createElement('a');
      link.href = vCardUrl;
      link.download = `${profileData.profile.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "VCard Downloaded",
        description: "Your contact card with QR code attachment has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download VCard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyVCard = () => {
    try {
      const vCardContent = generateProfileVCard(profileData);
      navigator.clipboard.writeText(vCardContent);
      toast({
        title: "VCard Copied",
        description: "VCard content has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy VCard content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareVCard = () => {
    try {
      const vCardContent = generateProfileVCard(profileData);
      const blob = new Blob([vCardContent], { type: 'text/vcard' });
      const url = URL.createObjectURL(blob);
      
      if (navigator.share) {
        navigator.share({
          title: `${profileData.profile.fullName}'s Contact Card`,
          text: 'Digital business card from Metal Cards NYC',
          url: url
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(vCardContent);
        toast({
          title: "VCard Copied",
          description: "VCard content copied to clipboard for sharing.",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Failed to share VCard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const vCardContent = generateProfileVCard(profileData);
  const vCardQRCodeUrl = generateVCardQRCode(vCardContent);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          VCard Contact Export
        </CardTitle>
        <CardDescription>
          Download or share your contact information as a VCard with integrated QR code attachment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* VCard Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">VCard 3.0</Badge>
              <Badge variant="outline">QR Code Attached</Badge>
              <Badge variant="outline">Server Generated</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Your VCard includes all profile information plus an attached QR code linking to your digital profile.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={handleDownloadVCard}
              className="flex items-center gap-2"
              variant="default"
            >
              <Download className="h-4 w-4" />
              Download VCard
            </Button>
            
            <Button
              onClick={handleCopyVCard}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy VCard
            </Button>
            
            <Button
              onClick={handleShareVCard}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share VCard
            </Button>
          </div>

          {/* VCard QR Code Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">VCard QR Code</h4>
                <p className="text-sm text-gray-600">
                  QR code containing your complete contact information
                </p>
              </div>
              <Button
                onClick={() => setShowVCardQR(!showVCardQR)}
                variant="outline"
                size="sm"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showVCardQR ? 'Hide' : 'Show'} QR Code
              </Button>
            </div>

            {showVCardQR && (
              <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <QRCode
                    value={vCardContent}
                    size={180}
                    style="rounded"
                    border={true}
                    borderColor="#059669"
                    borderWidth={2}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">Scan to Add Contact</p>
                  <p className="text-xs text-gray-500">
                    Contains all your contact information including QR code attachment
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* VCard Preview */}
          <div className="space-y-3">
            <h4 className="font-medium">VCard Contents:</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap">
                {vCardContent}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}