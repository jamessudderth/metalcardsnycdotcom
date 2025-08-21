/**
 * VCard utility functions for generating and downloading contact cards
 */

export interface VCardData {
  fullName: string;
  jobTitle?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  website?: string;
  profileUrl?: string;
  companyName?: string;
  logoUrl?: string;
  customPhotoUrl?: string;
  qrCodeUrl?: string;
}

/**
 * Generate VCard content with QR code attachment
 */
export function generateVCard(data: VCardData): string {
  const {
    fullName,
    jobTitle,
    email,
    phoneNumber,
    address,
    website,
    profileUrl,
    companyName,
    logoUrl,
    customPhotoUrl,
    qrCodeUrl
  } = data;

  let vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${fullName}`;

  // Add job title if available
  if (jobTitle) {
    vCardContent += `\nTITLE:${jobTitle}`;
  }

  // Add organization if available
  if (companyName) {
    vCardContent += `\nORG:${companyName}`;
  }

  // Add contact information
  if (email) {
    vCardContent += `\nEMAIL:${email}`;
  }

  if (phoneNumber) {
    vCardContent += `\nTEL:${phoneNumber}`;
  }

  if (address) {
    vCardContent += `\nADR:;;${address};;;`;
  }

  // Add website or profile URL
  if (website) {
    vCardContent += `\nURL:${website}`;
  } else if (profileUrl) {
    vCardContent += `\nURL:${profileUrl}`;
  }

  // Add profile image if available
  if (customPhotoUrl) {
    vCardContent += `\nPHOTO:${customPhotoUrl}`;
  }

  // Add company logo if available
  if (logoUrl) {
    vCardContent += `\nLOGO:${logoUrl}`;
  }

  // Add QR code as an attachment
  if (qrCodeUrl) {
    vCardContent += `\nATTACH:${qrCodeUrl}`;
  }

  // Add custom fields for digital profile
  if (profileUrl) {
    vCardContent += `\nX-DIGITAL-PROFILE:${profileUrl}`;
  }

  // Add note about Metal Cards NYC
  vCardContent += `\nNOTE:Digital business card powered by Metal Cards NYC`;

  vCardContent += `\nEND:VCARD`;

  return vCardContent;
}

/**
 * Download VCard file
 */
export function downloadVCard(vCardContent: string, filename: string): void {
  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.vcf`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Generate VCard with QR code for profile data
 */
export function generateProfileVCard(profileData: any): string {
  const profile = profileData.profile;
  const links = profileData.links || [];
  
  // Find website from links
  const websiteLink = links.find((link: any) => link.linkType === 'website');
  
  const vCardData: VCardData = {
    fullName: profile.fullName || 'Unknown',
    jobTitle: profile.jobTitle,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    address: profile.address,
    website: websiteLink?.url,
    profileUrl: `${window.location.origin}/p/${profile.id}`,
    companyName: profile.companyName,
    logoUrl: profile.logoUrl,
    customPhotoUrl: profile.customPhotoUrl,
    qrCodeUrl: generateQRCodeUrl(profile.id)
  };

  return generateVCard(vCardData);
}

/**
 * Generate QR code URL for profile
 */
function generateQRCodeUrl(profileId: number): string {
  const profileUrl = `${window.location.origin}/p/${profileId}`;
  return `/api/qrcode?data=${encodeURIComponent(profileUrl)}&size=200`;
}

/**
 * Generate VCard QR code that contains the VCard data itself
 */
export function generateVCardQRCode(vCardContent: string): string {
  return `/api/qrcode?data=${encodeURIComponent(vCardContent)}&size=200`;
}

/**
 * Download VCard from profile data
 */
export function downloadProfileVCard(profileData: any): void {
  const vCardContent = generateProfileVCard(profileData);
  const filename = profileData.profile.fullName || 'contact';
  downloadVCard(vCardContent, filename);
}