import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SVGCardPreview } from "@/components/SVGCardPreview";
import TemplateCard from "@/components/TemplateCard";
import { useTemplates, templateToCardTemplate } from "@/hooks/useTemplates";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Card type options with pricing
const cardTypes = [
  { id: "standard", name: "Standard Metal", price: 4, description: "Premium black metal cards" },
  { id: "color", name: "Color Metal", price: 5, description: "Full-color metal cards" },
  { id: "black_anodized", name: "Black Anodized", price: 7, description: "Premium black anodized finish" },
  { id: "luxury_titanium", name: "Luxury Titanium", price: 9, description: "Ultra-premium titanium cards" }
];

// Workflow steps
const STEPS = {
  TEMPLATE: 'template',
  INFO: 'info',  
  CARD_TYPE: 'cardType',
  PROFILE: 'profile',
  PREVIEW: 'preview'
} as const;

const CardDesigner = () => {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Current workflow step
  const [currentStep, setCurrentStep] = useState(STEPS.TEMPLATE);
  
  // Form data state
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(19);
  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    jobTitle: '',
    email: '',
    phoneNumber: '',
    address: '',
    company: '',
    website: ''
  });
  const [selectedCardType, setSelectedCardType] = useState('standard');
  const [profileLinks, setProfileLinks] = useState([
    { platform: 'LinkedIn', url: '', icon: 'linkedin' },
    { platform: 'Website', url: '', icon: 'globe' },
    { platform: 'Twitter', url: '', icon: 'twitter' }
  ]);

  // Fetch templates from database
  const { data: dbTemplates } = useTemplates();
  const availableTemplates = dbTemplates?.filter(t => t.isActive).map(templateToCardTemplate) || [];

  // Scroll to top when step changes
  useEffect(() => {
    // Scroll to top of the page smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Also ensure any main content containers are scrolled to top
    const mainContent = document.querySelector('[data-testid="card-designer-content"]');
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  // Profile update mutation to create digital profile
  const { mutate: createProfile, isPending: isCreatingProfile } = useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      setCurrentStep(STEPS.PREVIEW);
      toast({
        title: "Digital Profile Created",
        description: "Your digital profile and QR code have been generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Profile Creation Failed",
        description: error.message || "Failed to create digital profile.",
        variant: "destructive",
      });
    },
  });

  // Handle step navigation
  const nextStep = () => {
    switch (currentStep) {
      case STEPS.TEMPLATE:
        if (!selectedTemplateId) {
          toast({ title: "Please select a template", variant: "destructive" });
          return;
        }
        setCurrentStep(STEPS.INFO);
        break;
      case STEPS.INFO:
        if (!customerInfo.fullName || !customerInfo.email) {
          toast({ title: "Please fill in required information", variant: "destructive" });
          return;
        }
        setCurrentStep(STEPS.CARD_TYPE);
        break;
      case STEPS.CARD_TYPE:
        setCurrentStep(STEPS.PROFILE);
        break;
      case STEPS.PROFILE:
        // Create digital profile and QR code
        const profileData = {
          ...customerInfo,
          links: profileLinks.filter(link => link.url.trim() !== ''),
          templateId: selectedTemplateId,
          cardType: selectedCardType
        };
        createProfile(profileData);
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case STEPS.INFO:
        setCurrentStep(STEPS.TEMPLATE);
        break;
      case STEPS.CARD_TYPE:
        setCurrentStep(STEPS.INFO);
        break;
      case STEPS.PROFILE:
        setCurrentStep(STEPS.CARD_TYPE);
        break;
      case STEPS.PREVIEW:
        setCurrentStep(STEPS.PROFILE);
        break;
    }
  };

  // Handle input changes
  const handleInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleLinkChange = (index: number, value: string) => {
    setProfileLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, url: value } : link
    ));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to design your business card</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/login"} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4" data-testid="card-designer-content">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            {Object.values(STEPS).map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === step ? 'bg-emerald-500 text-white' : 
                  Object.values(STEPS).indexOf(currentStep) > index ? 'bg-emerald-200 text-emerald-800' : 
                  'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index < Object.values(STEPS).length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    Object.values(STEPS).indexOf(currentStep) > index ? 'bg-emerald-200' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {Object.values(STEPS).indexOf(currentStep) + 1} of {Object.values(STEPS).length}
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {currentStep === STEPS.TEMPLATE && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Template</CardTitle>
              <CardDescription>Select a professional template for your metal business card</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableTemplates.map((template) => (
                  <div key={template.id} className="relative">
                    <TemplateCard
                      template={template}
                      actionButton={
                        <Button
                          variant={selectedTemplateId === template.id ? "default" : "outline"}
                          className="w-full"
                          onClick={() => setSelectedTemplateId(template.id)}
                        >
                          {selectedTemplateId === template.id ? "Selected" : "Select Template"}
                        </Button>
                      }
                    />
                    {selectedTemplateId === template.id && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={nextStep} disabled={!selectedTemplateId}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Customer Information */}
        {currentStep === STEPS.INFO && (
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Enter your business card details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={customerInfo.fullName}
                    onChange={(e) => handleInfoChange('fullName', e.target.value)}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={customerInfo.jobTitle}
                    onChange={(e) => handleInfoChange('jobTitle', e.target.value)}
                    placeholder="Senior Developer"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInfoChange('email', e.target.value)}
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={customerInfo.phoneNumber}
                    onChange={(e) => handleInfoChange('phoneNumber', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={customerInfo.company}
                    onChange={(e) => handleInfoChange('company', e.target.value)}
                    placeholder="Tech Company Inc."
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={customerInfo.website}
                    onChange={(e) => handleInfoChange('website', e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => handleInfoChange('address', e.target.value)}
                  placeholder="123 Business St, City, State 12345"
                  rows={3}
                />
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={nextStep} disabled={!customerInfo.fullName || !customerInfo.email}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Card Type Selection */}
        {currentStep === STEPS.CARD_TYPE && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Card Type</CardTitle>
              <CardDescription>Select your preferred metal card finish and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedCardType} onValueChange={setSelectedCardType} className="space-y-4">
                {cardTypes.map((cardType) => (
                  <div key={cardType.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={cardType.id} id={cardType.id} />
                    <div className="flex-1">
                      <Label htmlFor={cardType.id} className="font-semibold cursor-pointer">
                        {cardType.name} - ${cardType.price}/card
                      </Label>
                      <p className="text-sm text-gray-600">{cardType.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={nextStep}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Digital Profile Setup */}
        {currentStep === STEPS.PROFILE && (
          <Card>
            <CardHeader>
              <CardTitle>Digital Profile Links</CardTitle>
              <CardDescription>Add links that will be accessible via QR code on your card</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileLinks.map((link, index) => (
                <div key={index}>
                  <Label htmlFor={`link-${index}`}>{link.platform}</Label>
                  <Input
                    id={`link-${index}`}
                    value={link.url}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder={`https://${link.platform.toLowerCase()}.com/profile`}
                  />
                </div>
              ))}
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button onClick={nextStep} disabled={isCreatingProfile}>
                  {isCreatingProfile ? "Creating Profile..." : "Create Digital Profile & QR Code"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Final Preview */}
        {currentStep === STEPS.PREVIEW && (
          <Card>
            <CardHeader>
              <CardTitle>Your Business Card Preview</CardTitle>
              <CardDescription>
                Here's how your finished {cardTypes.find(ct => ct.id === selectedCardType)?.name} card will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Front Side */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Front Side</h3>
                  <SVGCardPreview
                    templateId={selectedTemplateId}
                    side="front"
                    showBothSides={false}
                    profileData={{
                      fullName: customerInfo.fullName,
                      jobTitle: customerInfo.jobTitle,
                      email: customerInfo.email,
                      phoneNumber: customerInfo.phoneNumber,
                      address: customerInfo.address,
                    }}
                    className="mx-auto max-w-[400px]"
                  />
                </div>
                
                {/* Back Side with QR Code */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Back Side (QR Code)</h3>
                  <SVGCardPreview
                    templateId={selectedTemplateId}
                    side="back"
                    showBothSides={false}
                    profileData={{
                      fullName: customerInfo.fullName,
                      jobTitle: customerInfo.jobTitle,
                      email: customerInfo.email,
                      phoneNumber: customerInfo.phoneNumber,
                      address: customerInfo.address,
                    }}
                    className="mx-auto max-w-[400px]"
                  />
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="flex justify-between items-center">
                  <span>{cardTypes.find(ct => ct.id === selectedCardType)?.name}</span>
                  <span className="font-semibold">${cardTypes.find(ct => ct.id === selectedCardType)?.price}/card</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  QR code links to your digital profile with all contact information and links
                </p>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevStep}>
                  Edit Profile
                </Button>
                <Button onClick={() => setLocation('/order')} className="bg-emerald-500 hover:bg-emerald-600">
                  Order This Card
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CardDesigner;