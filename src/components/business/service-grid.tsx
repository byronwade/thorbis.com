"use client";

import { 
  CheckCircle, 
  ArrowRight, 
  DollarSign, 
  Clock, 
  Star,
  Phone,
  MessageCircle,
  Zap,
  Shield,
  Award,
  Info,
  Settings,
  Building2,
  Timer,
  Target,
  Medal,
  Activity,
  ExternalLink,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  BadgeCheck,
  Verified,
  AlertCircle
} from "lucide-react";

interface Service {
  name: string;
  price: string;
  description: string;
  popular?: boolean;
  features: string[];
  responseTime?: string;
  warranty?: string;
}

interface ServiceGridProps {
  business: {
    name: string;
    phone: string;
  };
}

export function ServiceGrid({ business }: ServiceGridProps) {
  const handleGetQuote = (serviceName: string) => {
    // Track conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'quote_request', {
        event_category: 'engagement',
        event_label: serviceName
      });
    }
    
    // Scroll to contact section or open quote modal
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCallNow = () => {
    window.location.href = 'tel:${business.phone}';
  };

  // Service packages for full-screen dark mode design
  const services = [
    {
      icon: Zap,
      name: "Emergency Service",
      description: "Immediate response for urgent issues",
      price: "From $125",
      originalPrice: null,
      responseTime: "< 30 min",
      features: ["24/7 availability", "Same-day repair", "No overtime fees"],
      popular: false,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/30"
    },
    {
      icon: Settings,
      name: "Complete Service",
      description: "Comprehensive solution with warranty",
      price: "$295",
      originalPrice: "$350",
      responseTime: "Same day",
      features: ["Full inspection", "2-year warranty", "Premium materials"],
      popular: true,
      color: "text-blue-400",
      bgColor: "bg-[#1C8BFF]/20",
      borderColor: "border-[#1C8BFF]/30"
    },
    {
      icon: Shield,
      name: "Maintenance Plan",
      description: "Prevent issues with regular service",
      price: "$59/mo",
      originalPrice: null,
      responseTime: "Scheduled",
      features: ["Quarterly visits", "Priority booking", "20% off repairs"],
      popular: false,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    }
  ];

  return (
    <section className="min-h-screen bg-neutral-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-[#1C8BFF] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Settings className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-5xl font-bold mb-4">Our Services</h2>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            Choose the perfect service package tailored to your needs with transparent pricing and guaranteed results
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className={'relative bg-neutral-800 border border-neutral-700 hover:bg-neutral-800/80 transition-all duration-300 overflow-hidden ${service.popular ? 'ring-2 ring-[#1C8BFF] ring-opacity-50' : '}'}>
                {service.popular && (
                  <div className="absolute top-0 left-0 right-0">
                    <div className="bg-[#1C8BFF] text-white text-center text-sm font-semibold py-3">
                      Most Popular Choice
                    </div>
                  </div>
                )}
                
                <div className={'p-8 ${service.popular ? 'pt-16' : '}`}>
                  {/* Service Header */}
                  <div className="text-center mb-8">
                    <div className={`w-16 h-16 ${service.bgColor} border ${service.borderColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-8 h-8 ${service.color}`} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">{service.name}</h3>
                    <p className="text-neutral-300 leading-relaxed">{service.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-2 mb-3">
                      <span className="text-4xl font-bold text-white">{service.price}</span>
                      {service.originalPrice && (
                        <span className="text-xl text-neutral-400 line-through">{service.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className={'w-5 h-5 ${service.color}'} />
                      <span className="text-neutral-300">Response: {service.responseTime}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <ul className="space-y-4">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-neutral-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleGetQuote(service.name)}
                    className={'w-full py-4 px-6 font-semibold transition-all duration-200 hover:scale-105 ${
                      service.popular 
                        ? 'bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white shadow-lg' 
                        : 'border-2 border-neutral-600 hover:border-neutral-500 text-white hover:bg-neutral-700'
                    }'}
                  >
                    Get Quote for {service.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Service Guarantees */}
        <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-r from-neutral-800 to-neutral-700 p-12">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Service Guarantee</h3>
                <p className="text-xl text-neutral-300 leading-relaxed mb-8">
                  Every service comes with our comprehensive guarantee for your complete peace of mind
                </p>
                
                {/* Guarantee Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Timer className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="font-semibold text-white mb-1">Fast Response</div>
                    <div className="text-neutral-400 text-sm">Quick service delivery</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="font-semibold text-white mb-1">Quality Assured</div>
                    <div className="text-neutral-400 text-sm">Professional standards</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="font-semibold text-white mb-1">Upfront Pricing</div>
                    <div className="text-neutral-400 text-sm">No hidden fees</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="font-semibold text-white mb-1">Fully Insured</div>
                    <div className="text-neutral-400 text-sm">Complete protection</div>
                  </div>
                </div>
                
                {/* Call to Action */}
                <div className="mt-10">
                  <button
                    onClick={handleCallNow}
                    className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    Call Now: {business.phone}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}