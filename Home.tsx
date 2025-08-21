import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { User, LayoutDashboard, Scan, LayoutTemplate } from "lucide-react";
import heroImage from "@assets/Photoroom_20250714_061541_1752488431825.png";
import qrCodeImage from "@assets/IMG_0077_1752489033259.jpeg";
import template1Front from "@assets/1_1752817011179.png";
import template1Back from "@assets/2_1752817011179.png";
import logoImage from "@assets/metal cards logo-Photoroom_1752813838563.png";
import logoImage2 from "@assets/metal cards logo-Photoroom_1752760687931.png";
import logoImage3 from "@assets/metal cards logo-Photoroom_1752813990798.png";
import newLogoImage from "@assets/metal cards logo-Photoroom_1755292314652.png";
import CardTemplate from "@/components/CardTemplate";
import { TemplatePreview } from "@/components/TemplatePreview";
import { useTemplates, templateToCardTemplate } from "@/hooks/useTemplates";
import { cardTemplates } from "@/lib/card-templates";

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  // Fetch templates from database for homepage
  const { data: dbTemplates } = useTemplates();
  
  // Use only your new SVG templates from the database
  const activeTemplates = dbTemplates?.filter(t => t.isActive).map(templateToCardTemplate) || [];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32 lg:w-full">
            <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:flex lg:gap-8 lg:items-center">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 lg:py-10">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                      <span className="block text-emerald xl:inline">Metal Cards NYC</span>
                      <span className="block gold-foil xl:inline"> Premium Business Cards</span>
                    </h1>
                    <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      Premium metal business cards with integrated digital profiles. Each card features a custom QR code that connects to your personalized digital presence, combining the luxury of metal with modern digital networking.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 lg:justify-start">
                      <div>
                        {isAuthenticated ? (
                          <Link href="/profile">
                            <Button size="lg" className="gold-button w-full md:w-auto">
                              Go to profile
                            </Button>
                          </Link>
                        ) : (
                          <Button size="lg" className="gold-button w-full md:w-auto" onClick={() => window.location.href = "/login"}>
                            Order Metal Cards
                          </Button>
                        )}
                      </div>
                      <div>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="w-full md:w-auto border-emerald text-emerald hover:bg-emerald hover:text-white"
                          onClick={() => {
                            const element = document.getElementById('features');
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Learn more
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-12 relative lg:mt-0">
                    <img 
                      className="w-4/5 mx-auto rounded-lg shadow-2xl border border-emerald/20 hover:border-gold/50 transition-all duration-300 hover:scale-105" 
                      src={heroImage} 
                      alt="Precision laser engraving metal business card manufacturing process" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="features" className="border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-emerald uppercase tracking-wide">How It Works</h2>
            <p className="mt-1 text-3xl font-bold sm:text-4xl sm:tracking-tight">Premium Metal Cards with Digital Integration</p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-muted-foreground">Get your premium metal business cards with built-in digital profiles in just a few simple steps.</p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-card rounded-lg p-6 text-center shadow-lg border border-border">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <User className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium">1. Order Your Metal Cards</h3>
                <p className="mt-2 text-base text-muted-foreground">Choose your metal type, design style, and quantity. Upload your logo and provide your contact details for a custom quote.</p>
              </div>

              <div className="bg-card rounded-lg p-6 text-center shadow-lg border border-border">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <LayoutTemplate className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium">2. Create Your Digital Profile</h3>
                <p className="mt-2 text-base text-muted-foreground">Set up your personalized digital profile with your professional information, links, and preferred template style.</p>
              </div>

              <div className="bg-card rounded-lg p-6 text-center shadow-lg border border-border">
                <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Scan className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-medium">3. Receive Complete Solution</h3>
                <p className="mt-2 text-base text-muted-foreground">Your premium metal cards arrive with custom QR codes that instantly connect contacts to your professional digital profile.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Card Layout Templates */}
      <div className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Business Card Templates</h2>
            <p className="mt-1 text-3xl font-bold sm:text-4xl sm:tracking-tight">Professional Metal Card Designs</p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-muted-foreground">Choose from our carefully crafted business card layouts that combine premium metal craftsmanship with digital innovation.</p>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
            {activeTemplates.map((template) => (
              <div key={template.id} className="h-full">
                <TemplatePreview 
                  templateId={template.id}
                  templateName={template.name}
                  templateDescription={template.description}
                  clickable={true}
                />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center space-y-6">
            <div className="inline-flex items-center px-6 py-3 border border-primary rounded-lg bg-primary/5">
              <svg className="h-5 w-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-primary font-medium">All templates include integrated QR codes for seamless digital access</span>
            </div>
            
            <div className="bg-gradient-to-r from-emerald/10 to-gold/10 border border-emerald/20 rounded-xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-foreground mb-3">Professional Metal Business Cards</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Choose from our professionally designed templates and customize them with your business information. 
                Each card includes an integrated QR code linking to your digital profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/templates">
                  <Button size="lg" className="w-full sm:w-auto">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/order">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Order Cards
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Profile Preview */}
      <div className="py-16 border-t border-border bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Complete Solution</h2>
              <p className="mt-2 text-3xl font-bold sm:text-4xl">Metal Cards NYC - Physical Meets Digital</p>
              <p className="mt-4 text-lg text-muted-foreground">Every Metal Cards NYC business card comes with an integrated digital profile. Our complete solution features:
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Mobile responsive</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Perfect viewing experience on all devices.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Customizable</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Add your links, photo, and branding elements.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-primary-foreground">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Always up-to-date</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Update your information anytime without reprinting cards.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                {isAuthenticated ? (
                  <Link href="/profile">
                    <Button>Manage Your Digital Profile</Button>
                  </Link>
                ) : (
                  <Button onClick={() => window.location.href = "/login"}>
                    Create Your Profile
                  </Button>
                )}
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0 flex justify-center">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-xs w-full" style={{ maxWidth: "320px" }}>
                <div className="bg-primary px-4 py-6 text-center text-white">
                  <div className="relative inline-block">
                    <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white">
                      <img 
                        className="h-full w-full object-cover" 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300" 
                        alt="Profile photo" 
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full border-2 border-white">
                      <svg className="h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-bold">Sarah Johnson</h3>
                  <p className="text-blue-100">Marketing Director</p>
                </div>
                
                <div className="px-4 py-6 space-y-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-gray-400">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-sm text-gray-700">sarah.johnson@example.com</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-gray-400">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-sm text-gray-700">(555) 123-4567</div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-shrink-0 text-gray-400">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 text-sm text-gray-700">123 Business Ave, Suite 200, New York, NY 10001</div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500 mb-2">My Links</p>
                    <div className="space-y-2">
                      <a href="#" className="block py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded text-sm flex items-center text-gray-700">
                        <svg className="mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                        </svg>
                        Portfolio Website
                      </a>
                      <a href="#" className="block py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded text-sm flex items-center text-gray-700">
                        <svg className="mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                          <path fill="currentColor" d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path>
                        </svg>
                        LinkedIn Profile
                      </a>
                      <a href="#" className="block py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded text-sm flex items-center text-gray-700">
                        <svg className="mr-2 h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                          <path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                        </svg>
                        Twitter
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Feature */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="relative">
              <div className="relative lg:ml-10">
                <div className="text-center">
                  <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                    <div 
                      className="w-64 h-64 rounded-md bg-white flex items-center justify-center border-2 border-primary cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => window.location.href = '/login'}
                    >
                      <img 
                        src={qrCodeImage} 
                        alt="QR code to sign up" 
                        className="w-56 h-56 rounded object-contain" 
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Scan to create your profile</p>
                  </div>
                  <div className="mt-6 bg-white rounded-lg shadow-lg p-4 inline-block">
                    <div className="w-64 h-40 bg-white flex items-center justify-center border border-gray-200 rounded">
                      <img 
                        src="@assets/qr code to website.png" 
                        alt="Example QR code" 
                        className="w-32 h-32 rounded object-contain" 
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Example QR code for digital profile</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:col-start-1">
              <h2 className="text-base font-semibold text-primary uppercase tracking-wide">QR Technology</h2>
              <h3 className="mt-2 text-3xl font-bold">Premium Metal + Digital Experience</h3>
              <p className="mt-4 text-lg text-muted-foreground">
                Combine the luxury of Metal Cards NYC business cards with a seamless digital experience through our integrated QR code system.
              </p>
              
              <div className="mt-6 space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-white">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Instant access</h4>
                    <p className="mt-1 text-sm text-gray-500">One scan provides immediate access to your full professional profile.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-white">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Always current</h4>
                    <p className="mt-1 text-sm text-gray-500">Update your information anytime without replacing your cards.</p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary text-white">
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Track engagement</h4>
                    <p className="mt-1 text-sm text-gray-500">See how many people have viewed your profile.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
