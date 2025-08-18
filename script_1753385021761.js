// Business Card Generator JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const generateBtn = document.getElementById('generate');
  const flipBtn = document.getElementById('flip-btn');
  const downloadBtn = document.getElementById('download-btn');
  const outputEl = document.getElementById('output');
  const cardStyleSelect = document.getElementById('card-style');
  
  // Default placeholder image for QR code
  const placeholderQrCode = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'%3E%3Crect width='100' height='100' fill='white'/%3E%3Cpath d='M30,30 L30,45 L45,45 L45,30 L30,30 Z M35,35 L40,35 L40,40 L35,40 L35,35 Z M55,30 L55,45 L70,45 L70,30 L55,30 Z M60,35 L65,35 L65,40 L60,40 L60,35 Z M30,55 L30,70 L45,70 L45,55 L30,55 Z M35,60 L40,60 L40,65 L35,65 L35,60 Z M50,30 L50,35 L55,35 L55,30 L50,30 Z M45,50 L45,55 L50,55 L50,50 L45,50 Z M65,50 L65,55 L70,55 L70,50 L65,50 Z M55,55 L55,70 L70,70 L70,55 L55,55 Z M60,60 L65,60 L65,65 L60,65 L60,60 Z' fill='black'/%3E%3C/svg%3E";
  
  // Default placeholder for company logo
  const placeholderLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f8f9fa'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%23333' text-anchor='middle' dominant-baseline='middle'%3ECompany Logo%3C/text%3E%3C/svg%3E";
  
  // Card style templates
  const cardTemplates = [
    {
      id: "minimal",
      name: "Minimal",
      backgroundColor: "#ffffff",
      textColor: "#333333",
      accentColor: "#dddddd",
      fontFamily: "'Helvetica', sans-serif",
      description: "Clean, simple design with minimal elements and ample white space."
    },
    {
      id: "elegant",
      name: "Elegant",
      backgroundColor: "#f5f5f5",
      textColor: "#1a1a1a",
      accentColor: "#9c8c68",
      fontFamily: "'Georgia', serif",
      description: "Sophisticated design with serif fonts and subtle gold accents."
    },
    {
      id: "bold-color",
      name: "Bold Color",
      backgroundColor: "#2c3e50",
      textColor: "#ffffff",
      accentColor: "#e74c3c",
      fontFamily: "'Montserrat', sans-serif",
      description: "High-impact design with bold colors and strong contrast."
    },
    {
      id: "metal-print",
      name: "Metal Print",
      backgroundColor: "#212529",
      textColor: "#e9ecef",
      accentColor: "#adb5bd",
      fontFamily: "'Arial', sans-serif",
      backgroundImage: "linear-gradient(45deg, #212529 25%, #343a40 25%, #343a40 50%, #212529 50%, #212529 75%, #343a40 75%, #343a40 100%)",
      backgroundSize: "10px 10px",
      description: "Premium metallic look with subtle pattern and reflective elements."
    }
  ];

  // Function to generate card preview
  function generatePreview() {
    // Get form values
    const name = document.getElementById('input-name').value || 'John Doe';
    const title = document.getElementById('input-title').value || 'Position Title';
    const email = document.getElementById('input-email').value || 'email@example.com';
    const phone = document.getElementById('input-phone').value || '(555) 123-4567';
    const address = document.getElementById('input-address').value || '123 Business St, New York, NY';
    const website = document.getElementById('input-website').value || 'www.example.com';
    const logoUrl = document.getElementById('input-logo').value || placeholderLogo;
    const cardStyle = cardStyleSelect.value;
    
    // Generate business card HTML
    const cardHtml = `
      <div class="card ${cardStyle}" id="card">
        <div class="card-front">
          <div class="brand">
            <img src="${logoUrl}" alt="Company Logo" class="logo" onerror="this.src='${placeholderLogo}';">
          </div>
          
          <div class="info">
            <h1 class="name">${name}</h1>
            <h2 class="title">${title}</h2>
            
            <div class="contact">
              ${email ? `
                <div class="contact-item">
                  <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <p class="email">${email}</p>
                </div>
              ` : ''}
              
              ${phone ? `
                <div class="contact-item">
                  <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <p class="phone">${phone}</p>
                </div>
              ` : ''}
              
              ${address ? `
                <div class="contact-item">
                  <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <p class="address">${address}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div class="card-back">
          <div class="qr-container">
            <p class="scan-text">Scan to connect</p>
            <img src="${placeholderQrCode}" alt="QR Code" class="qr-code">
            <p class="website">${website}</p>
          </div>
        </div>
      </div>
    `;
    
    // Update the output
    outputEl.innerHTML = cardHtml;
    
    // Generate a real QR code based on the website or contact info
    generateQRCode(website || `BEGIN:VCARD
VERSION:3.0
FN:${name}
TITLE:${title}
TEL:${phone}
EMAIL:${email}
ADR:;;${address};;;
END:VCARD`);
  }

  // Set up real-time preview - updates as you type
  document.querySelectorAll('#card-form input, #card-form select').forEach(input => {
    input.addEventListener('input', function() {
      if (input.id === 'card-style') {
        updateTemplateDescription(input.value);
      }
      generatePreview();
    });
  });
  
  // Update template description based on selected style
  function updateTemplateDescription(styleId) {
    const templateDescEl = document.getElementById('template-description');
    const selectedTemplate = cardTemplates.find(template => template.id === styleId);
    
    if (selectedTemplate && templateDescEl) {
      templateDescEl.textContent = selectedTemplate.description;
    }
  }
  
  // Initialize with the first template description
  updateTemplateDescription(cardStyleSelect.value);
  
  // Generate card when button is clicked
  generateBtn.addEventListener('click', function() {
    generatePreview();
  });
  
  // Flip card functionality
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'flip-btn') {
      const card = document.querySelector('#card');
      if (card) {
        card.classList.toggle('flipped');
      }
    }
  });
  
  // Download vCard functionality
  downloadBtn.addEventListener('click', function() {
    const name = document.getElementById('input-name').value || 'John Doe';
    const title = document.getElementById('input-title').value || 'Position Title';
    const email = document.getElementById('input-email').value || 'email@example.com';
    const phone = document.getElementById('input-phone').value || '(555) 123-4567';
    const address = document.getElementById('input-address').value || '123 Business St, New York, NY';
    const website = document.getElementById('input-website').value || 'www.example.com';
    
    // Create vCard content
    const vCardContent = 
`BEGIN:VCARD
VERSION:3.0
FN:${name}
TITLE:${title}
TEL:${phone}
EMAIL:${email}
ADR:;;${address};;;
URL:${website}
END:VCARD`;
    
    // Create a downloadable link
    const blob = new Blob([vCardContent], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}.vcf`;
    a.click();
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  });
  
  // Function to generate QR Code
  function generateQRCode(data) {
    // Check if a QR code library is available
    if (typeof QRCode !== 'undefined') {
      // Clear existing QR code
      const qrContainer = document.querySelector('.qr-code');
      if (qrContainer) {
        qrContainer.innerHTML = '';
        
        // Generate new QR code
        new QRCode(qrContainer, {
          text: data,
          width: 120,
          height: 120,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    } else {
      console.log('QR Code library not available, using placeholder');
      // If no QR library is available, we could use an API but for now we'll use the placeholder
      const qrImg = document.querySelector('.qr-code');
      if (qrImg) {
        qrImg.src = placeholderQrCode;
      }
    }
  }
  
  // Add QR code library dynamically
  function loadQRCodeLibrary() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
    script.async = true;
    document.head.appendChild(script);
  }
  
  // Load QR code library
  loadQRCodeLibrary();
});