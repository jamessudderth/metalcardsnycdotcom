import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      question: "What types of metal business cards do you offer?",
      answer: "We offer two main types: Thin Metal Cards (Standard Metal) for a classic professional look, and Eye-catching color metal cards available in red, blue, green, pink, orange, and purple for those who want to make a bold statement."
    },
    {
      question: "How does the digital profile integration work?",
      answer: "Each metal business card comes with a unique QR code that links to your personalized digital profile. When someone scans the QR code, they can instantly access your contact information, professional links, and company details on any device."
    },
    {
      question: "What information can I include in my digital profile?",
      answer: "Your digital profile can include your full name, job title, email address, phone number, business address, professional photo, company logo, and up to 3 custom links (LinkedIn, portfolio, website, etc.). You can choose from multiple professional template styles."
    },
    {
      question: "How long does it take to receive my metal business cards?",
      answer: "Our standard production time is 5-7 business days for metal card manufacturing, plus shipping time. Rush orders may be available upon request for an additional fee."
    },
    {
      question: "Can I update my digital profile after receiving my cards?",
      answer: "Yes! Your digital profile is completely editable. You can update your information, change your photo, modify your links, and even switch template styles at any time through your account dashboard."
    },
    {
      question: "What file formats do you accept for logos and photos?",
      answer: "We accept JPG, PNG, and PDF files. For best results, we recommend high-resolution images (300 DPI or higher). Our team will optimize your images for both the metal card printing and digital profile display."
    },
    {
      question: "Do you offer bulk pricing for large orders?",
      answer: "Yes, we offer volume discounts for orders of 100+ cards. Contact us at nyccustomcardsin24hrs@gmail.com or call (917) 653-3835 for custom pricing on large orders."
    },
    {
      question: "Are the metal cards durable?",
      answer: "Absolutely! Our metal business cards are made from high-quality materials that are scratch-resistant, waterproof, and designed to last for years. They maintain their professional appearance much longer than traditional paper cards."
    },
    {
      question: "Can I see a proof before my cards are printed?",
      answer: "Yes, we provide a digital proof for your approval before proceeding with production. This ensures your design meets your expectations and allows for any necessary adjustments."
    },
    {
      question: "What if someone can't scan the QR code?",
      answer: "QR codes work with any smartphone camera or QR code reader app. If someone has difficulty scanning, they can also manually visit the profile URL that we provide, or you can share your digital profile link directly."
    },
    {
      question: "Do you ship internationally?",
      answer: "Currently, we primarily serve customers in the United States. For international shipping inquiries, please contact us directly to discuss options and pricing."
    },
    {
      question: "What's included in the pricing?",
      answer: "Our pricing includes the metal card design and production, QR code generation, digital profile setup, and standard shipping. The digital profile hosting and management is included at no additional cost."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our metal business cards and digital profile services.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                onClick={() => toggleItem(index)}
              >
                <span className="text-lg font-medium text-gray-900">{item.question}</span>
                {openItems.includes(index) ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our team is here to help.
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong> <a href="mailto:nyccustomcardsin24hrs@gmail.com" className="text-primary hover:underline">nyccustomcardsin24hrs@gmail.com</a>
              </p>
              <p className="text-gray-700">
                <strong>Phone:</strong> <a href="tel:+19176533835" className="text-primary hover:underline">(917) 653-3835</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;