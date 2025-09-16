"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Play } from "lucide-react";

interface ContinueExploringSectionProps {
  title: string;
  subtitle: string;
  businesses: Array<{
    id: string;
    name: string;
    image: string;
    industry: string;
    rating: number;
    location: string;
    href: string;
  }>;
  showProgress?: boolean;
}

export function ContinueExploringSection({ 
  title, 
  subtitle, 
  businesses, 
  showProgress = false 
}: ContinueExploringSectionProps) {
  return (
    <section className="py-12 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {title}
          </h2>
          <p className="text-neutral-400 text-base">
            {subtitle}
          </p>
        </div>
        
        {/* Business cards grid */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth">
          <div className="flex gap-4 min-w-max">
            {businesses.map((business, index) => (
              <div key={business.id} className="relative">
                <Link 
                  href={business.href}
                  className="w-72 h-40 group relative rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-all duration-300 hover:scale-105 hover:shadow-xl flex-shrink-0 block"
                >
                  {/* Business Image */}
                  <div className="relative w-full h-full overflow-hidden">
                    <Image
                      src={business.image}
                      alt={business.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    
                    {/* Play button overlay for recently viewed */}
                    {showProgress && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                        </div>
                      </div>
                    )}
                    
                    {/* Business info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                        {business.name}
                      </h3>
                      <p className="text-neutral-300 text-sm mb-2 line-clamp-1">
                        {business.location}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-white">{business.rating}</span>
                        </div>
                        
                        <span className="text-xs text-neutral-400 bg-neutral-950/50 px-2 py-1 rounded">
                          {business.industry}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar for recently viewed */}
                  {showProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-neutral-800">
                      <div 
                        className="h-full bg-red-500 transition-all duration-300 group-hover:bg-red-400"
                        style={{ width: `${Math.floor(Math.random() * 60 + 20)}%` }}
                      />
                    </div>
                  )}
                </Link>
                
                {/* Recently viewed indicator */}
                {showProgress && (
                  <div className="mt-2 text-neutral-500 text-xs">
                    Recently viewed • {Math.floor(Math.random() * 7 + 1)} days ago
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}