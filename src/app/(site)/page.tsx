"use client";

import { businessCategories, featuredBusinesses, getRandomBusinesses } from "@/lib/mock-data"
import { EnhancedBusinessCard } from "@/components/ui/enhanced-business-card"
import { Heart, Share2, Star, MapPin, Clock, Play, Info, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function HomePage() {
  const [currentHero, setCurrentHero] = useState(0);
  
  const heroBusinesses = [
    {
      name: "Serenity Day Spa",
      category: "Spa & Wellness",
      rating: 4.7,
      reviewCount: 256,
      location: "San Francisco, CA",
      businessHours: "Open until 8:00 PM",
      description: "Luxury wellness retreat offering massage therapy, facials, and holistic treatments. Escape the stress of daily life and rejuvenate your mind, body, and spirit.",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      href: "/us/ca/san-francisco/serenity-day-spa",
      trustScore: 4.7,
      verified: true
    },
    {
      name: "Urban Fusion Kitchen", 
      category: "Fine Dining",
      rating: 4.9,
      reviewCount: 342,
      location: "New York, NY",
      businessHours: "Open until 11:00 PM",
      description: "Contemporary fusion cuisine featuring locally sourced ingredients and innovative culinary techniques. Experience extraordinary flavors in an elegant atmosphere.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      href: "/us/ny/new-york/urban-fusion-kitchen",
      trustScore: 4.9,
      verified: true
    },
    {
      name: "Elite Auto Services",
      category: "Auto Repair", 
      rating: 4.8,
      reviewCount: 189,
      location: "Denver, CO",
      businessHours: "Open until 6:00 PM",
      description: "Professional automotive repair and maintenance services. From oil changes to engine rebuilds, our certified technicians keep your vehicle running at peak performance.",
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      href: "/us/co/denver/elite-auto-services",
      trustScore: 4.8,
      verified: true
    }
  ];
  
  const currentBusiness = heroBusinesses[currentHero];
  const trendingBusinesses = getRandomBusinesses(8);
  const restaurantBusinesses = getRandomBusinesses(8);
  const professionalServices = getRandomBusinesses(8);
  const autoServices = getRandomBusinesses(8);
  const healthWellness = getRandomBusinesses(8);

  const nextHero = () => {
    setCurrentHero((prev) => (prev + 1) % heroBusinesses.length);
  };

  const prevHero = () => {
    setCurrentHero((prev) => (prev - 1 + heroBusinesses.length) % heroBusinesses.length);
  };

  return (
    <>
      {/* Netflix Hero Section */}
      <section className="relative h-[100vh] overflow-hidden bg-neutral-950">
        <div className="absolute inset-0">
          <Image
            alt={currentBusiness.name}
            src={currentBusiness.image}
            fill
            className="object-cover transition-all duration-1000 ease-in-out"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        {/* Hero Navigation */}
        <button 
          onClick={prevHero}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-neutral-950/50 backdrop-blur-sm text-white hover:bg-neutral-950/70 transition-all duration-200"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button 
          onClick={nextHero}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-neutral-950/50 backdrop-blur-sm text-white hover:bg-neutral-950/70 transition-all duration-200"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="relative z-10 h-full flex items-center">
          <div className="px-4 sm:px-6 lg:px-16 xl:px-24 max-w-screen-2xl mx-auto w-full">
            <div className="max-w-2xl xl:max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold">
                  THORBIS ORIGINAL
                </div>
                <span className="text-white/80 text-lg font-medium">{currentBusiness.category}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                {currentBusiness.name}
              </h1>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-white font-semibold text-lg">{currentBusiness.trustScore || currentBusiness.rating}</span>
                  <span className="text-white/70 text-base">Trust Score</span>
                  {currentBusiness.verified && (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-sm font-medium">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-base">{currentBusiness.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <span className="text-green-400 text-base font-medium">{currentBusiness.businessHours}</span>
                </div>
              </div>

              <p className="text-white/90 text-lg xl:text-xl leading-relaxed mb-10 max-w-3xl">
                {currentBusiness.description}
              </p>

              <div className="flex items-center gap-6">
                <Link 
                  href={currentBusiness.href}
                  className="flex items-center justify-center gap-3 bg-white text-black px-12 py-4 rounded font-bold text-xl hover:bg-white/90 transition-all duration-200"
                >
                  <Play className="w-8 h-8 fill-current" />
                  View Business
                </Link>
                <button className="flex items-center justify-center gap-3 bg-gray-600/70 backdrop-blur-sm text-white px-12 py-4 rounded font-bold text-xl hover:bg-gray-600/90 transition-all duration-200">
                  <Info className="w-8 h-8" />
                  More Info
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroBusinesses.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHero(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentHero ? 'bg-white' : 'bg-white/30'
              }'}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </section>

      {/* Netflix-style Category Rows */}
      <div className="bg-neutral-950 min-h-screen pb-20">
        {/* Trending Now */}
        <div className="px-4 lg:px-16 mb-16">
          <h2 className="text-white text-2xl font-bold mb-6 hover:text-gray-300 transition-colors cursor-pointer">
            Trending Now
          </h2>
          <div className="relative group">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {trendingBusinesses.map((business) => (
                <EnhancedBusinessCard key={business.id} business={business} isTrending={true} />
              ))}
            </div>
          </div>
        </div>

        {/* Top Rated Restaurants */}
        <div className="px-4 lg:px-16 mb-16">
          <h2 className="text-white text-2xl font-bold mb-6 hover:text-gray-300 transition-colors cursor-pointer">
            Top Rated Restaurants
          </h2>
          <div className="relative group">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {restaurantBusinesses.map((business) => (
                <EnhancedBusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </div>

        {/* Professional Services */}
        <div className="px-4 lg:px-16 mb-16">
          <h2 className="text-white text-2xl font-bold mb-6 hover:text-gray-300 transition-colors cursor-pointer">
            Professional Services
          </h2>
          <div className="relative group">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {professionalServices.map((business) => (
                <EnhancedBusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </div>

        {/* Auto Services */}
        <div className="px-4 lg:px-16 mb-16">
          <h2 className="text-white text-2xl font-bold mb-6 hover:text-gray-300 transition-colors cursor-pointer">
            Auto & Repair Services
          </h2>
          <div className="relative group">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {autoServices.map((business) => (
                <EnhancedBusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </div>

        {/* Health & Wellness */}
        <div className="px-4 lg:px-16 mb-16">
          <h2 className="text-white text-2xl font-bold mb-6 hover:text-gray-300 transition-colors cursor-pointer">
            Health & Wellness
          </h2>
          <div className="relative group">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {healthWellness.map((business) => (
                <EnhancedBusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </div>

        {/* Recently Added */}
        <div className="px-4 lg:px-16 mb-16">
          <h2 className="text-white text-2xl font-bold mb-6 hover:text-gray-300 transition-colors cursor-pointer">
            Recently Added
          </h2>
          <div className="relative group">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {getRandomBusinesses(8).map((business) => (
                <EnhancedBusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </div>

        {/* Because You Viewed */}
        <div className="px-4 lg:px-16 mb-16">
          <h2 className="text-white text-2xl font-bold mb-6 hover:text-gray-300 transition-colors cursor-pointer">
            Because You Viewed "Serenity Day Spa"
          </h2>
          <div className="relative group">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {getRandomBusinesses(8).map((business) => (
                <EnhancedBusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
