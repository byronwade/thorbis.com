'use client';

import { useState } from 'react';
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Input } from "@components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  CheckCircle, 
  Users,
  Wrench,
  ArrowRight,
  PlayCircle
} from "lucide-react";

/**
 * Enhanced Hero Section for Unified Thorbis Platform
 * Showcases both consumer discovery and business management features
 */
export default function EnhancedHeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [activeDemo, setActiveDemo] = useState('consumer');

  const platformStats = {
    businesses: '50,000+',
    completedJobs: '2.5M+',
    avgRating: '4.8',
    savings: '30%'
  };

  const demoScenarios = {
    consumer: {
      title: "Find & Book Services Instantly",
      description: "Search trusted professionals, read reviews, and book services with just a few clicks",
      features: [
        "Verified service providers",
        "Instant booking & quotes",
        "Secure payments",
        "Real-time tracking"
      ],
      cta: "Find Services"
    },
    business: {
      title: "Complete Business Operations Suite",
      description: "Manage scheduling, dispatching, invoicing, and customer relationships in one platform",
      features: [
        "Smart scheduling & dispatch",
        "Integrated invoicing",
        "Customer management",
        "Performance analytics"
      ],
      cta: "Try Business Tools"
    }
  };

  const popularServices = [
    { name: "Plumbing", icon: "🔧", searches: "2.3k this week" },
    { name: "Electrical", icon: "⚡", searches: "1.8k this week" },
    { name: "HVAC", icon: "❄️", searches: "1.5k this week" },
    { name: "Cleaning", icon: "🧽", searches: "3.1k this week" },
    { name: "Handyman", icon: "🔨", searches: "2.7k this week" },
    { name: "Landscaping", icon: "🌱", searches: "1.2k this week" }
  ];

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-warning/40 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Hero Content */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              🚀 Unified Local Discovery & Field Service Platform
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="block text-foreground dark:text-white">
                Where Discovery
              </span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                Meets Delivery
              </span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-muted-foreground dark:text-muted-foreground mb-8">
              The complete platform for local services. <strong>Find and book</strong> trusted professionals instantly, 
              or <strong>manage and grow</strong> your field service business with our integrated SaaS tools.
            </p>

            {/* Search Interface */}
            <div className="max-w-4xl mx-auto mb-12">
              <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="What service do you need? (e.g., plumber, electrician, cleaner)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-14 text-lg border-0 bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Enter your location or zip code"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 h-14 text-lg border-0 bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <Button size="lg" className="h-14 px-8 text-lg font-semibold">
                    <Search className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>
              </Card>
            </div>

            {/* Popular Services */}
            <div className="mb-16">
              <p className="text-muted-foreground dark:text-muted-foreground mb-4">Popular services this week:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {popularServices.map((service) => (
                  <Button
                    key={service.name}
                    variant="outline"
                    size="sm"
                    className="h-auto p-3 bg-white/60 hover:bg-white border-border hover:border-primary/40 transition-all"
                  >
                    <span className="text-lg mr-2">{service.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-xs text-muted-foreground">{service.searches}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Platform Demo Section */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Consumer Side */}
            <Card className="overflow-hidden shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">For Customers</h3>
                      <p className="text-muted-foreground">Find & book services</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Most Popular</Badge>
                </div>

                <h4 className="text-2xl font-bold mb-4">
                  {demoScenarios.consumer.title}
                </h4>
                <p className="text-muted-foreground mb-6">
                  {demoScenarios.consumer.description}
                </p>

                <div className="space-y-3 mb-8">
                  {demoScenarios.consumer.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button size="lg" className="flex-1">
                    {demoScenarios.consumer.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Demo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Business Side */}
            <Card className="overflow-hidden shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">For Businesses</h3>
                      <p className="text-muted-foreground">Manage operations</p>
                    </div>
                  </div>
                  <Badge variant="outline">SaaS Tools</Badge>
                </div>

                <h4 className="text-2xl font-bold mb-4">
                  {demoScenarios.business.title}
                </h4>
                <p className="text-muted-foreground mb-6">
                  {demoScenarios.business.description}
                </p>

                <div className="space-y-3 mb-8">
                  {demoScenarios.business.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button size="lg" className="flex-1" variant="outline">
                    {demoScenarios.business.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Trusted by Service Professionals & Customers</h3>
              <p className="text-muted-foreground">Join the growing Thorbis community transforming local services</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{platformStats.businesses}</div>
                <div className="text-muted-foreground">Active Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-2">{platformStats.completedJobs}</div>
                <div className="text-muted-foreground">Jobs Completed</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-6 h-6 fill-yellow-400 text-warning" />
                  <span className="text-3xl font-bold text-warning">{platformStats.avgRating}</span>
                </div>
                <div className="text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{platformStats.savings}</div>
                <div className="text-muted-foreground">Cost Savings</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold">
                <Users className="w-5 h-5 mr-2" />
                Start as Customer
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold">
                <Wrench className="w-5 h-5 mr-2" />
                Join as Business
              </Button>
            </div>
            <p className="text-muted-foreground mt-4">Free to start • No credit card required</p>
          </div>
        </div>
      </div>
    </section>
  );
}