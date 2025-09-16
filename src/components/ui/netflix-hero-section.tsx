"use client";

import Image from "next/image";
import { 
  Star, 
  MapPin, 
  Clock, 
  Heart, 
  Share2, 
  Play, 
  Info 
} from "lucide-react";

interface NetflixHeroSectionProps {
  title: string;
  subtitle: string;
  category?: string;
  backgroundImage?: string;
  rating?: number;
  reviewCount?: number;
  location?: string;
  businessHours?: string;
}

export function NetflixHeroSection({ 
  title, 
  subtitle, 
  category,
  backgroundImage = "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  rating = 4.9,
  reviewCount = 187,
  location = "Industrial District",
  businessHours = "Open until 6:00 PM"
}: NetflixHeroSectionProps) {
  return (
    <section className="relative h-[85vh] sm:h-[90vh] lg:h-screen overflow-hidden bg-background">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          alt={title}
          fill
          className="object-cover transition-all duration-1000 ease-in-out"
          src={backgroundImage}
          sizes="100vw"
          priority
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent lg:to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="px-4 sm:px-6 lg:px-12 xl:px-16 max-w-screen-2xl mx-auto w-full">
          
          {/* Mobile Layout */}
          <div className="block lg:hidden">
            <div className="flex flex-col justify-end h-full pb-8 sm:pb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/20 backdrop-blur-sm border border-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-semibold">
                    FEATURED
                  </div>
                  <span className="text-muted-foreground/80 text-sm font-medium">{category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2.5 rounded-full backdrop-blur-sm border transition-all duration-200 bg-background/20 border-border/50 text-muted-foreground hover:text-foreground">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 rounded-full bg-background/20 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {title}
              </h1>
              
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary fill-current" />
                    <span className="text-foreground font-semibold text-base">{rating}</span>
                    <span className="text-muted-foreground text-sm">({reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">{location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-primary text-sm font-medium">{businessHours}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 max-w-lg">
                {subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 flex items-center justify-center gap-3 bg-primary text-primary-foreground px-6 py-4 rounded-xl font-semibold text-base hover:bg-primary/90 transition-all duration-200 active:scale-95">
                  <Play className="w-5 h-5 fill-current" />
                  View Business
                </button>
                <button className="flex items-center justify-center gap-3 bg-background/20 backdrop-blur-sm border border-border/50 text-foreground px-6 py-4 rounded-xl font-semibold text-base hover:bg-background/30 transition-all duration-200 active:scale-95">
                  <Info className="w-5 h-5" />
                  More Info
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="max-w-2xl xl:max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm font-semibold">
                  FEATURED
                </div>
                <span className="text-muted-foreground text-lg font-medium">{category}</span>
              </div>
              
              <h1 className="text-5xl xl:text-6xl 2xl:text-7xl font-bold text-foreground mb-6 leading-tight">
                {title}
              </h1>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary fill-current" />
                  <span className="text-foreground font-semibold text-lg">{rating}</span>
                  <span className="text-muted-foreground text-base">({reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground text-base">{location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-primary text-base font-medium">{businessHours}</span>
                </div>
              </div>
              
              <p className="text-muted-foreground text-lg xl:text-xl leading-relaxed mb-8 max-w-2xl">
                {subtitle}
              </p>
              
              <div className="flex items-center gap-4">
                <button className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all duration-200">
                  <Play className="w-6 h-6 fill-current" />
                  View Business
                </button>
                <button className="flex items-center justify-center gap-3 bg-background/20 backdrop-blur-sm border border-border/50 text-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-background/30 transition-all duration-200">
                  <Info className="w-6 h-6" />
                  More Info
                </button>
                <button className="p-3 rounded-full backdrop-blur-sm border transition-all duration-200 bg-background/20 border-border/50 text-muted-foreground hover:text-foreground">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="p-3 rounded-full bg-background/20 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-all duration-200">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        <button className="w-2 h-2 rounded-full transition-all duration-300 bg-muted-foreground/30" />
        <button className="w-2 h-2 rounded-full transition-all duration-300 bg-primary" />
        <button className="w-2 h-2 rounded-full transition-all duration-300 bg-muted-foreground/30" />
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}