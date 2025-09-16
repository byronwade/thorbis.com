"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

interface BusinessCardProps {
  business: {
    id: string;
    name: string;
    image: string;
    industry: string;
    rating: number;
    location: string;
    services?: string[];
    href: string;
  };
  size?: "small" | "medium" | "large";
}

export function BusinessCard({ business, size = "medium" }: BusinessCardProps) {
  const sizeClasses = {
    small: "w-64 h-36",
    medium: "w-80 h-48", 
    large: "w-96 h-64"
  };

  const textSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg"
  };

  return (
    <Link 
      href={business.href}
      className={`${sizeClasses[size]} group relative rounded-lg overflow-hidden bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:z-10 flex-shrink-0`}
    >
      {/* Business Image */}
      <div className="relative w-full h-2/3 overflow-hidden">
        <Image
          src={business.image}
          alt={business.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Industry tag */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-neutral-950/60 text-white text-xs font-medium rounded backdrop-blur-sm">
            {business.industry}
          </span>
        </div>
      </div>

      {/* Business Info */}
      <div className="p-4 h-1/3 flex flex-col justify-between">
        <div>
          <h3 className={`font-semibold text-foreground ${textSizes[size]} mb-1 line-clamp-1`}>
            {business.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
            {business.location}
          </p>
        </div>
        
        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium text-foreground">{business.rating}</span>
          <span className="text-xs text-muted-foreground ml-1">
            ({Math.floor(Math.random() * 200 + 50)} reviews)
          </span>
        </div>
      </div>
    </Link>
  );
}