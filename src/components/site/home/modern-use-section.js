"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@components/ui/button";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import { 
  Search, 
  Calendar, 
  Star, 
  ArrowRight, 
  Play,
  Users,
  Building2,
  Globe,
  Shield,
  TrendingUp,
  ChevronRight,
  Sparkles
} from "lucide-react";

/**
 * Modern Use Section Component
 * Demonstrates platform capabilities with modern design principles:
 * - Minimalist design with ample white space
 * - High-quality visuals and interactive elements
 * - Consistent color palette and typography
 * - Responsive and mobile-friendly design
 * - Clear visual hierarchy
 */
export default function ModernUseSection() {
  const [activeTab, setActiveTab] = useState('consumers');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const useCases = {
    consumers: {
      title: "For Consumers",
      subtitle: "Find & Book Services Instantly",
      description: "Discover trusted local businesses, read authentic reviews, and book services with just a few taps.",
      color: "blue",
      icon: Search,
      steps: [
        {
          number: "01",
          title: "Search & Discover",
          description: "Use our intelligent search to find exactly what you need, when you need it.",
          icon: Search,
          features: ["AI-powered search", "Location-based results", "Smart filters"],
          demo: "search-demo"
        },
        {
          number: "02", 
          title: "Compare & Choose",
          description: "Read verified reviews, compare prices, and view real photos from customers.",
          icon: Star,
          features: ["Verified reviews", "Price comparison", "Photo galleries"],
          demo: "compare-demo"
        },
        {
          number: "03",
          title: "Book & Pay",
          description: "Schedule appointments instantly and pay securely through the platform.",
          icon: Calendar,
          features: ["Instant booking", "Secure payments", "Calendar sync"],
          demo: "booking-demo"
        }
      ]
    },
    businesses: {
      title: "For Businesses",
      subtitle: "Complete Operations Suite",
      description: "Manage your entire business from customer acquisition to project completion.",
      color: "emerald", 
      icon: Building2,
      steps: [
        {
          number: "01",
          title: "Get Discovered",
          description: "Create a stunning business profile that attracts and converts customers.",
          icon: Globe,
          features: ["Professional profiles", "SEO optimization", "Rich media galleries"],
          demo: "profile-demo"
        },
        {
          number: "02",
          title: "Manage Operations", 
          description: "Handle scheduling, dispatching, invoicing, and customer relationships seamlessly.",
          icon: Users,
          features: ["Smart scheduling", "Team dispatch", "Integrated CRM"],
          demo: "operations-demo"
        },
        {
          number: "03",
          title: "Grow & Scale",
          description: "Use analytics and automation to optimize performance and expand your reach.",
          icon: TrendingUp,
          features: ["Performance analytics", "Automated marketing", "Growth insights"],
          demo: "growth-demo"
        }
      ]
    }
  };

  const activeUseCase = useCases[activeTab];

  // Interactive demo components (simplified for this example)
  const DemoPreview = ({ demo, isActive }) => {
    const demos = {
      'search-demo': (
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8 h-64">
          <div className="absolute inset-4 bg-white dark:bg-card rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-border dark:border-border">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-card rounded-lg">
                <Search className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground dark:text-muted-foreground">Find plumbers near me...</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-card">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/30 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-muted dark:bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-2 bg-muted dark:bg-card rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      'compare-demo': (
        <div className="relative bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8 h-64">
          <div className="grid grid-cols-2 gap-4 h-full">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-card rounded-xl shadow-lg p-4">
                <div className="w-full h-20 bg-muted dark:bg-card rounded-lg mb-3"></div>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-warning" />
                  ))}
                </div>
                <div className="h-2 bg-muted dark:bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-muted dark:bg-card rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ),
      'booking-demo': (
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-8 h-64">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg p-6 h-full">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-success" />
              <span className="font-semibold text-foreground dark:text-white">Book Appointment</span>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {Array.from({ length: 21 }, (_, i) => (
                <div key={i} className={`h-8 rounded ${i === 10 ? 'bg-success text-white' : 'bg-muted dark:bg-card'} flex items-center justify-center text-sm`}>
                  {i + 1}
                </div>
              ))}
            </div>
            <Button className="w-full bg-success hover:bg-success">
              Confirm Booking
            </Button>
          </div>
        </div>
      ),
      // Business demos
      'profile-demo': (
        <div className="relative bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-8 h-64">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg p-4 h-full overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-warning/10 dark:bg-warning/30 rounded-xl"></div>
              <div>
                <div className="h-4 bg-muted dark:bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted dark:bg-card rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="aspect-square bg-muted dark:bg-card rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-muted dark:bg-muted rounded w-full"></div>
              <div className="h-2 bg-muted dark:bg-card rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ),
      'operations-demo': (
        <div className="relative bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-950/20 dark:to-blue-950/20 rounded-2xl p-8 h-64">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-foreground dark:text-white">Team Dashboard</span>
              <Badge className="bg-success/10 text-success dark:bg-success/30 dark:text-success/90">
                5 Active
              </Badge>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-border dark:border-border">
                  <div className="w-8 h-8 bg-primary/10 dark:bg-primary/30 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-muted dark:bg-muted rounded w-2/3 mb-1"></div>
                    <div className="h-2 bg-muted dark:bg-card rounded w-1/3"></div>
                  </div>
                  <div className="w-16 h-6 bg-primary/10 dark:bg-primary/30 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
      'growth-demo': (
        <div className="relative bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950/20 dark:to-purple-950/20 rounded-2xl p-8 h-64">
          <div className="bg-white dark:bg-card rounded-xl shadow-lg p-4 h-full">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-foreground dark:text-white">Growth Analytics</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">Revenue Growth</span>
                <span className="text-success font-semibold">+23%</span>
              </div>
              <div className="w-full h-2 bg-muted dark:bg-muted rounded-full">
                <div className="h-2 bg-purple-500 rounded-full w-3/4"></div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="text-center">
                    <div className="text-lg font-bold text-foreground dark:text-white">
                      {i === 1 ? '156' : i === 2 ? '89%' : '4.8'}
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {i === 1 ? 'Jobs' : i === 2 ? 'Satisfaction' : 'Rating'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    };

    return (
      <div className={`transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}`}>
        {demos[demo] || demos['search-demo']}
      </div>
    );
  };

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/30 overflow-hidden"
    >
      <div className="container mx-auto px-6 lg:px-8">
        {/* Section Header with Animation */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/30 text-primary dark:text-primary/90 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>How Thorbis Works</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground dark:text-white">
            Simple.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Powerful.
            </span>{" "}
            <br className="hidden md:block" />
            Transformative.
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground dark:text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Whether you're finding services or running a business, Thorbis makes everything effortless.
          </p>
        </div>

        {/* Interactive Tab Switcher */}
        <div className={`flex justify-center mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex p-1 bg-white dark:bg-card rounded-2xl shadow-lg border border-border dark:border-border">
            {Object.entries(useCases).map(([key, useCase]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-muted'
                }`}
              >
                <useCase.icon className="w-5 h-5" />
                {useCase.title}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Use Case Header */}
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground dark:text-white">
              {activeUseCase.subtitle}
            </h3>
            <p className="text-lg text-muted-foreground dark:text-muted-foreground max-w-2xl mx-auto">
              {activeUseCase.description}
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Steps List */}
            <div className="space-y-8">
              {activeUseCase.steps.map((step, index) => (
                <Card 
                  key={step.number}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
                    hoveredCard === index 
                      ? 'border-primary/30 dark:border-primary shadow-lg' 
                      : 'border-border dark:border-border'
                  }`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      {/* Step Number */}
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                          hoveredCard === index
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'bg-muted dark:bg-card text-muted-foreground dark:text-muted-foreground'
                        }`}>
                          {step.number}
                        </div>
                      </div>

                      {/* Step Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <step.icon className={`w-6 h-6 transition-colors duration-300 ${
                            hoveredCard === index ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                          <h4 className="text-xl font-bold text-foreground dark:text-white">
                            {step.title}
                          </h4>
                        </div>
                        
                        <p className="text-muted-foreground dark:text-muted-foreground mb-4 leading-relaxed">
                          {step.description}
                        </p>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          {step.features.map((feature, featureIndex) => (
                            <Badge 
                              key={featureIndex}
                              variant="secondary"
                              className="bg-blue-50 dark:bg-primary/30 text-primary dark:text-primary/90 border-primary/30 dark:border-primary"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className={`w-6 h-6 transition-all duration-300 ${
                        hoveredCard === index 
                          ? 'text-primary translate-x-1' 
                          : 'text-muted-foreground'
                      }`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Interactive Demo */}
            <div className="relative">
              <div className="sticky top-8">
                {hoveredCard !== null ? (
                  <DemoPreview 
                    demo={activeUseCase.steps[hoveredCard].demo} 
                    isActive={true}
                  />
                ) : (
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground dark:text-muted-foreground font-medium">
                        Hover over steps to see them in action
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-20 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              {activeTab === 'consumers' ? 'Find Services Now' : 'Start Your Business Account'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-border dark:border-border text-muted-foreground dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-card px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300"
            >
              Watch Demo
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground dark:text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Secure & Trusted</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>50K+ Businesses</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-warning" />
              <span>4.8 Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
