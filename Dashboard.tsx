import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightIcon, BarChart2, Download, Edit, Eye, QrCode, Share2, UserIcon } from "lucide-react";
import CardTemplate from "@/components/CardTemplate";
import QRCode from "@/components/QRCode";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTabs, setActiveTabs] = useState({
    main: "overview",
    cardSection: "front",
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isAuthenticated,
  });

  const { data: cardData, isLoading: cardLoading } = useQuery({
    queryKey: ["/api/cards"],
    enabled: isAuthenticated,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/visits"],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const handleShareProfile = async () => {
    if (profileData?.profile?.id) {
      const host = window.location.host;
      const protocol = window.location.protocol;
      const shareUrl = `${protocol}//${host}/p/${profileData.profile.id}`;
      
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Your profile link has been copied to clipboard.",
        });
      } catch (err) {
        toast({
          title: "Couldn't copy link",
          description: "Please copy this URL manually: " + shareUrl,
        });
      }
    }
  };

  if (authLoading || profileLoading || cardLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-10 w-[250px] mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[200px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Check if profile is complete
  const isProfileComplete = profileData?.profile?.fullName && 
                           profileData?.profile?.jobTitle && 
                           profileData?.profile?.phoneNumber;

  // Check if card is created
  const isCardCreated = !!cardData;
  
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Manage your digital profile and business card</p>

        <Tabs value={activeTabs.main} onValueChange={(val) => setActiveTabs({...activeTabs, main: val})}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="card">My Card</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <UserIcon className="mr-2 h-5 w-5 text-primary" />
                    Profile Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Completion status</div>
                      <div className="font-medium text-lg">
                        {isProfileComplete ? "Complete" : "Incomplete"}
                      </div>
                    </div>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isProfileComplete ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                      {isProfileComplete ? (
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full">
                      {isProfileComplete ? "Edit Profile" : "Complete Profile"}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <QrCode className="mr-2 h-5 w-5 text-primary" />
                    Card Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Creation status</div>
                      <div className="font-medium text-lg">
                        {isCardCreated ? "Created" : "Not Created"}
                      </div>
                    </div>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isCardCreated ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                      {isCardCreated ? (
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href="/design">
                    <Button variant="outline" className="w-full">
                      {isCardCreated ? "Edit Card" : "Create Card"}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <BarChart2 className="mr-2 h-5 w-5 text-primary" />
                    Profile Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Total views</div>
                      <div className="font-medium text-lg">
                        {statsLoading ? 'Loading...' : (statsData?.totalVisits || 0)}
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                      <Eye className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTabs({...activeTabs, main: "analytics"})}>
                    View Analytics
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {isProfileComplete && isCardCreated && (
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Business Card</CardTitle>
                    <CardDescription>
                      Preview your business card and share your digital profile.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-8 justify-center md:justify-between items-center">
                      <div className="w-full max-w-sm mx-auto md:mx-0">
                        <Tabs value={activeTabs.cardSection} onValueChange={(val) => setActiveTabs({...activeTabs, cardSection: val})}>
                          <TabsList className="mb-4 w-full">
                            <TabsTrigger value="front" className="flex-1">Front</TabsTrigger>
                            <TabsTrigger value="back" className="flex-1">Back with QR</TabsTrigger>
                          </TabsList>

                          <TabsContent value="front">
                            {cardData && (
                              <CardTemplate 
                                template={{
                                  id: cardData.templateId,
                                  name: "Your Card",
                                  layout: (cardData.customizations?.layout || "standard") as any,
                                  backgroundColor: cardData.customizations?.backgroundColor,
                                  textColor: cardData.customizations?.textColor,
                                  backgroundImageUrl: cardData.customizations?.backgroundImageUrl,
                                  overlayColor: cardData.customizations?.overlayColor,
                                  overlayOpacity: cardData.customizations?.overlayOpacity,
                                  category: "Custom",
                                  description: "",
                                  previewImageUrl: ""
                                }}
                                profileData={{
                                  fullName: profileData?.profile?.fullName,
                                  jobTitle: profileData?.profile?.jobTitle,
                                  email: profileData?.profile?.email,
                                  phoneNumber: profileData?.profile?.phoneNumber,
                                  address: profileData?.profile?.address,
                                  customPhotoUrl: profileData?.profile?.customPhotoUrl,
                                  logoUrl: profileData?.profile?.logoUrl,
                                }}
                                className="mx-auto"
                              />
                            )}
                          </TabsContent>

                          <TabsContent value="back">
                            <div className="bg-white border rounded-lg shadow-sm flex items-center justify-center" style={{aspectRatio: "1.6", maxWidth: "450px"}}>
                              <div className="text-center">
                                <div className="mb-3 text-gray-600 text-sm">Scan to view digital profile</div>
                                {cardData?.qrCodeUrl ? (
                                  <img 
                                    src={cardData.qrCodeUrl} 
                                    alt="QR Code" 
                                    className="mx-auto w-40 h-40"
                                  />
                                ) : (
                                  <QRCode 
                                    value={`${window.location.origin}/p/${profileData?.profile?.id}`}
                                    size={160}
                                    color="#3B82F6"
                                    backgroundColor="#ffffff"
                                    className="mx-auto"
                                  />
                                )}
                                {profileData?.profile?.fullName && (
                                  <div className="mt-3 font-medium text-gray-700">{profileData.profile.fullName}</div>
                                )}
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      <div className="flex-1 min-w-[300px] space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Share Your Digital Profile</h3>
                          <p className="text-gray-500 text-sm mb-4">
                            Your digital profile is available at the link below. Share it directly or through your QR code.
                          </p>
                          <div className="flex gap-3 flex-wrap">
                            <Button onClick={handleShareProfile}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Copy Profile Link
                            </Button>
                            <Link href={`/p/${profileData?.profile?.id}`}>
                              <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                            </Link>
                            <Button variant="outline" onClick={() => setLocation("/profile?tab=share")}>
                              <QrCode className="h-4 w-4 mr-2" />
                              Get QR Code
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Print or Download</h3>
                          <p className="text-gray-500 text-sm mb-4">
                            Download your business card for printing or sharing digitally.
                          </p>
                          <div className="flex gap-3 flex-wrap">
                            <Button variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download PDF
                            </Button>
                            <Link href="/design">
                              <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Card
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Your Digital Profile</CardTitle>
                <CardDescription>
                  View and manage your digital profile information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Profile Information</h3>
                    {profileData?.profile ? (
                      <div className="space-y-4">
                        <div className="flex items-center">
                          {profileData.profile.customPhotoUrl ? (
                            <img 
                              src={profileData.profile.customPhotoUrl} 
                              alt={profileData.profile.fullName} 
                              className="h-16 w-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="ml-4">
                            <h4 className="font-medium">{profileData.profile.fullName || "No name provided"}</h4>
                            <p className="text-gray-500">{profileData.profile.jobTitle || "No title provided"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <div className="text-sm text-gray-500">Email</div>
                            <div>{profileData.profile.email || "Not provided"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div>{profileData.profile.phoneNumber || "Not provided"}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Address</div>
                            <div>{profileData.profile.address || "Not provided"}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">No profile information available. Please create your profile.</div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Links</h3>
                    {profileData?.links && profileData.links.length > 0 ? (
                      <div className="space-y-2">
                        {profileData.links.map((link: any) => (
                          <div key={link.id} className="p-3 bg-gray-50 rounded-md flex items-center">
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">{link.linkType}</div>
                              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                {link.url}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">No links added. Add links to your profile to showcase your online presence.</div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Link href="/profile">
                  <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="card">
            <Card>
              <CardHeader>
                <CardTitle>Your Business Card</CardTitle>
                <CardDescription>
                  Preview and manage your business card design.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cardData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Card Preview</h3>
                      <Tabs defaultValue="front">
                        <TabsList className="w-full mb-4">
                          <TabsTrigger value="front" className="flex-1">Front</TabsTrigger>
                          <TabsTrigger value="back" className="flex-1">Back (QR)</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="front">
                          <CardTemplate 
                            template={{
                              id: cardData.templateId,
                              name: "Your Card",
                              layout: (cardData.customizations?.layout || "standard") as any,
                              backgroundColor: cardData.customizations?.backgroundColor,
                              textColor: cardData.customizations?.textColor,
                              backgroundImageUrl: cardData.customizations?.backgroundImageUrl,
                              overlayColor: cardData.customizations?.overlayColor,
                              overlayOpacity: cardData.customizations?.overlayOpacity,
                              category: "Custom",
                              description: "",
                              previewImageUrl: ""
                            }}
                            profileData={{
                              fullName: profileData?.profile?.fullName,
                              jobTitle: profileData?.profile?.jobTitle,
                              email: profileData?.profile?.email,
                              phoneNumber: profileData?.profile?.phoneNumber,
                              address: profileData?.profile?.address,
                              customPhotoUrl: profileData?.profile?.customPhotoUrl,
                              logoUrl: profileData?.profile?.logoUrl,
                            }}
                            className="mx-auto"
                          />
                        </TabsContent>
                        
                        <TabsContent value="back">
                          <div className="bg-white border rounded-lg shadow-sm flex items-center justify-center" style={{aspectRatio: "1.6", maxWidth: "450px"}}>
                            <div className="text-center">
                              <div className="mb-3 text-gray-600 text-sm">Scan to view digital profile</div>
                              {cardData.qrCodeUrl ? (
                                <img 
                                  src={cardData.qrCodeUrl} 
                                  alt="QR Code" 
                                  className="mx-auto w-40 h-40"
                                />
                              ) : (
                                <QRCode 
                                  value={`${window.location.origin}/p/${profileData?.profile?.id}`}
                                  size={160}
                                  color="#3B82F6"
                                  backgroundColor="#ffffff"
                                  className="mx-auto"
                                />
                              )}
                              {profileData?.profile?.fullName && (
                                <div className="mt-3 font-medium text-gray-700">{profileData.profile.fullName}</div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Card Information</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-500">Template ID</div>
                          <div className="font-medium">{cardData.templateId}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500">Layout</div>
                          <div className="font-medium capitalize">{cardData.customizations?.layout || "Standard"}</div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500">Colors</div>
                          <div className="flex items-center space-x-2">
                            {cardData.customizations?.backgroundColor && (
                              <div 
                                className="h-5 w-5 rounded-full border"
                                style={{ backgroundColor: cardData.customizations.backgroundColor }}
                                title="Background color"
                              ></div>
                            )}
                            {cardData.customizations?.textColor && (
                              <div 
                                className="h-5 w-5 rounded-full border"
                                style={{ backgroundColor: cardData.customizations.textColor }}
                                title="Text color"
                              ></div>
                            )}
                            <div className="text-sm">
                              {cardData.customizations?.backgroundColor || cardData.customizations?.textColor ? 
                                "Custom colors" : "Default colors"}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-500">QR Code</div>
                          <div className="font-medium">
                            {cardData.qrCodeUrl ? "Generated" : "Not generated"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-medium">Card Actions</h3>
                        <div className="flex flex-wrap gap-3">
                          <Link href="/design">
                            <Button>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Card
                            </Button>
                          </Link>
                          <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <QrCode className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No business card created yet</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto mb-6">
                      You haven't created a business card yet. Create your first card to generate a QR code for your digital profile.
                    </p>
                    <Link href="/design">
                      <Button>Create Your Business Card</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Profile Analytics</CardTitle>
                <CardDescription>
                  Track views and engagement with your digital profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[200px] w-full" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                ) : statsData?.totalVisits > 0 ? (
                  <div>
                    <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center mb-6">
                      <div className="text-5xl font-bold text-primary mb-2">{statsData.totalVisits}</div>
                      <div className="text-gray-500">Total Profile Views</div>
                    </div>
                    
                    {statsData.visits && statsData.visits.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Recent Visits</h3>
                        <div className="overflow-hidden rounded-lg border">
                          <table className="min-w-full divide-y">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y">
                              {statsData.visits.slice(0, 5).map((visit: any) => (
                                <tr key={visit.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(visit.timestamp).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {visit.userAgent ? 
                                      (visit.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop') 
                                      : 'Unknown'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No profile views yet</h3>
                    <p className="mt-2 text-gray-500 max-w-md mx-auto mb-6">
                      Your digital profile hasn't been viewed yet. Share your profile link or business card with QR code to start tracking views.
                    </p>
                    <Button onClick={handleShareProfile}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Profile Link
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
