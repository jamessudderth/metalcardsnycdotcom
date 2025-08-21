import { useState, useEffect } from "react";
import { useSearch, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useTemplates, templateToCardTemplate } from "@/hooks/useTemplates";
import { cardTemplates } from "@/lib/card-templates";
import TemplatePreview from "@/components/TemplatePreview";

// Customer profile data interface
interface CustomerProfile {
  fullName: string;
  jobTitle: string;
  companyName: string;
  email: string;
  phoneNumber: string;
  address: string;
  website?: string;
  linkedinUrl?: string;
}

// Card type options
const cardTypes = [
  { id: "standard", name: "Standard Metal", price: 4, description: "Premium black metal cards" },
  { id: "color", name: "Color Metal", price: 5, description: "Full-color metal cards" },
  { id: "black_anodized", name: "Black Anodized", price: 7, description: "Premium black anodized finish" },
  { id: "luxury_titanium", name: "Luxury Titanium", price: 9, description: "Ultra-premium titanium cards" }
];

const CreateCard = () => {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const templateIdFromUrl = searchParams.get("templateId");
  const { toast } = useToast();

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(
    templateIdFromUrl ? parseInt(templateIdFromUrl) : 17
  );
  const [selectedCardType, setSelectedCardType] = useState("standard");
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>({
    fullName: '',
    jobTitle: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    address: '',
    website: '',
    linkedinUrl: ''
  });

  // Fetch templates from database
  const { data: dbTemplates, isLoading: templatesLoading } = useTemplates();
  
  // Use only your new SVG templates from the database
  const availableTemplates = dbTemplates?.filter(t => t.isActive).map(templateToCardTemplate) || [];

  // Find selected template
  const selectedTemplate = availableTemplates.find(t => t.id === selectedTemplateId);

  // Get template styling based on template name
  const getTemplateStyles = () => {
    if (!selectedTemplate) return { layout: 'modern', fontFamily: 'font-sans', spacing: 'space-y-2' };
    
    const templateName = selectedTemplate.name?.toLowerCase() || '';
    
    if (templateName.includes('minimal')) {
      return {
        layout: 'minimal',
        fontFamily: 'font-mono',
        spacing: 'space-y-3',
        textAlignment: 'text-left'
      };
    } else if (templateName.includes('classic')) {
      return {
        layout: 'classic',
        fontFamily: 'font-serif',
        spacing: 'space-y-2',
        textAlignment: 'text-center'
      };
    } else if (templateName.includes('modern')) {
      return {
        layout: 'modern',
        fontFamily: 'font-sans',
        spacing: 'space-y-4',
        textAlignment: 'text-left'
      };
    } else {
      return {
        layout: 'sleek',
        fontFamily: 'font-sans',
        spacing: 'space-y-2',
        textAlignment: 'text-right'
      };
    }
  };

  const templateStyles = getTemplateStyles();

  // Submit card for review mutation
  const submitCardMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/cards/submit-for-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit card for review');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Card Submitted Successfully!",
        description: "Your business card has been submitted for review. You'll receive updates via email.",
      });
      
      // Redirect to success page with order details
      setLocation(`/order-success?orderId=${data.orderId}`);
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your card. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!customerProfile.fullName || !customerProfile.email || !customerProfile.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (Name, Email, Phone).",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerProfile.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    const submissionData = {
      templateId: selectedTemplateId,
      cardType: selectedCardType,
      customerProfile,
      submittedAt: new Date().toISOString(),
    };

    submitCardMutation.mutate(submissionData);
  };

  const handleInputChange = (field: keyof CustomerProfile, value: string) => {
    setCustomerProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (templatesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-gold bg-clip-text text-transparent">
            Create Your Metal Business Card
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Design your professional metal business card in just a few simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Step 1: Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-400">Step 1: Choose Your Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedTemplateId === template.id 
                          ? 'ring-2 ring-emerald-500 ring-offset-2' 
                          : 'hover:scale-105'
                      }`}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <TemplatePreview
                        templateId={template.id}
                        templateName={template.name}
                        templateDescription={template.description}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Card Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-400">Step 2: Select Card Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCardType} onValueChange={setSelectedCardType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cardTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - ${type.price}/card - {type.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 3: Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-400">Step 3: Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        type="text"
                        value={customerProfile.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        placeholder="John Smith"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        type="text"
                        value={customerProfile.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        placeholder="Marketing Director"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={customerProfile.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Acme Corporation"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerProfile.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={customerProfile.phoneNumber}
                        onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                        placeholder="(555) 123-4567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={customerProfile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Business Ave, Suite 200, New York, NY 10001"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        type="url"
                        value={customerProfile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://company.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedinUrl">LinkedIn (Optional)</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={customerProfile.linkedinUrl}
                        onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white text-lg py-6"
                    disabled={submitCardMutation.isPending}
                  >
                    {submitCardMutation.isPending ? 'Submitting...' : 'Submit Card for Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-gold">Preview Your Card</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTemplate && (
                  <div className="space-y-4">
                    {/* Live Card Preview */}
                    <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-emerald-500/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Front Side Preview */}
                        <div className={`p-6 rounded-lg border min-h-[200px] flex flex-col justify-between ${
                          selectedCardType === 'standard' ? 'bg-gray-300 text-black border-gray-400' :
                          selectedCardType === 'color' ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-emerald-400' :
                          selectedCardType === 'black-anodized' ? 'bg-black text-white border-gray-800' :
                          'bg-gradient-to-br from-gray-400 to-gray-600 text-white border-gray-500'
                        }`}>
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`text-xs font-medium ${
                                selectedCardType === 'standard' ? 'text-gray-700' : 'text-emerald-400'
                              }`}>FRONT</div>
                              <div className="text-xs text-gold">METAL CARDS NYC</div>
                            </div>
                            <div className={`${templateStyles.spacing} ${templateStyles.textAlignment}`}>
                              <h3 className={`text-lg font-bold ${templateStyles.fontFamily}`}>
                                {customerProfile.fullName || 'Your Name Here'}
                              </h3>
                              <p className={`text-sm ${templateStyles.fontFamily} ${
                                selectedCardType === 'standard' ? 'text-gray-600' :
                                selectedCardType === 'color' ? 'text-emerald-200' :
                                'text-emerald-400'
                              }`}>
                                {customerProfile.jobTitle || 'Your Job Title Here'}
                              </p>
                              {customerProfile.companyName && (
                                <p className={`text-sm ${templateStyles.fontFamily} ${
                                  selectedCardType === 'standard' ? 'text-gray-500' : 'text-gray-300'
                                }`}>
                                  {customerProfile.companyName}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={`space-y-1 text-xs ${
                            selectedCardType === 'standard' ? 'text-gray-600' : 'text-gray-300'
                          }`}>
                            <p>{customerProfile.email || 'your.email@company.com'}</p>
                            <p>{customerProfile.phoneNumber || '(555) 123-4567'}</p>
                            {customerProfile.address && <p>{customerProfile.address}</p>}
                          </div>
                        </div>

                        {/* Back Side Preview */}
                        <div className={`p-6 rounded-lg border min-h-[200px] flex flex-col justify-center items-center ${
                          selectedCardType === 'standard' ? 'bg-gray-300 text-black border-gray-400' :
                          selectedCardType === 'color' ? 'bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-emerald-400' :
                          selectedCardType === 'black-anodized' ? 'bg-black text-white border-gray-800' :
                          'bg-gradient-to-br from-gray-400 to-gray-600 text-white border-gray-500'
                        }`}>
                          <div className={`text-xs font-medium mb-4 ${
                            selectedCardType === 'standard' ? 'text-gray-700' : 'text-emerald-400'
                          }`}>BACK</div>
                          <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mb-4">
                            <div className="text-black text-xs font-bold">QR CODE</div>
                          </div>
                          <p className={`text-xs text-center ${
                            selectedCardType === 'standard' ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            Scan to view digital profile
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-emerald-400 mb-2">Card Details:</h4>
                      <p><strong>Template:</strong> {selectedTemplate.name}</p>
                      <p><strong>Type:</strong> {cardTypes.find(t => t.id === selectedCardType)?.name}</p>
                      <p><strong>Price:</strong> ${cardTypes.find(t => t.id === selectedCardType)?.price}/card</p>
                    </div>

                    {/* Template & Card Type Selection Summary */}
                    <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/30">
                      <h4 className="font-semibold text-emerald-400 mb-2">Current Selection:</h4>
                      <p><strong>Template:</strong> {selectedTemplate?.name || 'Simple Modern'}</p>
                      <p><strong>Card Type:</strong> {cardTypes.find(t => t.id === selectedCardType)?.name || 'Standard Metal'}</p>
                      <p><strong>Price:</strong> ${cardTypes.find(t => t.id === selectedCardType)?.price || 4}/card</p>
                      <p className="text-xs text-emerald-300 mt-2">Preview updates automatically as you type your information below.</p>
                    </div>

                    {customerProfile.fullName && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-emerald-400 mb-2">Your Information:</h4>
                        <p><strong>Name:</strong> {customerProfile.fullName}</p>
                        {customerProfile.jobTitle && <p><strong>Title:</strong> {customerProfile.jobTitle}</p>}
                        {customerProfile.companyName && <p><strong>Company:</strong> {customerProfile.companyName}</p>}
                        {customerProfile.email && <p><strong>Email:</strong> {customerProfile.email}</p>}
                        {customerProfile.phoneNumber && <p><strong>Phone:</strong> {customerProfile.phoneNumber}</p>}
                        {customerProfile.website && <p><strong>Website:</strong> {customerProfile.website}</p>}
                        {customerProfile.linkedinUrl && <p><strong>LinkedIn:</strong> {customerProfile.linkedinUrl}</p>}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCard;