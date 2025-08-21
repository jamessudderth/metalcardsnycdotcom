import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';

interface Template {
  id: string;
  name: string;
  description: string;
  path: string;
}

const templates: Template[] = [
  {
    id: 'minimal',
    name: 'Minimal Metal Card',
    description: 'Clean and minimal design',
    path: '/templates/svg/minimal/front.svg',
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional professional look', 
    path: '/templates/svg/classic/front.svg',
  },
  {
    id: 'modern',
    name: 'Modern Executive',
    description: 'Contemporary executive style',
    path: '/templates/svg/modern/front.svg',
  },
  {
    id: 'simple',
    name: 'Simple Business Card',
    description: 'Simple and clean design',
    path: '/templates/svg/simple/front.svg',
  }
];

const CardGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [svgPreview, setSvgPreview] = useState<string>('');
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    jobTitle: "",
    address: "",
  });

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);

    fetch(template.path)
      .then(res => res.text())
      .then(svg => {
        const filledSvg = svg
          .replace(/{{fullName}}/g, userData.fullName)
          .replace(/{{email}}/g, userData.email)
          .replace(/{{phone}}/g, userData.phoneNumber)
          .replace(/{{jobTitle}}/g, userData.jobTitle)
          .replace(/{{address}}/g, userData.address || '');
        setSvgPreview(filledSvg);
      })
      .catch(err => {
        console.error('Failed to load template:', err);
      });
  };

  useEffect(() => {
    if (currentTemplateId) {
      // Re-apply user data when userData changes
      const currentTemplate = templates.find(t => t.id === currentTemplateId);
      if (currentTemplate) {
        selectTemplate(currentTemplate);
      }
    }
  }, [userData, currentTemplateId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Card Generator | Metal Cards NYC Digital</title>
        <meta name="description" content="Create custom business cards with our interactive card generator tool." />
      </Helmet>

      <h1 className="text-3xl font-bold text-primary mb-4">Business Card Generator</h1>
      <p className="text-muted-foreground mb-6">Fill out your info and choose a card style to see a live preview.</p>

      {/* Template Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {templates.map(template => (
          <div key={template.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-border">
            <h3 className="font-medium mb-2">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
            <button onClick={() => selectTemplate(template)} className="mt-2 px-4 py-2 bg-primary text-white rounded">
              Select Template
            </button>
          </div>
        ))}
      </div>

      {/* Form and Live Preview */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Full Name" 
            value={userData.fullName}
            onChange={(e) => setUserData({ ...userData, fullName: e.target.value })} 
            className="w-full p-3 border rounded-lg"
          />
          <input 
            type="text" 
            placeholder="Job Title" 
            value={userData.jobTitle}
            onChange={(e) => setUserData({ ...userData, jobTitle: e.target.value })} 
            className="w-full p-3 border rounded-lg"
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })} 
            className="w-full p-3 border rounded-lg"
          />
          <input 
            type="text" 
            placeholder="Phone Number" 
            value={userData.phoneNumber}
            onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })} 
            className="w-full p-3 border rounded-lg"
          />
          <input 
            type="text" 
            placeholder="Address" 
            value={userData.address}
            onChange={(e) => setUserData({ ...userData, address: e.target.value })} 
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div className="border p-4 bg-white dark:bg-black rounded shadow min-h-[400px] flex items-center justify-center">
          {selectedTemplate ? (
            <div dangerouslySetInnerHTML={{ __html: selectedTemplate }} />
          ) : (
            <div className="text-gray-500 text-center">
              <p>Select a template and enter your information</p>
              <p className="text-sm mt-1">to see your live card preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;