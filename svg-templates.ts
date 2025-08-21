// SVG Templates for Business Cards - Can be dynamically filled with user data

export interface CardData {
  name?: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}

export const classicTemplateFront = (data: CardData) => `
<svg width="350" height="220" viewBox="0 0 350 220" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="350" height="220" fill="#000000"/>
  
  <!-- Left side with logo -->
  <g transform="translate(30, 30)">
    <!-- Metal Cards NYC Logo -->
    <text x="0" y="40" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#ffffff">
      Metal Cards
    </text>
    <text x="0" y="70" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" letter-spacing="2px">
      NYC
    </text>
    
    <!-- Website -->
    <text x="0" y="110" font-family="Arial, sans-serif" font-size="14" fill="#cccccc">
      ${data.website || 'Metalcardsnyc.com'}
    </text>
  </g>
  
  <!-- Vertical divider -->
  <line x1="175" y1="30" x2="175" y2="190" stroke="#333333" stroke-width="1"/>
  
  <!-- Right side with contact info -->
  <g transform="translate(190, 30)">
    <!-- Name and title -->
    <text x="0" y="30" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#ffffff">
      ${data.name || 'Matt L. Engrave'}
    </text>
    <text x="0" y="50" font-family="Arial, sans-serif" font-size="12" fill="#cccccc">
      ${data.title || 'Chairman of Best Example Name'}
    </text>
    <text x="0" y="65" font-family="Arial, sans-serif" font-size="12" fill="#cccccc">
      ${data.company || 'Board'}
    </text>
    
    <!-- Phone -->
    <g transform="translate(0, 90)">
      <circle cx="8" cy="8" r="8" fill="#ffffff"/>
      <text x="20" y="12" font-family="Arial, sans-serif" font-size="12" fill="#ffffff">
        ${data.phone || '(917) 653-3835'}
      </text>
    </g>
    
    <!-- Email -->
    <g transform="translate(0, 115)">
      <rect x="0" y="2" width="16" height="12" fill="#ffffff"/>
      <text x="20" y="12" font-family="Arial, sans-serif" font-size="12" fill="#ffffff">
        ${data.email || 'nycustomcardsin24hrs@gmail.com'}
      </text>
    </g>
    
    <!-- Address -->
    <g transform="translate(0, 140)">
      <circle cx="8" cy="8" r="8" fill="#ffffff"/>
      <text x="20" y="8" font-family="Arial, sans-serif" font-size="11" fill="#ffffff">
        ${data.address || '101 Tech Park Drive'}
      </text>
      <text x="20" y="20" font-family="Arial, sans-serif" font-size="11" fill="#ffffff">
        New York, NY 10001
      </text>
    </g>
  </g>
</svg>
`;

export const classicTemplateBack = (data: CardData) => `
<svg width="350" height="220" viewBox="0 0 350 220" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="350" height="220" fill="#000000"/>
  
  <!-- Left side with customizable content -->
  <g transform="translate(30, 30)">
    <text x="0" y="40" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">
      This space
    </text>
    <text x="0" y="70" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">
      is for your
    </text>
    <text x="0" y="100" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff">
      headline
    </text>
    
    <!-- Horizontal divider -->
    <line x1="0" y1="140" x2="140" y2="140" stroke="#ffffff" stroke-width="2"/>
    
    <!-- Subtitle area -->
    <text x="0" y="165" font-family="Arial, sans-serif" font-size="12" fill="#cccccc">
      SUBTITLE HERE
    </text>
    <text x="140" y="165" font-family="Arial, sans-serif" font-size="12" fill="#cccccc">
      REALLY GREAT BRAND
    </text>
  </g>
  
  <!-- Vertical divider -->
  <line x1="175" y1="30" x2="175" y2="190" stroke="#333333" stroke-width="1"/>
  
  <!-- Right side with QR code -->
  <g transform="translate(190, 45)">
    <text x="35" y="15" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle">
      Write a short
    </text>
    <text x="35" y="30" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle">
      subtitle here.
    </text>
    
    <!-- QR Code placeholder -->
    <rect x="10" y="40" width="110" height="110" fill="#ffffff" stroke="#333333" stroke-width="2"/>
    <text x="65" y="100" font-family="Arial, sans-serif" font-size="10" fill="#000000" text-anchor="middle">
      QR CODE
    </text>
  </g>
</svg>
`;

export const minimalTemplateFront = (data: CardData) => `
<svg width="350" height="220" viewBox="0 0 350 220" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="350" height="220" fill="#000000"/>
  
  <!-- Centered content -->
  <g transform="translate(175, 110)">
    <!-- Large MC Logo -->
    <text x="0" y="-30" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#ffffff" text-anchor="middle">
      MC
    </text>
    
    <!-- Company name -->
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="16" fill="#10B981" text-anchor="middle">
      ${data.company || 'MetalCardsNYC'}
    </text>
    
    <!-- Contact info -->
    <text x="0" y="25" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle">
      ${data.phone || '(929) 653-3835'}
    </text>
    <text x="0" y="40" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle">
      ${data.website || 'metalcardsnyc.com'}
    </text>
    <text x="0" y="55" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" text-anchor="middle">
      ${data.address || 'New York, New York'}
    </text>
  </g>
</svg>
`;

export const minimalTemplateBack = (data: CardData) => `
<svg width="350" height="220" viewBox="0 0 350 220" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="350" height="220" fill="#000000"/>
  
  <!-- Centered QR Code -->
  <g transform="translate(175, 110)">
    <rect x="-60" y="-60" width="120" height="120" fill="#ffffff" stroke="#10B981" stroke-width="3"/>
    <text x="0" y="5" font-family="Arial, sans-serif" font-size="12" fill="#000000" text-anchor="middle">
      QR CODE
    </text>
  </g>
</svg>
`;

export const modernTemplateFront = (data: CardData) => `
<svg width="350" height="220" viewBox="0 0 350 220" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="350" height="220" fill="url(#modernGradient)"/>
  
  <!-- Modern layout -->
  <g transform="translate(30, 30)">
    <!-- Name -->
    <text x="0" y="30" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff">
      ${data.name || 'MODERN DESIGN'}
    </text>
    
    <!-- Title -->
    <text x="0" y="55" font-family="Arial, sans-serif" font-size="14" fill="#60a5fa">
      ${data.title || 'Contemporary & Sleek'}
    </text>
    
    <!-- Contact info in modern layout -->
    <text x="0" y="100" font-family="Arial, sans-serif" font-size="12" fill="#ffffff">
      ${data.phone || '(917) 653-3835'}
    </text>
    <text x="0" y="120" font-family="Arial, sans-serif" font-size="12" fill="#ffffff">
      ${data.email || 'info@metalcardsnyc.com'}
    </text>
    <text x="0" y="140" font-family="Arial, sans-serif" font-size="12" fill="#ffffff">
      ${data.website || 'metalcardsnyc.com'}
    </text>
  </g>
</svg>
`;

export const sleekTemplateFront = (data: CardData) => `
<svg width="350" height="220" viewBox="0 0 350 220" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="sleekGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#92400e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="350" height="220" fill="url(#sleekGradient)"/>
  
  <!-- Sleek layout -->
  <g transform="translate(30, 30)">
    <!-- Name -->
    <text x="0" y="30" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#fbbf24">
      ${data.name || 'SLEEK DESIGN'}
    </text>
    
    <!-- Title -->
    <text x="0" y="55" font-family="Arial, sans-serif" font-size="14" fill="#fcd34d">
      ${data.title || 'Bold & Creative'}
    </text>
    
    <!-- Contact info -->
    <text x="0" y="100" font-family="Arial, sans-serif" font-size="12" fill="#ffffff">
      ${data.phone || '(917) 653-3835'}
    </text>
    <text x="0" y="120" font-family="Arial, sans-serif" font-size="12" fill="#ffffff">
      ${data.email || 'info@metalcardsnyc.com'}
    </text>
    <text x="0" y="140" font-family="Arial, sans-serif" font-size="12" fill="#ffffff">
      ${data.website || 'metalcardsnyc.com'}
    </text>
  </g>
</svg>
`;

export const templateBackWithQR = (qrCodeData: string) => `
<svg width="350" height="220" viewBox="0 0 350 220" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="350" height="220" fill="#000000"/>
  
  <!-- Centered QR Code -->
  <g transform="translate(175, 110)">
    <rect x="-60" y="-60" width="120" height="120" fill="#ffffff" stroke="#10B981" stroke-width="3"/>
    <text x="0" y="5" font-family="Arial, sans-serif" font-size="10" fill="#000000" text-anchor="middle">
      ${qrCodeData}
    </text>
  </g>
</svg>
`;