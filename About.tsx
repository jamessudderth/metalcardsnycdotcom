import { Award, Users, Zap, Shield } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Premium Quality",
      description: "We use only the highest quality metals and precision manufacturing to create business cards that make a lasting impression."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Digital Innovation",
      description: "Seamlessly bridge physical and digital networking with our integrated QR code technology and customizable digital profiles."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Customer Focused",
      description: "Our dedicated team works closely with each client to ensure your vision becomes reality, from design to delivery."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Trusted Service",
      description: "Based in New York City, we've built our reputation on reliability, quality craftsmanship, and exceptional customer service."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About Metal Cards NYC
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing business networking by combining premium metal business cards 
              with cutting-edge digital profile technology, creating the perfect fusion of physical 
              and digital professional presence.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Metal Cards NYC was founded with a simple yet powerful vision: to transform how 
                  professionals network and share their contact information in the digital age. 
                  We recognized that traditional paper business cards were becoming outdated, 
                  while purely digital solutions lacked the tangible impact of physical networking.
                </p>
                <p>
                  Our solution bridges this gap by offering premium metal business cards embedded 
                  with QR codes that instantly connect people to comprehensive digital profiles. 
                  This innovative approach ensures your professional brand makes both a memorable 
                  first impression and provides seamless digital accessibility.
                </p>
                <p>
                  Based in the heart of New York City, we serve professionals, entrepreneurs, 
                  and businesses who understand that quality networking tools are an investment 
                  in their success.
                </p>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Why Choose Metal Cards?</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </span>
                    <span>Durability that lasts years, not weeks</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </span>
                    <span>Premium feel that commands attention</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </span>
                    <span>Environmentally conscious alternative to paper</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                    </span>
                    <span>Instant digital profile access via QR codes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Sets Us Apart</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our commitment to excellence extends beyond just creating beautiful metal cards. 
              We provide a complete solution that enhances your professional networking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              "To empower professionals with networking tools that seamlessly blend premium 
              craftsmanship with digital innovation, creating meaningful connections that 
              drive business success."
            </p>
            <p className="text-gray-600">
              Every metal card we create and every digital profile we host represents our 
              commitment to helping you make lasting professional impressions in an 
              increasingly connected world.
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA Section */}
      <div className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Elevate Your Networking?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of professionals who have transformed their networking with Metal Cards NYC.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <a 
              href="/login" 
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Get Started Today
            </a>
            <a 
              href="mailto:nyccustomcardsin24hrs@gmail.com" 
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;