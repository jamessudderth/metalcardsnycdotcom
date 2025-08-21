import { useMemo } from "react";
import { CardTemplate as CardTemplateType } from "@/lib/card-templates";

interface CardTemplateProps {
  template: CardTemplateType;
  profileData?: {
    fullName?: string;
    jobTitle?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    customPhotoUrl?: string;
    logoUrl?: string;
  };
  qrCodeUrl?: string;
  className?: string;
}

const CardTemplate = ({ 
  template, 
  profileData = {}, 
  qrCodeUrl,
  className = ""
}: CardTemplateProps) => {
  const {
    fullName = "Your Name",
    jobTitle = "Your Title",
    email = "email@example.com",
    phoneNumber = "(123) 456-7890",
    address = "123 Business Street, City, State",
    customPhotoUrl,
    logoUrl
  } = profileData;

  // Apply template-specific styling
  const containerStyle = useMemo(() => {
    const baseStyle = "relative shadow-lg rounded-md overflow-hidden";
    
    return `${baseStyle} ${className}`;
  }, [className]);

  // For placeholder text
  const placeholderClasses = "opacity-80";

  return (
    <div className={containerStyle} style={{ 
      aspectRatio: "1.6", 
      maxWidth: "450px", 
      width: "100%",
      backgroundColor: template.backgroundColor || "#000000",
      color: template.textColor || "#ffffff"
    }}>
      <div className="absolute inset-0 overflow-hidden" 
        style={{ 
          backgroundImage: template.backgroundImageUrl ? `url(${template.backgroundImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Apply overlay if template specifies */}
        {template.overlayColor && (
          <div className="absolute inset-0" 
            style={{ 
              backgroundColor: template.overlayColor,
              opacity: template.overlayOpacity || 0.2
            }}
          ></div>
        )}
      </div>

      {/* Template Content based on layout */}
      <div className="relative h-full w-full p-4">
        {template.layout === "standard" && (
          <div className="flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-12 max-w-[120px] object-contain" />
              ) : (
                <div className={`h-12 w-32 bg-gray-700 rounded flex items-center justify-center ${placeholderClasses} text-white`}>
                  Logo
                </div>
              )}
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="h-16 w-16" />
              )}
            </div>
            
            <div className="mt-4">
              <h2 className="text-xl font-bold">{fullName}</h2>
              <p className="text-sm">{jobTitle}</p>
              
              <div className="mt-4 text-sm space-y-1">
                <p>{email}</p>
                <p>{phoneNumber}</p>
                <p className="text-xs">{address}</p>
              </div>
            </div>
          </div>
        )}

        {template.layout === "modern" && (
          <div className="grid grid-cols-12 h-full gap-4">
            <div className="col-span-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="text-sm">{jobTitle}</p>
              
              <div className="mt-4 text-sm space-y-1">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  {email}
                </p>
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  {phoneNumber}
                </p>
                <p className="flex items-center text-xs">
                  <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {address}
                </p>
              </div>

              {logoUrl && (
                <div className="mt-4">
                  <img src={logoUrl} alt="Company Logo" className="h-8 max-w-[100px] object-contain" />
                </div>
              )}
            </div>
            
            <div className="col-span-4 flex flex-col items-center justify-center">
              {customPhotoUrl ? (
                <img src={customPhotoUrl} alt={fullName} className="w-20 h-20 rounded-full object-cover mb-4" />
              ) : (
                <div className={`w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center mb-4 ${placeholderClasses} text-white`}>
                  Photo
                </div>
              )}
              
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="h-16 w-16" />
              )}
            </div>
          </div>
        )}

        {template.layout === "minimal" && (
          <div className="flex flex-col h-full justify-center items-center text-center">
            {logoUrl && (
              <img src={logoUrl} alt="Company Logo" className="h-12 max-w-[120px] object-contain mb-4" />
            )}
            
            <h2 className="text-2xl font-bold">{fullName}</h2>
            <p className="text-sm mb-4">{jobTitle}</p>
            
            <div className="w-16 h-1 bg-current mb-4"></div>
            
            <div className="text-sm space-y-1">
              <p>{email}</p>
              <p>{phoneNumber}</p>
              <p className="text-xs">{address}</p>
            </div>
            
            {qrCodeUrl && (
              <div className="mt-4">
                <img src={qrCodeUrl} alt="QR Code" className="h-16 w-16 mx-auto" />
              </div>
            )}
          </div>
        )}

        {template.layout === "creative" && (
          <div className="grid grid-cols-2 h-full">
            <div className="flex flex-col justify-between p-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-10 max-w-[100px] object-contain" />
              ) : (
                <div className={`h-10 w-24 bg-gray-700 rounded flex items-center justify-center ${placeholderClasses} text-white`}>
                  Logo
                </div>
              )}
              
              <div>
                <h2 className="text-2xl font-bold">{fullName}</h2>
                <p className="text-sm">{jobTitle}</p>
              </div>
            </div>
            
            <div className="flex flex-col justify-between items-end p-4">
              <div className="text-right text-sm space-y-1">
                <p>{email}</p>
                <p>{phoneNumber}</p>
                <p className="text-xs">{address}</p>
              </div>
              
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="h-16 w-16" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardTemplate;
