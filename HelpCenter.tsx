import { Mail, Phone, MessageCircle, FileText, CreditCard, User } from "lucide-react";

const HelpCenter = () => {
  const helpTopics = [
    {
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      title: "Orders & Pricing",
      description: "Information about placing orders, pricing, and payment options",
      topics: [
        "How to place an order",
        "Pricing and bulk discounts",
        "Payment methods accepted",
        "Order tracking and status"
      ]
    },
    {
      icon: <User className="h-8 w-8 text-primary" />,
      title: "Digital Profiles",
      description: "Managing your digital profile and QR code functionality",
      topics: [
        "Setting up your digital profile",
        "Editing profile information",
        "QR code troubleshooting",
        "Template customization"
      ]
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Design & Files",
      description: "Guidelines for logos, photos, and design specifications",
      topics: [
        "File format requirements",
        "Logo and photo guidelines",
        "Design specifications",
        "Proof approval process"
      ]
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: "General Support",
      description: "Account help, technical issues, and general inquiries",
      topics: [
        "Account management",
        "Technical troubleshooting",
        "Shipping and delivery",
        "Returns and refunds"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find help and support for your Metal Cards NYC experience. Browse topics below or contact us directly.
          </p>
        </div>

        {/* Help Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {helpTopics.map((topic, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-4">
                {topic.icon}
                <h3 className="text-xl font-semibold text-gray-900 ml-3">{topic.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{topic.description}</p>
              <ul className="space-y-2">
                {topic.topics.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm text-gray-700 flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Us Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600">
              Need personalized help? Our team is ready to assist you with any questions or concerns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Contact */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">
                Send us an email and we'll respond within 24 hours
              </p>
              <a 
                href="mailto:nyccustomcardsin24hrs@gmail.com"
                className="text-primary hover:text-primary/80 font-medium text-lg"
              >
                nyccustomcardsin24hrs@gmail.com
              </a>
            </div>

            {/* Phone Contact */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">
                Call us directly for immediate assistance
              </p>
              <a 
                href="tel:+19176533835"
                className="text-primary hover:text-primary/80 font-medium text-lg"
              >
                (917) 653-3835
              </a>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Business Hours</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST</p>
                <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM EST</p>
              </div>
              <div>
                <p><strong>Sunday:</strong> Closed</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips Section */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Quick Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Before Contacting</h4>
              <p className="text-sm text-gray-600">Check our FAQ page for quick answers to common questions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Have Your Info Ready</h4>
              <p className="text-sm text-gray-600">Include your order number or account details when contacting us</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Be Specific</h4>
              <p className="text-sm text-gray-600">Describe your issue in detail to help us assist you faster</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;