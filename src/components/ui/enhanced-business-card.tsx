"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, TrendingUp, Verified, Phone, ExternalLink, Award } from "lucide-react";

interface EnhancedBusinessCardProps {
  business: {
    id: string;
    name: string;
    image: string;
    industry: string;
    rating: number;
    location: string;
    services?: string[];
    href: string;
    phone?: string;
    businessHours?: string;
    isOpen?: boolean;
  };
  isSponsored?: boolean;
  isVerified?: boolean;
  isTrending?: boolean;
  size?: "small" | "medium" | "large";
}

export function EnhancedBusinessCard({ 
  business, 
  isSponsored = false,
  isVerified = true,
  isTrending = false,
  size = "medium" 
}: EnhancedBusinessCardProps) {
  const sizeClasses = {
    small: "w-[280px] sm:w-[320px] md:w-[360px]",
    medium: "w-[280px] sm:w-[320px] md:w-[360px]", 
    large: "w-[280px] sm:w-[320px] md:w-[360px]"
  };

  return (
    <div className="flex-none relative w-[200px] sm:w-[250px] md:w-[280px] snap-start">
      <div className="group/card relative h-[280px] sm:h-[320px]">
        <Link 
          href={business.href}
          className="block w-full h-full"
          data-business-card="true"
          data-business-id={business.id}
          data-business-name={business.name}
          data-business-category={business.industry}
        >
          <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 hover:z-50 cursor-pointer">
            {/* Business Image */}
            <div className="relative h-full overflow-hidden rounded-lg">
              <Image
                src={business.image}
                alt={business.name}
                fill
                className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover/card:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Dark gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover/card:opacity-80 transition-opacity duration-300" />

              {/* Rating Badge - Top Right */}
              <div className="absolute top-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 delay-100">
                <div className="flex items-center gap-1 px-2 py-1 bg-neutral-950/80 backdrop-blur-sm rounded text-white text-xs font-semibold">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  {business.trustScore || business.rating}
                  {business.blockchain?.verified && (
                    <Verified className="w-3 h-3 text-blue-400 ml-1" />
                  )}
                </div>
              </div>

              {/* Badges - Top Left */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {isSponsored && (
                  <div className="px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                    SPONSORED
                  </div>
                )}
                {isTrending && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                    <TrendingUp className="w-3 h-3" />
                    #1 in Category
                  </div>
                )}
              </div>

              {/* Business Status Indicator - Center (appears on hover) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 delay-200">
                <div className="bg-white/95 hover:bg-white rounded-lg px-4 py-2 transition-all duration-200 hover:scale-105">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${business.isOpen !== false ? 'bg-green-500' : 'bg-red-500'}'}></div>
                    <span className="text-black font-semibold text-sm">
                      {business.isOpen !== false ? 'Open Now' : 'Closed`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Info Overlay - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
                <h3 className="font-bold text-white text-sm sm:text-base leading-tight line-clamp-1 mb-1">
                  {business.name}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-white/80 mb-1">
                  <span className="font-medium">{business.industry}</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate max-w-[80px]">{business.location}</span>
                  </div>
                </div>
                
                {/* Services offered */}
                {business.services && business.services.length > 0 && (
                  <div className="text-xs text-white/70 mb-1 line-clamp-1">
                    {business.services.slice(0, 2).join(" • ")}
                  </div>
                )}
                
                {/* Additional info on hover */}
                <div className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 delay-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/60">
                      {business.completedJobs ? `${business.completedJobs}+ jobs' : '${Math.floor(Math.random() * 300 + 50)} reviews'}
                    </span>
                    {(business.verified || isVerified) && (
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-blue-400" />
                        <span className="text-blue-400 text-xs">Verified</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Business hours */}
                  {business.businessHours && (
                    <div className="flex items-center gap-1 text-xs text-white/70 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{business.businessHours}</span>
                    </div>
                  )}
                  
                  {/* Trust info */}
                  {business.responseTime && (
                    <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                      <span>Responds {business.responseTime}</span>
                      {business.blockchain?.verified && (
                        <span className="text-blue-400">Blockchain ✓</span>
                      )}
                    </div>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white text-black py-1.5 px-3 rounded text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      View Business
                    </button>
                    {business.phone && (
                      <button className="bg-blue-600/80 text-white p-1.5 rounded hover:bg-blue-600 transition-colors" title="Call now">
                        <Phone className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}