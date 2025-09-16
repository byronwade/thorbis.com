"use client";

import { 
  Shield, 
  Star, 
  Verified, 
  Users, 
  Award, 
  CheckCircle,
  ThumbsUp,
  Timer,
  Building2,
  Medal
} from "lucide-react";

interface TrustIndicatorsProps {
  business: {
    name: string;
    trustScore: number;
    blockchainVerified: boolean;
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

export function TrustIndicators({ business }: TrustIndicatorsProps) {
  const metrics = business.trustMetrics;
  
  // Trust metrics for full-screen dark mode design
  const trustCards = [
    {
      icon: Star,
      title: "Trust Score",
      value: business.trustScore.toFixed(1),
      subtitle: "Based on reviews & verification",
      color: "text-yellow-400"
    },
    {
      icon: CheckCircle,
      title: "Projects Completed",
      value: `${metrics?.jobsCompleted || 500}+`,
      subtitle: "Successfully delivered",
      color: "text-green-400"
    },
    {
      icon: ThumbsUp,
      title: "Client Satisfaction",
      value: `${metrics?.satisfactionRate || 98}%`,
      subtitle: "Happy customers",
      color: "text-blue-400"
    },
    {
      icon: Timer,
      title: "Response Time",
      value: metrics?.responseTime || "2 hrs",
      subtitle: "Average first response",
      color: "text-orange-400"
    }
  ];

  // Verification badges for dark mode
  const verificationBadges = [
    {
      icon: Shield,
      title: "Licensed & Insured",
      subtitle: "Professional liability coverage",
      verified: true
    },
    {
      icon: Verified,
      title: "Identity Verified", 
      subtitle: "Background checked",
      verified: business.blockchainVerified
    },
    {
      icon: Award,
      title: "Quality Guarantee",
      subtitle: "Satisfaction promised",
      verified: true
    },
    {
      icon: Medal,
      title: "Top Professional",
      subtitle: `${metrics?.experienceYears || 10}+ years experience`,
      verified: true
    }
  ];

  return (
    <section className="min-h-screen bg-neutral-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-[#1C8BFF] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-5xl font-bold mb-4">Trust & Safety</h2>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            Verified credentials, proven performance, and guaranteed protection for every project
          </p>
        </div>

        {/* Trust Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {trustCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-neutral-800 border border-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-4 hover:bg-neutral-700 transition-colors`}>
                  <Icon className={`w-8 h-8 ${card.color}`} />
                </div>
                <div className="text-4xl font-bold mb-2 text-white">{card.value}</div>
                <div className="text-lg font-semibold mb-2 text-white">{card.title}</div>
                <div className="text-sm text-neutral-400 uppercase tracking-wider font-medium">{card.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* Professional Verification Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center mb-12">Professional Verification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {verificationBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex items-start gap-6 p-8 bg-neutral-800 border border-neutral-700 hover:bg-neutral-800/80 transition-colors">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    badge.verified ? 'bg-green-500/20 border border-green-500/30' : 'bg-neutral-700 border border-neutral-600'
                  }'}>
                    <Icon className={'w-8 h-8 ${badge.verified ? 'text-green-400' : 'text-neutral-400'}'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-semibold text-white">{badge.title}</h4>
                      {badge.verified && (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      )}
                    </div>
                    <p className="text-neutral-300 leading-relaxed">{badge.subtitle}</p>
                    {badge.verified && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-sm font-medium text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Protection Section */}
        <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-r from-neutral-800 to-neutral-700 p-12 mb-8">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-[#1C8BFF] rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-4">Protected by Thorbis Trust</h3>
                <p className="text-xl text-neutral-300 leading-relaxed mb-8">
                  All professionals are verified, insured, and backed by our comprehensive satisfaction guarantee. 
                  Your project is protected from start to finish with blockchain-verified service records.
                </p>
                
                {/* Trust Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Full Insurance Coverage</div>
                      <div className="text-neutral-400 text-sm">Comprehensive liability protection</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Quality Guarantee</div>
                      <div className="text-neutral-400 text-sm">100% satisfaction promised</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Verified className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Blockchain Verified</div>
                      <div className="text-neutral-400 text-sm">Immutable service records</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}