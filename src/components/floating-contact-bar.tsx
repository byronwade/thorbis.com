"use client";

import { useState, useEffect } from "react";
import { 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  ChevronUp,
  Star,
  Shield,
  Zap
} from "lucide-react";

interface FloatingContactBarProps {
  business: {
    name: string;
    phone: string;
    address: string;
    trustScore: number;
    trustMetrics?: {
      responseTime: string;
    };
  };
}

export function FloatingContactBar({ business }: FloatingContactBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show the bar after scrolling past the hero section (roughly 80vh)
      const scrollPosition = window.scrollY;
      const viewportHeight = window.innerHeight;
      setIsVisible(scrollPosition > viewportHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCall = () => {
    // Track conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'phone_call', {
        event_category: 'engagement',
        event_label: 'floating_contact_bar'
      });
    }
    window.location.href = 'tel:${business.phone}';
  };

  const handleMessage = () => {
    // Track conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'message_click', {
        event_category: 'engagement',
        event_label: 'floating_contact_bar'
      });
    }
    
    // Scroll to contact section
    const contactSection = document.getElementById('contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getDirections = () => {
    const address = encodeURIComponent(business.address);
    window.open('https://maps.google.com?q=${address}', '_blank');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-t border-white/10 backdrop-blur-md shadow-2xl">
          
          {/* Expanded Info Panel */}
          {isExpanded && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-lg">{business.name}</h3>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
                >
                  <ChevronUp className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <MapPin className="w-4 h-4 text-[#1C8BFF]" />
                  <span>{business.address}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span>Responds {business.trustMetrics?.responseTime || 'within 2 hours'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span>{business.trustScore.toFixed(1)} Trust Score</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Action Bar */}
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              
              {/* Call Button */}
              <button
                onClick={handleCall}
                className="flex flex-col items-center gap-2 p-3 bg-[#1C8BFF] text-white rounded-xl hover:bg-[#1C8BFF]/90 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="text-xs font-semibold">Call Now</span>
              </button>
              
              {/* Message Button */}
              <button
                onClick={handleMessage}
                className="flex flex-col items-center gap-2 p-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-semibold">Message</span>
              </button>
              
              {/* Info Toggle */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex flex-col items-center gap-2 p-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span className="text-xs font-semibold">Info</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Contact Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 hidden lg:block">
        <div className="bg-gradient-to-r from-neutral-950/95 via-neutral-900/95 to-neutral-950/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Contact Info Row */}
          <div className="flex items-center px-6 py-4 gap-8">
            
            {/* Business Name & Trust Score */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1C8BFF]/20 border border-[#1C8BFF]/30 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#1C8BFF]" />
              </div>
              <div>
                <div className="font-bold text-white text-lg">{business.name}</div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <span className="text-amber-400 font-semibold">{business.trustScore.toFixed(1)}</span>
                  <span className="text-white/60">Trust Score</span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Fast Response</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#1C8BFF]" />
                <span>Emergency Available</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={getDirections}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Directions</span>
              </button>
              
              <button
                onClick={handleMessage}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Message</span>
              </button>
              
              <button
                onClick={handleCall}
                className="flex items-center gap-2 px-6 py-2 bg-[#1C8BFF] text-white rounded-lg hover:bg-[#1C8BFF]/90 transition-colors font-semibold"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </button>
            </div>
          </div>

          {/* Emergency Banner */}
          <div className="bg-gradient-to-r from-red-500/20 to-amber-500/20 border-t border-red-500/20 px-6 py-2">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-semibold">24/7 Emergency Service Available</span>
              <span className="text-white/60">•</span>
              <span className="text-white/60">Call now for immediate response</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}