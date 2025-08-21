import { Mail, MapPin, Phone, ExternalLink, Building } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileData {
  fullName?: string;
  jobTitle?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  customPhotoUrl?: string;
  logoUrl?: string;
  bannerLogoUrl?: string;
}

interface Link {
  linkType: string;
  url: string;
}

interface ProfileLayoutProps {
  profile: ProfileData;
  links: Link[];
  layout: 'classic' | 'modern' | 'minimal' | 'creative' | 'corporate';
}

function formatUrl(url: string) {
  if (!url) return '';
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

// Classic Layout - Traditional business card style
const ClassicLayout = ({ profile, links }: { profile: ProfileData; links: Link[] }) => (
  <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen">
    <div className="flex-grow flex flex-col items-center">
      <div className="w-full max-w-md px-4 mt-10 mb-8">
        {/* Header with gradient and optional company logo banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-40 rounded-t-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 rounded-t-2xl"></div>
          {/* Company Logo Banner */}
          {profile.bannerLogoUrl && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={profile.bannerLogoUrl}
                alt="Company Logo"
                className="max-h-24 max-w-32 object-contain filter brightness-110 drop-shadow-lg"
              />
            </div>
          )}
        </div>
        
        {/* Main content card */}
        <div className="bg-white p-6 rounded-b-2xl shadow-lg relative">
          {/* Profile photo */}
          <div className="absolute left-0 right-0 flex justify-center" style={{ top: "-40px" }}>
            {profile.customPhotoUrl ? (
              <img
                src={profile.customPhotoUrl}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-100 border-4 border-white shadow-lg flex items-center justify-center">
                <Building className="w-12 h-12 text-blue-600" />
              </div>
            )}
          </div>

          {/* Profile info */}
          <div className="mt-16 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.fullName}</h1>
            {profile.jobTitle && (
              <p className="text-lg text-blue-600 font-medium mb-6">{profile.jobTitle}</p>
            )}

            {/* Contact information */}
            <div className="space-y-4 text-left">
              {profile.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <a href={`mailto:${profile.email}`} className="text-gray-700 hover:text-blue-600">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <a href={`tel:${profile.phoneNumber}`} className="text-gray-700 hover:text-blue-600">
                    {profile.phoneNumber}
                  </a>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{profile.address}</span>
                </div>
              )}
            </div>

            {/* Links */}
            {links.length > 0 && (
              <div className="mt-6 space-y-2">
                {links.map((link, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-between border-blue-200 hover:bg-blue-50"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <span>{link.linkType}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modern Layout - Clean and contemporary
const ModernLayout = ({ profile, links }: { profile: ProfileData; links: Link[] }) => (
  <div className="bg-gray-50 min-h-screen">
    <div className="flex-grow flex flex-col items-center">
      <div className="w-full max-w-lg px-4 mt-8 mb-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header section with optional banner logo */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center relative overflow-hidden">
            {/* Company Logo Banner */}
            {profile.bannerLogoUrl && (
              <div className="absolute top-4 right-4">
                <img
                  src={profile.bannerLogoUrl}
                  alt="Company Logo"
                  className="max-h-16 max-w-20 object-contain filter brightness-110 drop-shadow-lg"
                />
              </div>
            )}
            {profile.customPhotoUrl ? (
              <img
                src={profile.customPhotoUrl}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 border-3 border-white/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/20 mx-auto mb-4 flex items-center justify-center">
                <Building className="w-10 h-10 text-white" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-white mb-1">{profile.fullName}</h1>
            {profile.jobTitle && (
              <p className="text-white/90 text-lg">{profile.jobTitle}</p>
            )}
          </div>

          {/* Content section */}
          <div className="p-8">
            {/* Contact grid */}
            <div className="grid gap-4 mb-6">
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Mail className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">{profile.email}</span>
                </a>
              )}
              {profile.phoneNumber && (
                <a href={`tel:${profile.phoneNumber}`} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Phone className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">{profile.phoneNumber}</span>
                </a>
              )}
              {profile.address && (
                <div className="flex items-center p-4 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">{profile.address}</span>
                </div>
              )}
            </div>

            {/* Links */}
            {links.length > 0 && (
              <div className="space-y-3">
                {links.map((link, index) => (
                  <Button
                    key={index}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl h-12"
                    asChild
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.linkType}
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Minimal Layout - Clean and simple
const MinimalLayout = ({ profile, links }: { profile: ProfileData; links: Link[] }) => (
  <div className="bg-white min-h-screen">
    <div className="flex-grow flex flex-col items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="text-center space-y-6">
          {/* Profile photo */}
          {profile.customPhotoUrl ? (
            <img
              src={profile.customPhotoUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover mx-auto border border-gray-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 mx-auto flex items-center justify-center border border-gray-200">
              <Building className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Name and title */}
          <div>
            <h1 className="text-3xl font-light text-gray-900 mb-2">{profile.fullName}</h1>
            {profile.jobTitle && (
              <p className="text-gray-600 text-lg">{profile.jobTitle}</p>
            )}
          </div>

          {/* Contact info - minimal style */}
          <div className="space-y-3 text-gray-700">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="block hover:text-gray-900 transition-colors">
                {profile.email}
              </a>
            )}
            {profile.phoneNumber && (
              <a href={`tel:${profile.phoneNumber}`} className="block hover:text-gray-900 transition-colors">
                {profile.phoneNumber}
              </a>
            )}
            {profile.address && (
              <p className="text-gray-600">{profile.address}</p>
            )}
          </div>

          {/* Links - minimal buttons */}
          {links.length > 0 && (
            <div className="space-y-2 pt-4">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  {link.linkType}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Creative Layout - Bold and artistic
const CreativeLayout = ({ profile, links }: { profile: ProfileData; links: Link[] }) => (
  <div className="bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 min-h-screen">
    <div className="flex-grow flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          {/* Artistic header */}
          <div className="text-center mb-8">
            {profile.customPhotoUrl ? (
              <div className="relative inline-block">
                <img
                  src={profile.customPhotoUrl}
                  alt="Profile"
                  className="w-28 h-28 rounded-3xl object-cover"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl -z-10"></div>
              </div>
            ) : (
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-3xl bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center">
                  <Building className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mt-4 mb-2">
              {profile.fullName}
            </h1>
            {profile.jobTitle && (
              <p className="text-xl text-gray-700 font-medium">{profile.jobTitle}</p>
            )}
          </div>

          {/* Contact cards */}
          <div className="space-y-4 mb-6">
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl hover:from-orange-100 hover:to-pink-100 transition-all">
                <Mail className="w-5 h-5 text-orange-600 mr-3" />
                <span className="text-gray-700">{profile.email}</span>
              </a>
            )}
            {profile.phoneNumber && (
              <a href={`tel:${profile.phoneNumber}`} className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl hover:from-orange-100 hover:to-pink-100 transition-all">
                <Phone className="w-5 h-5 text-orange-600 mr-3" />
                <span className="text-gray-700">{profile.phoneNumber}</span>
              </a>
            )}
            {profile.address && (
              <div className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl">
                <MapPin className="w-5 h-5 text-orange-600 mr-3" />
                <span className="text-gray-700">{profile.address}</span>
              </div>
            )}
          </div>

          {/* Creative links */}
          {links.length > 0 && (
            <div className="space-y-3">
              {links.map((link, index) => (
                <Button
                  key={index}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl h-12 font-medium"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.linkType}
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Corporate Layout - Professional and formal
const CorporateLayout = ({ profile, links }: { profile: ProfileData; links: Link[] }) => (
  <div className="bg-gray-100 min-h-screen">
    <div className="flex-grow flex flex-col items-center">
      <div className="w-full max-w-2xl px-6 mt-8 mb-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Corporate header */}
          <div className="bg-gray-900 text-white p-8">
            <div className="flex items-center space-x-6">
              {profile.customPhotoUrl ? (
                <img
                  src={profile.customPhotoUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-700 flex items-center justify-center border-2 border-gray-600">
                  <Building className="w-10 h-10 text-gray-300" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile.fullName}</h1>
                {profile.jobTitle && (
                  <p className="text-xl text-gray-300">{profile.jobTitle}</p>
                )}
                {profile.logoUrl && (
                  <img
                    src={profile.logoUrl}
                    alt="Company Logo"
                    className="w-16 h-16 object-contain mt-3 bg-white rounded p-1"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Corporate content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {profile.email && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <a href={`mailto:${profile.email}`} className="text-gray-700 hover:text-gray-900">
                        {profile.email}
                      </a>
                    </div>
                  )}
                  {profile.phoneNumber && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <a href={`tel:${profile.phoneNumber}`} className="text-gray-700 hover:text-gray-900">
                        {profile.phoneNumber}
                      </a>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{profile.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Links section */}
              {links.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Links</h3>
                  <div className="space-y-2">
                    {links.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start border-gray-300 hover:bg-gray-50"
                        asChild
                      >
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {link.linkType}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main component that renders the appropriate layout
const ProfileLayouts = ({ profile, links, layout }: ProfileLayoutProps) => {
  switch (layout) {
    case 'modern':
      return <ModernLayout profile={profile} links={links} />;
    case 'minimal':
      return <MinimalLayout profile={profile} links={links} />;
    case 'creative':
      return <CreativeLayout profile={profile} links={links} />;
    case 'corporate':
      return <CorporateLayout profile={profile} links={links} />;
    case 'classic':
    default:
      return <ClassicLayout profile={profile} links={links} />;
  }
};

export default ProfileLayouts;