"use client";

import { useState } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Calendar,
  Globe,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  MessageSquare,
  Shield,
  Zap,
  Award,
  ExternalLink
} from "lucide-react";

interface ContactSectionProps {
  business: {
    name: string;
    phone: string;
    email: string;
    address: string;
    website?: string;
    hours?: Record<string, string>;
    trustMetrics?: {
      responseTime: string;
    };
  };
}

export function ContactSection({ business }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: ',
    email: ',
    phone: ',
    service: ',
    message: ',
    urgency: 'normal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Track conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'form_submission', {
        event_category: 'engagement',
        event_label: 'contact_form'
      });
    }
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleCall = () => {
    window.location.href = `tel:${business.phone}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${business.email}';
  };

  const getDirections = () => {
    const address = encodeURIComponent(business.address);
    window.open('https://maps.google.com?q=${address}', '_blank');
  };

  const currentHour = new Date().getHours();
  const isBusinessHours = currentHour >= 8 && currentHour < 18; // 8 AM to 6 PM

  if (isSubmitted) {
    return (
      <section className="min-h-screen bg-neutral-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-5xl font-bold mb-4">Message Sent!</h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto mb-10">
              Thank you for contacting {business.name}. We'll respond within {business.trustMetrics?.responseTime || '2 hours'}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCall}
                className="bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <Phone className="w-6 h-6" />
                Call for Immediate Response
              </button>
              <button
                onClick={() => setIsSubmitted(false)}
                className="border-2 border-neutral-600 hover:border-neutral-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:bg-neutral-800"
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact-section" className="min-h-screen bg-neutral-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-[#1C8BFF] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-5xl font-bold mb-4">Get in Touch</h2>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            Ready to start your project? Contact us for a free consultation and personalized quote
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
          {/* Quick Contact Options */}
          <div>
            <h3 className="text-3xl font-bold mb-8">Quick Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
              <button
                onClick={handleCall}
                className="p-8 bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/40">
                    <Phone className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-xl font-bold text-white mb-2">Call Now</div>
                  <div className="text-green-400 font-medium">{business.phone}</div>
                  <div className="text-sm text-neutral-400 mt-1">
                    {isBusinessHours ? 'Available Now' : 'Emergency Service'}
                  </div>
                </div>
              </button>

              <button
                onClick={handleEmail}
                className="p-8 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-all duration-200 group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/40">
                    <Mail className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-white mb-2">Send Email</div>
                  <div className="text-blue-400 font-medium">{business.email}</div>
                  <div className="text-sm text-neutral-400 mt-1">Quick Response</div>
                </div>
              </button>
            </div>

            {/* Business Information */}
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-8 h-8 text-orange-400" />
                </div>
                <div>
                  <div className="text-xl font-semibold mb-2">Service Area</div>
                  <div className="text-neutral-300 mb-3">{business.address}</div>
                  <button
                    onClick={getDirections}
                    className="text-[#1C8BFF] hover:text-[#1C8BFF]/80 font-medium flex items-center gap-2"
                  >
                    Get directions
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <div className="text-xl font-semibold mb-2">Business Hours</div>
                  <div className="text-neutral-300 space-y-1 mb-3">
                    <div>Monday - Friday: 8:00 AM - 6:00 PM</div>
                    <div>Saturday: 9:00 AM - 5:00 PM</div>
                    <div>Sunday: Emergency Only</div>
                  </div>
                  <div className={'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    isBusinessHours 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }'}>
                    <div className={'w-3 h-3 rounded-full ${isBusinessHours ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}'} />
                    {isBusinessHours ? 'Open Now' : 'Closed - Emergency Available'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="text-3xl font-bold mb-8">Send Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="px-6 py-4 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:border-[#1C8BFF] focus:outline-none focus:ring-2 focus:ring-[#1C8BFF]/20 transition-colors"
                  placeholder="Your name"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="px-6 py-4 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:border-[#1C8BFF] focus:outline-none focus:ring-2 focus:ring-[#1C8BFF]/20 transition-colors"
                  placeholder="Email address"
                />
              </div>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:border-[#1C8BFF] focus:outline-none focus:ring-2 focus:ring-[#1C8BFF]/20 transition-colors"
                placeholder="Phone number (optional)"
              />

              <select
                name="service"
                value={formData.service}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-neutral-800 border border-neutral-700 text-white focus:border-[#1C8BFF] focus:outline-none focus:ring-2 focus:ring-[#1C8BFF]/20 transition-colors"
              >
                <option value="">What service do you need?</option>
                <option value="emergency">Emergency Repair</option>
                <option value="full-service">Complete Service</option>
                <option value="maintenance">Maintenance Plan</option>
                <option value="consultation">Free Consultation</option>
                <option value="other">Other</option>
              </select>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-6 py-4 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:border-[#1C8BFF] focus:outline-none focus:ring-2 focus:ring-[#1C8BFF]/20 transition-colors resize-none"
                placeholder="Tell us about your project..."
              />

              {/* Urgency Selection */}
              <div>
                <p className="text-lg font-semibold text-white mb-4">How urgent is this?</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'normal', label: 'Normal', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
                    { value: 'urgent', label: 'Urgent', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' },
                    { value: 'emergency', label: 'Emergency', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30` }
                  ].map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="urgency"
                        value={option.value}
                        checked={formData.urgency === option.value}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={'py-4 px-4 text-center font-medium transition-all duration-200 border ${
                        formData.urgency === option.value
                          ? '${option.bg} ${option.color} ${option.border}'
                          : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border-neutral-700'
                      }'}>
                        {option.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1C8BFF] hover:bg-[#1C8BFF]/90 disabled:opacity-50 text-white font-bold py-5 px-8 text-lg transition-all duration-200 flex items-center justify-center gap-3 hover:scale-105 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-r from-neutral-800 to-neutral-700 p-12">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
              
              <div className="relative">
                <h3 className="text-2xl font-bold mb-8">Why Choose Us?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="font-semibold text-white mb-1">Secure & Protected</div>
                    <div className="text-neutral-400 text-sm">Your information is safe</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="font-semibold text-white mb-1">Fast Response</div>
                    <div className="text-neutral-400 text-sm">Quick reply guaranteed</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="font-semibold text-white mb-1">Free Quote</div>
                    <div className="text-neutral-400 text-sm">No obligation estimate</div>
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