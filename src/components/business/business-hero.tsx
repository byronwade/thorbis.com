"use client";

import { 
  Phone, 
  MessageCircle, 
  Star, 
  MapPin, 
  Clock, 
  Shield, 
  Verified,
  Award,
  Users,
  CheckCircle,
  Info,
  Globe,
  TrendingUp,
  Building2,
  Calendar,
  Target,
  Zap,
  ThumbsUp,
  Briefcase,
  ExternalLink,
  BadgeCheck,
  Activity,
  DollarSign,
  Timer,
  Medal
} from "lucide-react";

interface BusinessHeroProps {
  business: {
    name: string;
    description: string;
    phone: string;
    address: string;
    website?: string;
    trustScore: number;
    blockchainVerified: boolean;
    gallery?: string[];
    trustMetrics?: {
      verifiedBusiness: boolean;
      responseTime: string;
      totalReviews: number;
      satisfactionRate: number;
      jobsCompleted: number;
      experienceYears: number;
    };
  };
}

export function BusinessHero({ business }: BusinessHeroProps) {
  const handleCallClick = () => {
    window.location.href = `tel:${business.phone}`;
  };

  const handleQuoteClick = () => {
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWebsiteClick = () => {
    if (business.website) {
      window.open(business.website, '_blank');
    }
  };

  const currentHour = new Date().getHours();
  const isBusinessHours = currentHour >= 8 && currentHour < 18;
  const currentDay = new Date().getDay();
  const isWeekday = currentDay >= 1 && currentDay <= 5;

  // Full-screen dark mode business profile
  return (
    <section className="min-h-screen bg-neutral-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-neutral-800 to-neutral-700 py-16 mb-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          
          <div className="relative max-w-4xl mx-auto text-center">
            {/* Business Avatar */}
            <div className="w-20 h-20 bg-[#1C8BFF] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-12 h-12 text-white" />
            </div>

            {/* Business Name and Status */}
            <div className="mb-6">
              <h1 className="text-5xl font-bold mb-4">{business.name}</h1>
              {business.blockchainVerified && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#1C8BFF] rounded-full flex items-center justify-center">
                    <Verified className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-medium text-[#1C8BFF]">Verified Professional</span>
                </div>
              )}
              
              {/* Online Status */}
              <div className={'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                isBusinessHours 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }'}>
                <div className={'w-3 h-3 rounded-full ${isBusinessHours ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}'} />
                {isBusinessHours ? 'Available Now' : 'Emergency Service Available'}
              </div>
            </div>
            
            <p className="text-xl text-neutral-300 leading-relaxed max-w-2xl mx-auto">{business.description}</p>
          </div>
        </div>

        {/* Stats and Rating Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Key Statistics */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Key Performance</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#1C8BFF] mb-2">{business.trustMetrics?.jobsCompleted || 500}+</div>
                <div className="text-neutral-400 uppercase tracking-wider text-sm font-medium">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">{business.trustMetrics?.satisfactionRate || 98}%</div>
                <div className="text-neutral-400 uppercase tracking-wider text-sm font-medium">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400 mb-2">{business.trustMetrics?.experienceYears || 10}</div>
                <div className="text-neutral-400 uppercase tracking-wider text-sm font-medium">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="text-4xl font-bold text-yellow-400">{business.trustScore.toFixed(1)}</span>
                </div>
                <div className="text-neutral-400 uppercase tracking-wider text-sm font-medium">{business.trustMetrics?.totalReviews || 150} Reviews</div>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Business Information</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Timer className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold mb-1">Response Time</div>
                  <div className="text-neutral-400">Usually responds in {business.trustMetrics?.responseTime || '2 hours'}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold mb-1">Service Area</div>
                  <div className="text-neutral-400">{business.address}</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold mb-1">Business Hours</div>
                  <div className="text-neutral-400">
                    Monday - Friday: 8:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 5:00 PM<br />
                    Sunday: Emergency Only
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Professional Certifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <div className="font-semibold text-green-400 mb-1">Licensed & Insured</div>
              <div className="text-neutral-400 text-sm">Full coverage protection</div>
            </div>
            <div className="text-center p-6 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
              <CheckCircle className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <div className="font-semibold text-blue-400 mb-1">Background Verified</div>
              <div className="text-neutral-400 text-sm">Identity confirmed</div>
            </div>
            <div className="text-center p-6 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
              <Award className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <div className="font-semibold text-purple-400 mb-1">Top Professional</div>
              <div className="text-neutral-400 text-sm">Industry leader</div>
            </div>
            <div className="text-center p-6 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
              <Medal className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <div className="font-semibold text-yellow-400 mb-1">Quality Guarantee</div>
              <div className="text-neutral-400 text-sm">100% satisfaction</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-neutral-300 mb-8">Contact us today for a free consultation and personalized quote for your project.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleQuoteClick}
                className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-3 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
                Get Free Quote
              </button>
              
              <button
                onClick={handleCallClick}
                className="border-2 border-neutral-600 hover:border-neutral-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-3 hover:bg-neutral-800"
              >
                <Phone className="w-6 h-6" />
                Call Now: {business.phone}
              </button>
              
              {business.website && (
                <button
                  onClick={handleWebsiteClick}
                  className="border-2 border-neutral-600 hover:border-neutral-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 flex items-center justify-center gap-3 hover:bg-neutral-800"
                >
                  <Globe className="w-6 h-6" />
                  Visit Website
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}