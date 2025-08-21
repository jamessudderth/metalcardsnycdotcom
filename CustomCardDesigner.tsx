import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Palette, 
  Type, 
  Layout,
  Save,
  Eye,
  Sparkles,
  Camera,
  Edit3,
  Layers
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface CustomDesignData {
  backgroundImage?: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  backgroundColor: string;
  gradientColors: [string, string];
  textElements: TextElement[];
  logoImage?: string;
  profilePhoto?: string;
  cardType: 'standard' | 'color' | 'black' | 'luxury';
  size: 'standard' | 'mini' | 'large';
}

interface TextElement {
  id: string;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  position: { x: number; y: number };
  alignment: 'left' | 'center' | 'right';
  fontWeight: 'normal' | 'bold';
  style: 'normal' | 'italic';
}

const CARD_TYPES = [
  { id: 'standard', name: 'Standard Metal', price: '$4', description: 'Brushed stainless steel finish' },
  { id: 'color', name: 'Color Metal', price: '$5', description: 'Anodized aluminum with color' },
  { id: 'black', name: 'Black Anodized', price: '$7', description: 'Premium black anodized finish' },
  { id: 'luxury', name: 'Luxury Titanium', price: '$9', description: 'Titanium with gold accents' }
];

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
  'Tahoma', 'Trebuchet MS', 'Impact', 'Lucida Grande', 'Palatino'
];

export default function CustomCardDesigner() {
  const [designData, setDesignData] = useState<CustomDesignData>({
    backgroundType: 'solid',
    backgroundColor: '#000000',
    gradientColors: ['#000000', '#333333'],
    textElements: [],
    cardType: 'standard',
    size: 'standard'
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<{ [key: string]: string }>({});
  const [previewMode, setPreviewMode] = useState<'front' | 'back'>('front');
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedDesignId, setSavedDesignId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  // Image upload and processing mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await apiRequest("POST", "/api/photoroom/process", formData);
      return response.json();
    },
    onSuccess: (data, file) => {
      setUploadedImages(prev => ({
        ...prev,
        [file.name]: data.processedImageUrl
      }));
      toast({
        title: "Image processed successfully!",
        description: "Background removed and optimized for business cards."
      });
    },
    onError: (error) => {
      toast({
        title: "Image processing failed",
        description: "Please try a different image or check your connection.",
        variant: "destructive"
      });
    }
  });

  // Save custom design mutation
  const saveDesignMutation = useMutation({
    mutationFn: async (design: CustomDesignData) => {
      const response = await apiRequest("POST", "/api/custom-designs/save", design);
      return response.json();
    },
    onSuccess: (data) => {
      setSavedDesignId(data.designId);
      toast({
        title: "Design saved successfully!",
        description: "Your custom business card design has been saved."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save design",
        description: "Please try again or check your connection.",
        variant: "destructive"
      });
    }
  });

  // Generate preview mutation
  const generatePreviewMutation = useMutation({
    mutationFn: async (design: CustomDesignData) => {
      const response = await apiRequest("POST", "/api/custom-designs/preview", design);
      return response.json();
    },
    onSuccess: (data) => {
      // Handle preview generation success
      toast({
        title: "Preview generated!",
        description: "Your custom design preview is ready."
      });
    }
  });

  const handleImageUpload = (file: File, type: 'background' | 'logo' | 'photo') => {
    if (file) {
      setIsProcessing(true);
      uploadImageMutation.mutate(file);
      setIsProcessing(false);
    }
  };

  const addTextElement = () => {
    const newElement: TextElement = {
      id: Date.now().toString(),
      text: 'New Text',
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#ffffff',
      position: { x: 50, y: 50 },
      alignment: 'left',
      fontWeight: 'normal',
      style: 'normal'
    };

    setDesignData(prev => ({
      ...prev,
      textElements: [...prev.textElements, newElement]
    }));
    setSelectedElement(newElement.id);
  };

  const updateTextElement = (id: string, updates: Partial<TextElement>) => {
    setDesignData(prev => ({
      ...prev,
      textElements: prev.textElements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  };

  const removeTextElement = (id: string) => {
    setDesignData(prev => ({
      ...prev,
      textElements: prev.textElements.filter(el => el.id !== id)
    }));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const generateBusinessCard = () => {
    generatePreviewMutation.mutate(designData);
  };

  const saveDesign = () => {
    saveDesignMutation.mutate(designData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Custom Business Card Designer
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create completely custom business card designs using professional image editing tools. 
            Upload your own backgrounds, logos, and photos for a truly unique metal card.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Design Tools Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Design Tools
                </CardTitle>
                <CardDescription>
                  Customize every aspect of your business card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="background" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="background">
                      <Palette className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="text">
                      <Type className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="images">
                      <ImageIcon className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="layout">
                      <Layout className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>

                  {/* Background Tab */}
                  <TabsContent value="background" className="space-y-4">
                    <div>
                      <Label>Card Type</Label>
                      <Select 
                        value={designData.cardType} 
                        onValueChange={(value) => setDesignData(prev => ({ ...prev, cardType: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CARD_TYPES.map(type => (
                            <SelectItem key={type.id} value={type.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{type.name}</span>
                                <Badge variant="secondary">{type.price}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Background Type</Label>
                      <Select 
                        value={designData.backgroundType} 
                        onValueChange={(value) => setDesignData(prev => ({ ...prev, backgroundType: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid Color</SelectItem>
                          <SelectItem value="gradient">Gradient</SelectItem>
                          <SelectItem value="image">Custom Image</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {designData.backgroundType === 'solid' && (
                      <div>
                        <Label>Background Color</Label>
                        <Input
                          type="color"
                          value={designData.backgroundColor}
                          onChange={(e) => setDesignData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        />
                      </div>
                    )}

                    {designData.backgroundType === 'gradient' && (
                      <div className="space-y-2">
                        <Label>Gradient Colors</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={designData.gradientColors[0]}
                            onChange={(e) => setDesignData(prev => ({ 
                              ...prev, 
                              gradientColors: [e.target.value, prev.gradientColors[1]] 
                            }))}
                          />
                          <Input
                            type="color"
                            value={designData.gradientColors[1]}
                            onChange={(e) => setDesignData(prev => ({ 
                              ...prev, 
                              gradientColors: [prev.gradientColors[0], e.target.value] 
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    {designData.backgroundType === 'image' && (
                      <div>
                        <Label>Upload Background Image</Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, 'background');
                          }}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Background
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Text Tab */}
                  <TabsContent value="text" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Text Elements</Label>
                      <Button size="sm" onClick={addTextElement}>
                        Add Text
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {designData.textElements.map(element => (
                        <Card key={element.id} className={`p-3 cursor-pointer border-2 ${
                          selectedElement === element.id ? 'border-primary' : 'border-border'
                        }`} onClick={() => setSelectedElement(element.id)}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium truncate">{element.text}</span>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeTextElement(element.id);
                              }}
                            >
                              ×
                            </Button>
                          </div>
                          
                          {selectedElement === element.id && (
                            <div className="space-y-2">
                              <Input
                                value={element.text}
                                onChange={(e) => updateTextElement(element.id, { text: e.target.value })}
                                placeholder="Enter text"
                              />
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-xs">Font Size</Label>
                                  <Input
                                    type="number"
                                    value={element.fontSize}
                                    onChange={(e) => updateTextElement(element.id, { fontSize: parseInt(e.target.value) })}
                                    min="8"
                                    max="72"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Color</Label>
                                  <Input
                                    type="color"
                                    value={element.color}
                                    onChange={(e) => updateTextElement(element.id, { color: e.target.value })}
                                  />
                                </div>
                              </div>

                              <Select 
                                value={element.fontFamily} 
                                onValueChange={(value) => updateTextElement(element.id, { fontFamily: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FONT_FAMILIES.map(font => (
                                    <SelectItem key={font} value={font}>{font}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={element.fontWeight === 'bold' ? 'default' : 'outline'}
                                  onClick={() => updateTextElement(element.id, { 
                                    fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' 
                                  })}
                                >
                                  <strong>B</strong>
                                </Button>
                                <Button
                                  size="sm"
                                  variant={element.style === 'italic' ? 'default' : 'outline'}
                                  onClick={() => updateTextElement(element.id, { 
                                    style: element.style === 'italic' ? 'normal' : 'italic' 
                                  })}
                                >
                                  <em>I</em>
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Images Tab */}
                  <TabsContent value="images" className="space-y-4">
                    <div>
                      <Label>Logo Upload</Label>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'logo');
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full"
                        disabled={isProcessing}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isProcessing ? 'Processing...' : 'Upload Logo'}
                      </Button>
                    </div>

                    <div>
                      <Label>Profile Photo</Label>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'photo');
                        }}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full"
                        disabled={isProcessing}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isProcessing ? 'Processing...' : 'Upload Photo'}
                      </Button>
                    </div>

                    {Object.keys(uploadedImages).length > 0 && (
                      <div>
                        <Label>Uploaded Images</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {Object.entries(uploadedImages).map(([name, url]) => (
                            <div key={name} className="border rounded p-2">
                              <img 
                                src={url} 
                                alt={name} 
                                className="w-full h-16 object-cover rounded"
                              />
                              <p className="text-xs mt-1 truncate">{name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Layout Tab */}
                  <TabsContent value="layout" className="space-y-4">
                    <div>
                      <Label>Card Size</Label>
                      <Select 
                        value={designData.size} 
                        onValueChange={(value) => setDesignData(prev => ({ ...prev, size: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (3.5" × 2")</SelectItem>
                          <SelectItem value="mini">Mini (3" × 1.75")</SelectItem>
                          <SelectItem value="large">Large (4" × 2.5")</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Preview Side</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant={previewMode === 'front' ? 'default' : 'outline'}
                          onClick={() => setPreviewMode('front')}
                          className="flex-1"
                        >
                          Front
                        </Button>
                        <Button
                          variant={previewMode === 'back' ? 'default' : 'outline'}
                          onClick={() => setPreviewMode('back')}
                          className="flex-1"
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Design Preview - {previewMode === 'front' ? 'Front' : 'Back'} Side
                  </span>
                  <div className="flex gap-2">
                    <Button onClick={generateBusinessCard} disabled={generatePreviewMutation.isPending}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {generatePreviewMutation.isPending ? 'Generating...' : 'Generate Preview'}
                    </Button>
                    <Button onClick={saveDesign} disabled={saveDesignMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      {saveDesignMutation.isPending ? 'Saving...' : 'Save Design'}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                  <div 
                    className="w-96 h-60 rounded-lg shadow-lg border-2 border-gray-300 relative overflow-hidden"
                    style={{
                      background: designData.backgroundType === 'solid' 
                        ? designData.backgroundColor
                        : designData.backgroundType === 'gradient'
                        ? `linear-gradient(135deg, ${designData.gradientColors[0]}, ${designData.gradientColors[1]})`
                        : designData.backgroundImage 
                        ? `url(${designData.backgroundImage}) center/cover`
                        : '#000000'
                    }}
                  >
                    {/* Render text elements */}
                    {designData.textElements.map(element => (
                      <div
                        key={element.id}
                        className="absolute cursor-pointer"
                        style={{
                          left: `${element.position.x}%`,
                          top: `${element.position.y}%`,
                          color: element.color,
                          fontSize: `${element.fontSize}px`,
                          fontFamily: element.fontFamily,
                          fontWeight: element.fontWeight,
                          fontStyle: element.style,
                          textAlign: element.alignment,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        {element.text}
                      </div>
                    ))}

                    {/* Card type indicator */}
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {CARD_TYPES.find(t => t.id === designData.cardType)?.name}
                      </Badge>
                    </div>

                    {/* Preview mode indicator */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className="text-xs">
                        {previewMode.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {savedDesignId && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✅ Design saved successfully! Design ID: {savedDesignId}
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      You can now order this custom design or make further modifications.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}