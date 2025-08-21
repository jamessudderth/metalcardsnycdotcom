import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  previewUrl?: string;
  className?: string;
  variant?: "default" | "avatar" | "logo";
}

export function FileUpload({
  onUpload,
  accept = "image/*",
  maxSize = 5, // default 5MB
  label = "Upload file",
  previewUrl,
  className = "",
  variant = "default",
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setIsUploading(true);
      await onUpload(file);
      toast({
        title: "Upload successful",
        description: "Your file has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your file.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "avatar":
        return "h-24 w-24 rounded-full overflow-hidden";
      case "logo":
        return "h-20 max-w-[180px] rounded overflow-hidden";
      default:
        return "h-32 w-full rounded overflow-hidden";
    }
  };

  return (
    <div className={`relative ${className}`}>
      {preview ? (
        <div className="relative">
          <div className={getVariantStyles()}>
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={clearFile}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`${getVariantStyles()} flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-6 w-6 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">
            {isUploading ? "Uploading..." : label}
          </span>
        </div>
      )}
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
